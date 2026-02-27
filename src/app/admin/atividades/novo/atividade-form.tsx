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
import { Save, Trash2 } from 'lucide-react';

import { TipoAtividade } from '@prisma/client';

type AlunoSimples = {
  id: string;
  nome: string;
  nomeDeGuerra?: string | null;
};

export function AtividadeForm({ alunosAtivos }: { alunosAtivos: AlunoSimples[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoAtividade | ''>('');
  const [prazoEntrega, setPrazoEntrega] = useState('');
  
  const [tipoEnvio, setTipoEnvio] = useState<'TODOS' | 'ESPECIFICOS'>('TODOS');
  const [alunosSelecionados, setAlunosSelecionados] = useState<string[]>([]);
  const [alunoTemp, setAlunoTemp] = useState(''); 

  const handleAddAluno = () => {
    if (alunoTemp && !alunosSelecionados.includes(alunoTemp)) {
      setAlunosSelecionados([...alunosSelecionados, alunoTemp]);
      setAlunoTemp('');
    }
  };

  const handleRemoveAluno = (id: string) => {
    setAlunosSelecionados(alunosSelecionados.filter(a => a !== id));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (tipoEnvio === 'ESPECIFICOS' && alunosSelecionados.length === 0) {
      toast.error("Selecione pelo menos um aluno para enviar a atividade.");
      setIsSubmitting(false);
      return;
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
          tipoEnvio,
          alunosIds: alunosSelecionados
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
            <Select value={tipoEnvio} onValueChange={(v: 'TODOS' | 'ESPECIFICOS') => setTipoEnvio(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os Alunos Ativos</SelectItem>
                <SelectItem value="ESPECIFICOS">Alunos Específicos</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                          {aluno.nomeDeGuerra ? `${aluno.nomeDeGuerra} (${aluno.nome})` : aluno.nome}
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
                    return (
                      <div key={id} className="flex justify-between items-center p-2 text-sm border rounded bg-background">
                        <span className="truncate">{aluno?.nomeDeGuerra || aluno?.nome}</span>
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