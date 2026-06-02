"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, Trash2, Users, Eye, EyeOff } from 'lucide-react';

import { TipoAtividade } from '@prisma/client';

type AlunoSimples = {
  id: string;
  nome: string;
  nomeDeGuerra?: string | null;
  anoIngresso?: number | null; 
  cargoId?: string | null;
  cargoAbreviacao: string;
  companhiaId?: string | null;
};

type OptionItem = {
  id: string;
  nome: string;
};

interface AtividadeFormProps {
  alunosAtivos: AlunoSimples[];
  cargos: OptionItem[];
  companhias: OptionItem[];
}

export function AtividadeForm({ alunosAtivos, cargos, companhias }: AtividadeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoAtividade | ''>('');
  const [prazoEntrega, setPrazoEntrega] = useState('');
  
  const [tipoEnvio, setTipoEnvio] = useState<'TODOS' | 'ESPECIFICOS' | 'TURMAS' | 'COMPANHIAS' | 'CARGOS'>('TODOS');
  
  // Estados para cada filtro
  const [alunosSelecionados, setAlunosSelecionados] = useState<string[]>([]);
  const [alunoTemp, setAlunoTemp] = useState(''); 
  const [anoInicio, setAnoInicio] = useState('');
  const [anoFim, setAnoFim] = useState('');
  const [companhiasSelecionadas, setCompanhiasSelecionadas] = useState<string[]>([]);
  const [cargosSelecionados, setCargosSelecionados] = useState<string[]>([]);

  const [verAlunosTurma, setVerAlunosTurma] = useState(false);

  // Função para formatar o nome do aluno conforme solicitado
  const formatarNomeAluno = (aluno: AlunoSimples) => {
    const nomeFinal = aluno.nomeDeGuerra || aluno.nome.split(' ')[0];
    return `${aluno.cargoAbreviacao} GM ${nomeFinal}`;
  };

  // Helpers de multiseleção
  const toggleCompanhia = (id: string) => {
    setCompanhiasSelecionadas(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleCargo = (id: string) => {
    setCargosSelecionados(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleAddAluno = () => {
    if (alunoTemp && !alunosSelecionados.includes(alunoTemp)) {
      setAlunosSelecionados([...alunosSelecionados, alunoTemp]);
      setAlunoTemp('');
    }
  };

  const handleRemoveAluno = (id: string) => {
    setAlunosSelecionados(alunosSelecionados.filter(a => a !== id));
  };

  // Listas filtradas ativas
  const alunosDaTurma = alunosAtivos.filter(a => {
    if (!a.anoIngresso || !anoInicio) return false;
    const inicio = parseInt(anoInicio);
    const fim = anoFim ? parseInt(anoFim) : inicio; 
    return a.anoIngresso >= inicio && a.anoIngresso <= fim;
  });

  const alunosDasCompanhias = alunosAtivos.filter(a => 
    a.companhiaId && companhiasSelecionadas.includes(a.companhiaId)
  );

  const alunosDosCargos = alunosAtivos.filter(a => 
    a.cargoId && cargosSelecionados.includes(a.cargoId)
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    let idsParaEnviar: string[] = [];

    // VALIDAÇÕES POR TIPO DE ENVIO
    if (tipoEnvio === 'ESPECIFICOS') {
      if (alunosSelecionados.length === 0) {
        toast.error("Selecione pelo menos um aluno para enviar a atividade.");
        setIsSubmitting(false); return;
      }
      idsParaEnviar = alunosSelecionados;
    } else if (tipoEnvio === 'TURMAS') {
      if (!anoInicio) {
        toast.error("Informe o ano de ingresso (turma) para enviar a atividade.");
        setIsSubmitting(false); return;
      }
      if (alunosDaTurma.length === 0) {
        toast.error("Nenhum aluno encontrado para o(s) ano(s) informado(s).");
        setIsSubmitting(false); return;
      }
      idsParaEnviar = alunosDaTurma.map(a => a.id);
    } else if (tipoEnvio === 'COMPANHIAS') {
      if (companhiasSelecionadas.length === 0) {
        toast.error("Selecione pelo menos uma companhia.");
        setIsSubmitting(false); return;
      }
      if (alunosDasCompanhias.length === 0) {
        toast.error("Nenhum aluno encontrado nas companhias selecionadas.");
        setIsSubmitting(false); return;
      }
      idsParaEnviar = alunosDasCompanhias.map(a => a.id);
    } else if (tipoEnvio === 'CARGOS') {
      if (cargosSelecionados.length === 0) {
        toast.error("Selecione pelo menos um cargo.");
        setIsSubmitting(false); return;
      }
      if (alunosDosCargos.length === 0) {
        toast.error("Nenhum aluno encontrado com os cargos selecionados.");
        setIsSubmitting(false); return;
      }
      idsParaEnviar = alunosDosCargos.map(a => a.id);
    }

    try {
      const response = await fetch('/api/atividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          descricao,
          tipo,
          prazoEntrega: prazoEntrega ? new Date(`${prazoEntrega}T12:00:00Z`).toISOString() : null,
          // Sempre que for filtro de grupo, enviamos os IDs e tratamos como 'ESPECIFICOS' pro backend
          tipoEnvio: ['TURMAS', 'COMPANHIAS', 'CARGOS'].includes(tipoEnvio) ? 'ESPECIFICOS' : tipoEnvio, 
          alunosIds: idsParaEnviar
        })
      });

      if (!response.ok) throw new Error("Falha ao criar atividade.");
      
      toast.success("Atividade enviada com sucesso!", { description: "Os alunos foram notificados." });
      router.push('/admin/atividades'); 
      router.refresh();
    } catch (error) {
      toast.error("Erro ao criar atividade.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Componente interno para reuso da caixinha de "Ver Alunos"
  const BoxResumoAlunos = ({ count, list }: { count: number, list: AlunoSimples[] }) => (
    <div className="space-y-3 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-muted-foreground bg-background p-3 rounded-md border">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span><strong>{count}</strong> aluno(s) selecionado(s) para receber.</span>
        </div>
        {count > 0 && (
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => setVerAlunosTurma(!verAlunosTurma)}>
            {verAlunosTurma ? <><EyeOff className="h-3.5 w-3.5" /> Ocultar lista</> : <><Eye className="h-3.5 w-3.5" /> Ver alunos</>}
          </Button>
        )}
      </div>
      {verAlunosTurma && count > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-md bg-background max-h-60 overflow-y-auto">
          {list.map(aluno => (
            <div key={aluno.id} className="p-2 text-xs rounded bg-muted/50 border truncate font-medium">
              {formatarNomeAluno(aluno)}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Nova Atividade / Tarefa</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título da Atividade</Label>
              <Input id="titulo" placeholder="Ex: Cópia do Hino Nacional" value={titulo} onChange={e => setTitulo(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipo} onValueChange={(v: TipoAtividade) => setTipo(v)} required>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="COPIA_HINO">Cópia de Hino</SelectItem>
                  <SelectItem value="REDACAO">Redação</SelectItem>
                  <SelectItem value="LEITURA">Leitura Obrigatória</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição / Instruções</Label>
            <Textarea id="descricao" placeholder="Detalhes do que o aluno deve fazer..." value={descricao} onChange={e => setDescricao(e.target.value)} rows={4} required />
          </div>

          <div className="space-y-2 md:w-1/3">
            <Label htmlFor="prazo">Prazo de Entrega (Opcional)</Label>
            <Input id="prazo" type="date" value={prazoEntrega} onChange={e => setPrazoEntrega(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Destinatários</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 md:w-1/3">
            <Label>Enviar para:</Label>
            <Select 
              value={tipoEnvio} 
              onValueChange={(v: 'TODOS' | 'ESPECIFICOS' | 'TURMAS' | 'COMPANHIAS' | 'CARGOS') => {
                setTipoEnvio(v);
                setVerAlunosTurma(false); // Reseta a exibição da lista ao trocar de aba
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os Alunos Ativos</SelectItem>
                <SelectItem value="COMPANHIAS">Por Companhia</SelectItem>
                <SelectItem value="CARGOS">Por Cargo / Graduação</SelectItem>
                <SelectItem value="TURMAS">Por Turma (Ano de Ingresso)</SelectItem>
                <SelectItem value="ESPECIFICOS">Alunos Específicos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SESSÃO: FILTRO POR COMPANHIAS (Multiseleção) */}
          {tipoEnvio === 'COMPANHIAS' && (
            <div className="space-y-4 p-5 border rounded-md bg-muted/10">
              <Label>Selecione as Companhias:</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {companhias.map(comp => (
                  <label key={comp.id} className="flex items-center space-x-2 bg-background border p-2 rounded cursor-pointer hover:bg-muted/50">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 w-4 h-4"
                      checked={companhiasSelecionadas.includes(comp.id)}
                      onChange={() => toggleCompanhia(comp.id)}
                    />
                    <span className="text-sm font-medium">{comp.nome}</span>
                  </label>
                ))}
              </div>
              <BoxResumoAlunos count={alunosDasCompanhias.length} list={alunosDasCompanhias} />
            </div>
          )}

          {/* SESSÃO: FILTRO POR CARGOS (Multiseleção) */}
          {tipoEnvio === 'CARGOS' && (
            <div className="space-y-4 p-5 border rounded-md bg-muted/10">
              <Label>Selecione os Cargos/Graduações:</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cargos.map(cargo => (
                  <label key={cargo.id} className="flex items-center space-x-2 bg-background border p-2 rounded cursor-pointer hover:bg-muted/50">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 w-4 h-4"
                      checked={cargosSelecionados.includes(cargo.id)}
                      onChange={() => toggleCargo(cargo.id)}
                    />
                    <span className="text-sm font-medium">{cargo.nome}</span>
                  </label>
                ))}
              </div>
              <BoxResumoAlunos count={alunosDosCargos.length} list={alunosDosCargos} />
            </div>
          )}

          {/* SESSÃO: FILTRO POR TURMAS */}
          {tipoEnvio === 'TURMAS' && (
            <div className="space-y-4 p-5 border rounded-md bg-muted/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="anoInicio">Ano de Ingresso (Ex: 2021)</Label>
                  <Input id="anoInicio" type="number" placeholder="Ano inicial ou específico" value={anoInicio} onChange={e => setAnoInicio(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anoFim">Até o ano (Opcional)</Label>
                  <Input id="anoFim" type="number" placeholder="Deixe vazio para apenas 1 ano" value={anoFim} onChange={e => setAnoFim(e.target.value)} />
                </div>
              </div>
              {anoInicio && <BoxResumoAlunos count={alunosDaTurma.length} list={alunosDaTurma} />}
            </div>
          )}

          {/* SESSÃO: FILTRO POR ALUNOS ESPECÍFICOS */}
          {tipoEnvio === 'ESPECIFICOS' && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/10">
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Selecione um aluno</Label>
                  <Select value={alunoTemp} onValueChange={setAlunoTemp}>
                    <SelectTrigger><SelectValue placeholder="Buscar aluno..." /></SelectTrigger>
                    <SelectContent>
                      {alunosAtivos.filter(a => !alunosSelecionados.includes(a.id)).map(aluno => (
                        <SelectItem key={aluno.id} value={aluno.id}>
                          {formatarNomeAluno(aluno)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="secondary" onClick={handleAddAluno}>Adicionar</Button>
              </div>

              {alunosSelecionados.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {alunosSelecionados.map(id => {
                    const aluno = alunosAtivos.find(a => a.id === id);
                    if (!aluno) return null;
                    return (
                      <div key={id} className="flex justify-between items-center p-2 text-sm border rounded bg-background font-medium">
                        <span className="truncate">{formatarNomeAluno(aluno)}</span>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveAluno(id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2 pb-12">
        <Button type="submit" disabled={isSubmitting} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "A Enviar..." : "Guardar e Enviar Tarefa"}
        </Button>
      </div>
    </form>
  );
}