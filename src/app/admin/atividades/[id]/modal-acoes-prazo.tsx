"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarClock, AlertTriangle, Save, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ModalAcoesPrazo({ 
  atividadeId, 
  prazoAtual 
}: { 
  atividadeId: string;
  prazoAtual: Date | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const dataFormatadaParaInput = prazoAtual 
    ? format(new Date(prazoAtual), "yyyy-MM-dd'T'HH:mm") 
    : "";
    
  const [novoPrazo, setNovoPrazo] = useState(dataFormatadaParaInput);

  const handleEstenderPrazo = async () => {
    if (!novoPrazo) {
      toast.error("Selecione uma data e hora válidas.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/atividades/${atividadeId}/prazo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novoPrazo: new Date(novoPrazo).toISOString() })
      });

      if (!res.ok) throw new Error("Falha ao atualizar");
      
      toast.success("Prazo estendido com sucesso!");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Erro ao atualizar o prazo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEncerrarEmMassa = async () => {
    const confirmar = confirm("Atenção: Isto vai marcar todos os alunos que estão 'Pendentes' ou 'Em Andamento' como 'NÃO REALIZADO'. Deseja continuar?");
    if (!confirmar) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/atividades/${atividadeId}/encerrar`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Falha ao encerrar");
      
      toast.success("Avaliação em massa concluída!");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Erro ao processar encerramento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
          <CalendarClock className="w-4 h-4 mr-2" />
          Gerir Prazo / Encerrar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerir Prazo da Atividade</DialogTitle>
          <DialogDescription>
            O prazo desta atividade encerrou ou está a chegar ao fim. O que deseja fazer?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="p-4 border rounded-lg bg-card space-y-3">
            <h4 className="text-sm font-semibold flex items-center">
              <CalendarClock className="w-4 h-4 mr-2 text-primary" />
              Opção 1: Estender o Prazo
            </h4>
            <div className="space-y-2">
              <Label htmlFor="prazo">Nova Data e Hora</Label>
              <Input 
                id="prazo" 
                type="datetime-local" 
                value={novoPrazo} 
                onChange={(e) => setNovoPrazo(e.target.value)} 
              />
            </div>
            <Button 
              className="w-full" 
              disabled={isSubmitting || !novoPrazo || novoPrazo === dataFormatadaParaInput} 
              onClick={handleEstenderPrazo}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Novo Prazo
            </Button>
          </div>

          <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/5 space-y-3">
            <h4 className="text-sm font-semibold flex items-center text-destructive">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Opção 2: Encerrar de Vez
            </h4>
            <p className="text-xs text-muted-foreground">
              Os alunos que ainda não entregaram (Pendentes ou Em Andamento) serão automaticamente avaliados como <strong className="text-destructive">Não Realizado</strong>.
            </p>
            <Button 
              variant="destructive" 
              className="w-full" 
              disabled={isSubmitting} 
              onClick={handleEncerrarEmMassa}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Lançar "Não Realizado" em Massa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}