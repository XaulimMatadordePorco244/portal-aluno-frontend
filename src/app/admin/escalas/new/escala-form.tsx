"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Funcao, TipoEscala, Usuario, PerfilAluno, Cargo } from '@prisma/client';
import { toast } from 'sonner';
import { PlusCircle, Save, Trash2, ChevronsUpDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

type ItemState = {
  id: string;
  funcaoId: string;
  horarioInicio: string;
  horarioFim: string;
  userId: string;
  tema: string;
  auxiliarUserId: string;
};

type SecaoState = {
  id: string;
  nome: string;
  categoriaEsperada: string;
  permiteMultiplosItens: boolean;
  isSecaoAdmin: boolean;
  isSecaoPalestrante: boolean;
  itens: ItemState[];
};

type FuncaoAdminType = {
  id: string;
  nome: string;
  setor: string | null;
};

type SecaoTemplate = {
  nome: string;
  total: number;
  categoriaEsperada: string;
  permiteMultiplosItens: boolean;
  isSecaoAdmin: boolean;
  isSecaoPalestrante: boolean;
  itemFuncoes: string[];
  inicio: string;
  fim: string;
};

type UserComDados = Usuario & {
  perfilAluno: (PerfilAluno & {
    funcao: Funcao | null;
    cargo: Cargo | null;
  }) | null;
  funcaoAdmin?: FuncaoAdminType | null; 
  funcaoAdminId?: string | null;
};

export const GABARITO_COLABORACAO = {
  tituloPadrao: "ESCALA DE COLABORAÇÃO",
  fardamento: "- OS COMANDOS: COMPARECER FARDADOS.\n- OS ESCALADOS PARA LIMPEZA: COMPARECER DE TFM.\n- OS DEMAIS ALUNOS SE APRESETAR DE UNIFORME 1.",
  observacoes: "- O HASTEAMENTO DO PAVILHÃO NACIONAL: 13:25H.\n- SUSPENSÃO (-4 PONTOS): ...\n- A PALESTRA DEVERÁ TER O TEMPO DE 3MIN À 5MIN.",
  secoes: [
    { nome: 'DIRETORIA', total: 1, categoriaEsperada: 'ADMIN', permiteMultiplosItens: false, isSecaoAdmin: true, isSecaoPalestrante: false, itemFuncoes: ["PRESIDENTE"], inicio: '13:00', fim: '17:45' },
    { nome: 'COORDENAÇÃO', total: 3, categoriaEsperada: 'ADMIN', permiteMultiplosItens: true, isSecaoAdmin: true, isSecaoPalestrante: false, itemFuncoes: ["COORDENADOR", "AUXILIAR ADM.", "AUXILIAR ADM."], inicio: '13:00', fim: '17:45' },
    { nome: 'COMANDO GERAL', total: 1, categoriaEsperada: 'COMANDO_GERAL', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["COMANDANTE GERAL"], inicio: '13:25', fim: '17:45' },
    { nome: 'COMANDOS', total: 4, categoriaEsperada: 'COMANDOS', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["COMANDANTE", "SUB COMANDANTE", "COMP. EQUIPE", "COMP. EQUIPE"], inicio: '13:00', fim: '17:45' },
    { nome: 'CHEFE DE TURMA', total: 3, categoriaEsperada: 'CHEFE_TURMA', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["CHEFE DE TURMA - 1ª CIA", "CHEFE DE TURMA - 2ª CIA", "CHEFE DE TURMA - 3ª CIA"], inicio: '13:00', fim: '17:45' },
    { nome: 'GUARDA BANDEIRA', total: 3, categoriaEsperada: 'GUARDA_BANDEIRA', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["GUARDA BANDEIRA - MS", "GUARDA BANDEIRA - NV", "GUARDA BANDEIRA - BR"], inicio: '13:00', fim: '17:45' },
    { nome: 'PALESTRANTE', total: 1, categoriaEsperada: '', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: true, itemFuncoes: [], inicio: '13:00', fim: '17:45' },
    { nome: 'ESCALA EXTRA', total: 5, categoriaEsperada: 'ESCALA_EXTRA', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["AUXILIAR", "AUXILIAR", "AUXILIAR", "AUXILIAR", "AUXILIAR"], inicio: '13:00', fim: '17:45' },
  ]
};

export const GABARITO_SABADO = {
  tituloPadrao: "ESCALA ESPECIAL (SÁBADO)",
  fardamento: "- OS ESCALADOS DEVEM COMPARECER DE TFM.",
  observacoes: "- SUSPENSÃO (-4 PONTOS): SERÁ APLICADA AO ALUNO QUE SE AUSENTAR...\n- NÃO SERÁ SERVIDO LANCHE AOS ALUNOS, VENHAM ALIMENTADOS.",
  secoes: [
    { nome: 'COORDENAÇÃO', total: 1, categoriaEsperada: 'ADMIN', permiteMultiplosItens: true, isSecaoAdmin: true, isSecaoPalestrante: false, itemFuncoes: ["AUXILIAR ADM."], inicio: '07:30', fim: '11:00' },
    { nome: 'ESCALA EXTRA', total: 6, categoriaEsperada: 'ESCALA_EXTRA', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["COMANDANTE DO DIA", "COMP. EQUIPE", "COMP. EQUIPE", "COMP. EQUIPE", "COMP. EQUIPE", "COMP. EQUIPE"], inicio: '07:30', fim: '11:00' },
  ]
};

export const GABARITO_EVENTOS = {
  tituloPadrao: "ESCALA DE EVENTO",
  fardamento: "- OS ESCALADOS COMPARECER DE UNIFORME 1.",
  observacoes: "- AUTORIZADO O USO DO AGASALHO EM CASO DE MAU TEMPO...\n- SUSPENSÃO (-4 PONTOS)...",
  secoes: [
    { nome: 'COORDENAÇÃO', total: 1, categoriaEsperada: 'ADMIN', permiteMultiplosItens: true, isSecaoAdmin: true, isSecaoPalestrante: false, itemFuncoes: ["AUXILIAR ADM."], inicio: '18:45', fim: '21:45' },
    { nome: 'ESCALA EXTRA', total: 9, categoriaEsperada: 'ESCALA_EXTRA', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: Array(9).fill("AUXILIAR"), inicio: '18:45', fim: '21:45' },
  ]
};

export const MODELOS_SECAO = [
  { nome: 'DIRETORIA', total: 1, categoriaEsperada: 'ADMIN', permiteMultiplosItens: true, isSecaoAdmin: true, isSecaoPalestrante: false, itemFuncoes: ["PRESIDENTE"], inicio: '13:00', fim: '17:45' },
  { nome: 'COORDENAÇÃO', total: 1, categoriaEsperada: 'ADMIN', permiteMultiplosItens: true, isSecaoAdmin: true, isSecaoPalestrante: false, itemFuncoes: ["COORDENADOR"], inicio: '13:00', fim: '17:45' },
  { nome: 'COMANDO GERAL', total: 1, categoriaEsperada: 'COMANDO_GERAL', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["COMANDANTE GERAL"], inicio: '13:25', fim: '17:45' },
  { nome: 'COMANDOS', total: 4, categoriaEsperada: 'COMANDOS', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["COMANDANTE", "SUB COMANDANTE", "COMP. EQUIPE", "COMP. EQUIPE"], inicio: '13:00', fim: '17:45' },
  { nome: 'CHEFE DE TURMA', total: 3, categoriaEsperada: 'CHEFE_TURMA', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["CHEFE DE TURMA - 1ª CIA", "CHEFE DE TURMA - 2ª CIA", "CHEFE DE TURMA - 3ª CIA"], inicio: '13:00', fim: '17:45' },
  { nome: 'GUARDA BANDEIRA', total: 3, categoriaEsperada: 'GUARDA_BANDEIRA', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["GUARDA BANDEIRA - MS", "GUARDA BANDEIRA - NV", "GUARDA BANDEIRA - BR"], inicio: '13:00', fim: '17:45' },
  { nome: 'PALESTRANTE', total: 1, categoriaEsperada: '', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: true, itemFuncoes: [], inicio: '13:00', fim: '17:45' },
  { nome: 'ESCALA EXTRA', total: 3, categoriaEsperada: 'ESCALA_EXTRA', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["AUXILIAR", "AUXILIAR", "AUXILIAR"], inicio: '13:00', fim: '17:45' },
  { nome: 'NOVA SEÇÃO (ALUNOS)', total: 1, categoriaEsperada: '', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: [""], inicio: '13:00', fim: '17:45' },
  { nome: 'NOVA SEÇÃO (ADMINS)', total: 1, categoriaEsperada: 'ADMIN', permiteMultiplosItens: true, isSecaoAdmin: true, isSecaoPalestrante: false, itemFuncoes: [""], inicio: '13:00', fim: '17:45' }
];

export function EscalaForm({ 
  alunos, 
  admins, 
  funcoes, 
  funcoesAdmin,
  elaboradorPadrao 
}: { 
  alunos: UserComDados[], 
  admins: UserComDados[], 
  funcoes: (Funcao & { categoria: string | null })[], 
  funcoesAdmin: FuncaoAdminType[],
  elaboradorPadrao: string 
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [tituloEscala, setTituloEscala] = useState('');
  
  const [tipoEscala, setTipoEscala] = useState<TipoEscala | ''>('');
  const [dataEscala, setDataEscala] = useState('');
  const [elaboradoPor, setElaboradoPor] = useState(elaboradorPadrao);
  const [secoes, setSecoes] = useState<SecaoState[]>([]);
  const [fardamento, setFardamento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  const [modeloSelecionado, setModeloSelecionado] = useState<string>('');

  const criarSecaoDoTemplate = useCallback((secaoTemplate: SecaoTemplate, adminsJaAlocados: Set<string> = new Set()): SecaoState => {
    const itens = Array.from({ length: secaoTemplate.total }, (v, i): ItemState => {
      const funcaoNome = secaoTemplate.itemFuncoes[i]?.toUpperCase() || '';
      
      let funcaoPredefinidaId = ''; 
      let userIdPreenchido = '';

      if (secaoTemplate.isSecaoAdmin) {
        const fAdmin = funcoesAdmin.find(f => f.nome.toUpperCase() === funcaoNome);
        if (fAdmin) {
          funcaoPredefinidaId = fAdmin.id;
          const adminCorrespondente = admins.find(a => 
            (a.funcaoAdminId === fAdmin.id || a.funcaoAdmin?.id === fAdmin.id) && 
            !adminsJaAlocados.has(a.id)
          );
          if (adminCorrespondente) {
            userIdPreenchido = adminCorrespondente.id;
            adminsJaAlocados.add(adminCorrespondente.id);
          }
        }
      } else {
        const fAluno = funcoes.find(f => f.nome.toUpperCase() === funcaoNome);
        if (fAluno) {
          funcaoPredefinidaId = fAluno.id;
          const alunoCorrespondente = alunos.find(a => a.perfilAluno?.funcao?.id === fAluno.id);
          if (alunoCorrespondente) {
            userIdPreenchido = alunoCorrespondente.id;
          }
        }
      }

      return {
        id: `item-${Math.random()}`,
        funcaoId: funcaoPredefinidaId,
        horarioInicio: secaoTemplate.inicio,
        horarioFim: secaoTemplate.fim,
        userId: userIdPreenchido,
        tema: '',
        auxiliarUserId: '',
      };
    });
    
    return { ...secaoTemplate, id: `secao-${Math.random()}`, itens };
  }, [admins, alunos, funcoes, funcoesAdmin]);

  useEffect(() => {
    let gabarito = null;

    if (tipoEscala === 'COLABORACAO') gabarito = GABARITO_COLABORACAO;
    else if (tipoEscala === 'ESPECIAL') gabarito = GABARITO_SABADO;
    else if (tipoEscala === 'EVENTO') gabarito = GABARITO_EVENTOS;

    if (gabarito) {
      setTituloEscala(gabarito.tituloPadrao);
      setFardamento(gabarito.fardamento);
      setObservacoes(gabarito.observacoes);

      const adminsJaAlocados = new Set<string>();
      const secoesDoGabarito = gabarito.secoes.map(template => criarSecaoDoTemplate(template, adminsJaAlocados));
      setSecoes(secoesDoGabarito);

    } else if (tipoEscala === 'PERSONALIZADO') {
      setTituloEscala(''); 
      setSecoes([]);
      setFardamento('');
      setObservacoes('');
    }
  }, [tipoEscala, criarSecaoDoTemplate]);

  const handleAddItem = (secaoIndex: number) => {
    const novasSecoes = [...secoes];
    const secao = novasSecoes[secaoIndex];
    const ultimaFuncaoId = secao.itens[secao.itens.length - 1]?.funcaoId || '';
    const ultimoInicio = secao.itens[secao.itens.length - 1]?.horarioInicio || '13:00';
    const ultimoFim = secao.itens[secao.itens.length - 1]?.horarioFim || '17:45';
    
    secao.itens.push({ 
      id: `item-${Math.random()}`, 
      funcaoId: ultimaFuncaoId, 
      horarioInicio: ultimoInicio, 
      horarioFim: ultimoFim, 
      userId: '', 
      tema: '', 
      auxiliarUserId: '' 
    });
    setSecoes(novasSecoes);
  };

  const handleRemoveItem = (secaoIndex: number, itemIndex: number) => {
    const novasSecoes = [...secoes];
    if (novasSecoes[secaoIndex].permiteMultiplosItens || novasSecoes[secaoIndex].itens.length > 1) {
      novasSecoes[secaoIndex].itens.splice(itemIndex, 1);
      if (novasSecoes[secaoIndex].itens.length === 0 && novasSecoes[secaoIndex].permiteMultiplosItens) {
        handleAddItem(secaoIndex); 
      } else {
        setSecoes(novasSecoes);
      }
    } else {
      toast.info("A secção deve ter pelo menos um item.");
    }
  };

  const handleItemChange = (secaoIndex: number, itemIndex: number, field: keyof ItemState, value: string) => {
    const novasSecoes = [...secoes];
    novasSecoes[secaoIndex].itens[itemIndex] = { ...novasSecoes[secaoIndex].itens[itemIndex], [field]: value };
    setSecoes(novasSecoes);
  };

  const handleAddSecaoTemplate = () => {
    const template = MODELOS_SECAO.find(m => m.nome === modeloSelecionado);
    if (!template) return;
    
    const novaSecao = criarSecaoDoTemplate(template);
    setSecoes([...secoes, novaSecao]);
    setModeloSelecionado('');
  };

  const handleRemoveSecao = (secaoIndex: number) => {
    const novasSecoes = [...secoes];
    novasSecoes.splice(secaoIndex, 1);
    setSecoes(novasSecoes);
  };

  const handleNomeSecaoChange = (secaoIndex: number, novoNome: string) => {
    const novasSecoes = [...secoes];
    novasSecoes[secaoIndex].nome = novoNome;
    setSecoes(novasSecoes);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const todosItens = secoes.flatMap(secao =>
      secao.itens.map(item => {
        let cargoFinal = '';
        let observacaoFinal = null;

        if (secao.isSecaoPalestrante) {
          cargoFinal = item.tema || 'PALESTRA';
          const auxiliar = alunos.find(a => a.id === item.auxiliarUserId);
          if (auxiliar) {
            const nomeAuxiliar = auxiliar.nomeDeGuerra || auxiliar.nome;
            observacaoFinal = `AUXILIAR - ${nomeAuxiliar}`;
          }
        } else {
          const baseDeBusca = secao.isSecaoAdmin ? funcoesAdmin : funcoes;
          const funcaoEncontrada = baseDeBusca.find(f => f.id === item.funcaoId);
          cargoFinal = funcaoEncontrada?.nome || '';
        }

        return {
          secao: secao.nome,
          cargo: cargoFinal,
          horarioInicio: item.horarioInicio,
          horarioFim: item.horarioFim,
          alunoId: item.userId,
          observacao: observacaoFinal,
        }
      })
    ).filter(item => item.alunoId && item.cargo);

    if (todosItens.length === 0) {
      toast.error("Formulário incompleto", { description: "Adicione pelo menos um utilizador válido e garanta que todas as funções estão preenchidas." });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/escalas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: tituloEscala, 
          dataEscala: new Date(dataEscala).toISOString(),
          tipo: tipoEscala,
          elaboradoPor,
          itens: todosItens,
          fardamento,
          observacoes
        })
      });
      if (!response.ok) throw new Error("Falha ao criar a escala.");
      
      toast.success("Sucesso!", { description: "Escala guardada na base de dados." });
      router.push('/admin/escalas');
      router.refresh();
    } catch (error) {
      toast.error("Erro ao criar escala.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Informações Gerais</CardTitle></CardHeader>
        {/* 👉 Ajustei a Grid para acomodar o novo campo "Título da Escala" */}
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <Label htmlFor="tipo">Tipo da Escala</Label>
            <Select value={tipoEscala} onValueChange={(v: TipoEscala) => setTipoEscala(v)} required>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="COLABORACAO">Colaboração</SelectItem>
                <SelectItem value="ESPECIAL">Especial</SelectItem>
                <SelectItem value="EVENTO">Evento</SelectItem>
                <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tituloEscala">Título da Escala</Label>
            <Input 
              id="tituloEscala" 
              value={tituloEscala} 
              onChange={e => setTituloEscala(e.target.value)} 
              placeholder="Ex: Escala de Carnaval..." 
              required 
            />
          </div>
          <div>
            <Label htmlFor="dataEscala">Data da Escala</Label>
            <Input id="dataEscala" type="date" value={dataEscala} onChange={e => setDataEscala(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="elaboradoPor">Elaborado Por</Label>
            <Input id="elaboradoPor" value={elaboradoPor} onChange={e => setElaboradoPor(e.target.value)} required />
          </div>
        </CardContent>
      </Card>

      {/* Renderização das Seções */}
      {secoes.map((secao, secaoIndex) => (
        <Card key={secao.id} className="relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            {tipoEscala === 'PERSONALIZADO' ? (
              <Input
                value={secao.nome}
                onChange={(e) => handleNomeSecaoChange(secaoIndex, e.target.value)}
                className="font-semibold text-lg max-w-sm h-10 border-dashed focus-visible:ring-1"
                placeholder="Nome da Seção..."
              />
            ) : (
              <CardTitle>{secao.nome}</CardTitle>
            )}
            
            {tipoEscala === 'PERSONALIZADO' && (
              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSecao(secaoIndex)} className="text-destructive hover:bg-destructive/10">
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {secao.itens.map((item, itemIndex) => {
              
              const opcoesDeFuncao = secao.isSecaoAdmin 
                ? funcoesAdmin 
                : funcoes.filter(f => f.categoria === secao.categoriaEsperada || !secao.categoriaEsperada);
              
              const podeRemover = secao.permiteMultiplosItens || secao.itens.length > 1;

              return (
                <div key={item.id} className="grid grid-cols-12 gap-x-4 gap-y-2 border p-3 rounded-md relative bg-background hover:bg-muted/10 transition-colors">
                  {secao.isSecaoPalestrante ? (
                    <>
                      <div className="col-span-12 md:col-span-4 space-y-2">
                        <Label>Tema da Palestra</Label>
                        <Input placeholder="Tema..." value={item.tema} onChange={e => handleItemChange(secaoIndex, itemIndex, 'tema', e.target.value)} />
                      </div>
                      <div className="col-span-12 md:col-span-4 space-y-2 min-w-0">
                        <Label>Palestrante</Label>
                        <UserCombobox users={alunos} value={item.userId} onChange={userId => handleItemChange(secaoIndex, itemIndex, 'userId', userId)} />
                      </div>
                      <div className="col-span-12 md:col-span-4 space-y-2 min-w-0">
                        <Label>Auxiliar</Label>
                        <UserCombobox users={alunos} value={item.auxiliarUserId} onChange={userId => handleItemChange(secaoIndex, itemIndex, 'auxiliarUserId', userId)} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-span-12 md:col-span-4 space-y-2 min-w-0">
                        <Label>Função</Label>
                        <Select value={item.funcaoId} onValueChange={value => handleItemChange(secaoIndex, itemIndex, 'funcaoId', value)}>
                          <SelectTrigger className="w-full [&>span]:truncate">
                            <SelectValue placeholder="Selecione a função..." />
                          </SelectTrigger>
                          <SelectContent>
                            {opcoesDeFuncao.map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-12 md:col-span-4 space-y-2 min-w-0">
                        <Label>{secao.isSecaoAdmin ? "Admin" : "Aluno"}</Label>
                        <UserCombobox users={secao.isSecaoAdmin ? admins : alunos} value={item.userId} onChange={userId => handleItemChange(secaoIndex, itemIndex, 'userId', userId)} />
                      </div>
                    </>
                  )}
                  
                  <div className="col-span-6 md:col-span-2 space-y-2">
                    <Label>Início</Label>
                    <Input type="time" value={item.horarioInicio} onChange={e => handleItemChange(secaoIndex, itemIndex, 'horarioInicio', e.target.value)} />
                  </div>
                  <div className="col-span-6 md:col-span-1 space-y-2">
                    <Label>Fim</Label>
                    <Input type="time" value={item.horarioFim} onChange={e => handleItemChange(secaoIndex, itemIndex, 'horarioFim', e.target.value)} />
                  </div>
                  
                  {podeRemover && (
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 opacity-50 hover:opacity-100 hover:bg-destructive/10" onClick={() => handleRemoveItem(secaoIndex, itemIndex)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              );
            })}
            {secao.permiteMultiplosItens && (
              <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem(secaoIndex)} className="w-full border-dashed">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar vaga nesta seção
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      {tipoEscala === 'PERSONALIZADO' && (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="pt-6 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label>Adicionar seção a partir de um modelo</Label>
              <Select value={modeloSelecionado} onValueChange={setModeloSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um modelo de seção..." />
                </SelectTrigger>
                <SelectContent>
                  {MODELOS_SECAO.map((m, i) => (
                    <SelectItem key={i} value={m.nome}>{m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" onClick={handleAddSecaoTemplate} disabled={!modeloSelecionado} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Incluir Seção
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Fardamento e Observações */}
      {secoes.length > 0 && (
        <>
          <Card>
            <CardHeader><CardTitle>Fardamento</CardTitle></CardHeader>
            <CardContent><Textarea value={fardamento} onChange={(e) => setFardamento(e.target.value)} rows={3} placeholder="Escreva o fardamento exigido..." /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Observações</CardTitle></CardHeader>
            <CardContent><Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={5} placeholder="Regras e observações extras..." /></CardContent>
          </Card>
        </>
      )}

      <div className="flex justify-end pt-4 pb-12">
        <Button type="submit" disabled={isSubmitting} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "A Guardar..." : "Guardar Escala"}
        </Button>
      </div>
    </form>
  );
}

function UserCombobox({ users, value, onChange }: { users: UserComDados[], value: string, onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const selectedUser = users.find(u => u.id === value);

  const formatUserDisplay = (user: UserComDados) => {
    const perfil = user.perfilAluno;
    if (perfil) {
      return `${perfil.cargo?.abreviacao || ''} ${user.nomeDeGuerra || user.nome}`.trim();
    }
    return user.nome;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between font-normal [&>span]:truncate min-w-0">
          <span>{selectedUser ? formatUserDisplay(selectedUser) : "Selecione..."}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            <CommandEmpty>Nenhum utilizador.</CommandEmpty>
            <CommandGroup>
              {users.map(user => (
                <CommandItem key={user.id} value={formatUserDisplay(user)} onSelect={() => { onChange(user.id); setOpen(false); }}>
                  {formatUserDisplay(user)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}