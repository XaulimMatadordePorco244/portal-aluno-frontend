"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { startOfDay, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, CheckCircle2, BookOpen, AlertCircle } from "lucide-react";
import { StatusAtividade, TipoAtividade } from "@prisma/client";

export const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export const formatCivilDate = (date: Date | string) => {
  return format(startOfDay(parseISO(date.toString())), 'dd/MM/yyyy', { locale: ptBR });
};

type AtividadeAluno = {
  id: string;
  status: StatusAtividade;
  atividade: {
    titulo: string;
    descricao: string;
    tipo: TipoAtividade;
    prazoEntrega: Date | null;
  };
};

export function AtividadesList({ atividadesIniciais }: { atividadesIniciais: AtividadeAluno[] }) {
  const [atividades, setAtividades] = useState(atividadesIniciais);
  const [atividadeAberta, setAtividadeAberta] = useState<AtividadeAluno | null>(null);

  const abrirTarefa = async (vinculo: AtividadeAluno) => {
    setAtividadeAberta(vinculo); 

    if (vinculo.status === 'PENDENTE') {
      try {
        await fetch('/api/atividades/visualizar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ atividadeAlunoId: vinculo.id })
        });

        setAtividades(prev => prev.map(a => 
          a.id === vinculo.id ? { ...a, status: 'VISUALIZADO' } : a
        ));
      } catch (error) {
        console.error("Falha ao registar leitura silenciosa", error);
      }
    }
  };

  const getStatusBadge = (status: StatusAtividade) => {
    switch (status) {
      case 'PENDENTE': 
        return <Badge className="bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-pulse">NOVA TAREFA</Badge>;
      case 'VISUALIZADO': 
        return <Badge variant="secondary" className="bg-secondary text-secondary-foreground">Em Andamento</Badge>;
      case 'REALIZADO': 
        return <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground">Realizada</Badge>;
      case 'NAO_REALIZADO': 
        return <Badge variant="destructive" className="bg-destructive/80 text-destructive-foreground">Não Realizada</Badge>;
      default: 
        return null;
    }
  };

  return (
    <>
      {atividades.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/10 text-muted-foreground">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-primary/50" />
          <h3 className="text-lg font-medium">Tudo em dia!</h3>
          <p>Você não tem nenhuma atividade pendente no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {atividades.map((vinculo) => (
            <Card key={vinculo.id} className={`transition-all hover:shadow-md ${vinculo.status === 'PENDENTE' ? 'border-destructive/30 bg-destructive/5' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  {getStatusBadge(vinculo.status)}
                  <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
                    {vinculo.atividade.tipo.replace('_', ' ')}
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-2">{vinculo.atividade.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                {vinculo.atividade.prazoEntrega && (
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <AlertCircle className="w-4 h-4 mr-1.5" />
                    Prazo: <strong className="ml-1 text-foreground">{formatDate(vinculo.atividade.prazoEntrega)}</strong>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={vinculo.status === 'PENDENTE' ? 'default' : 'outline'} onClick={() => abrirTarefa(vinculo)}>
                  {vinculo.status === 'PENDENTE' ? <><BookOpen className="w-4 h-4 mr-2" /> Abrir Tarefa</> : <><Eye className="w-4 h-4 mr-2" /> Ver Detalhes</>}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!atividadeAberta} onOpenChange={(open) => !open && setAtividadeAberta(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">{atividadeAberta?.atividade.tipo.replace('_', ' ')}</Badge>
              {atividadeAberta?.atividade.prazoEntrega && (
                <span className="text-sm font-semibold text-destructive">
                  Prazo: {formatDate(atividadeAberta.atividade.prazoEntrega)}
                </span>
              )}
            </div>
            <DialogTitle className="text-2xl">{atividadeAberta?.atividade.titulo}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 p-4 bg-muted/20 rounded-md border min-h-[150px] whitespace-pre-wrap">
            {atividadeAberta?.atividade.descricao}
          </div>

          
        </DialogContent>
      </Dialog>
    </>
  );
}