"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { AlertOctagon, CheckCircle, Calendar, ShieldAlert } from "lucide-react";
import { marcarSuspensaoComoVisualizada } from "@/actions/suspensao";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SuspensaoPendente = {
  id: string;
  dataOcorrencia: Date;
  dias: number;
  pontosRetirados: number;
  detalhes: string;
};

export function AvisoSuspensaoModal({ suspensao }: { suspensao: SuspensaoPendente | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(!!suspensao); 

  if (!suspensao) return null;

  const handleCiente = () => {
    startTransition(async () => {
      const result = await marcarSuspensaoComoVisualizada(suspensao.id);
      if (result.success) {
        toast.success("Ciente registado com sucesso.");
        setIsOpen(false);
        router.refresh(); 
      } else {
        toast.error("Erro ao comunicar com o servidor. Tente novamente.");
      }
    });
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) return; 
        setIsOpen(open);
      }}
    >
      <DialogContent className="sm:max-w-md border-red-500/30">
        <DialogHeader className="flex flex-col items-center gap-2 pb-2">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertOctagon className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-center text-red-600">
            Aviso de Suspensão Disciplinar
          </DialogTitle>
          <DialogDescription className="text-center font-medium">
            Você possui um novo registo disciplinar no seu histórico.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-md space-y-3 text-sm">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4"/> Data do Fato:</span>
            <span className="font-semibold">{new Date(suspensao.dataOcorrencia).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4"/> Dias de Suspensão:</span>
            <span className="font-semibold text-red-600">{suspensao.dias} dias</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-muted-foreground flex items-center gap-1"><ShieldAlert className="h-4 w-4"/> Impacto no Conceito:</span>
            <span className="font-semibold text-red-600">{suspensao.pontosRetirados} pontos</span>
          </div>
          <div className="space-y-1 pt-1">
            <span className="text-muted-foreground font-semibold">Motivo / Detalhes:</span>
            <p className="bg-background border p-2 rounded text-foreground text-xs leading-relaxed max-h-32 overflow-y-auto">
              {suspensao.detalhes}
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-center flex-col gap-2 pt-2">
          <p className="text-xs text-muted-foreground text-center mb-2">
            Ao clicar abaixo, você confirma que leu e está ciente desta penalidade. A data e hora desta leitura ficarão registadas no sistema.
          </p>
          <Button 
            variant="destructive" 
            className="w-full font-bold" 
            onClick={handleCiente}
            disabled={isPending}
          >
            {isPending ? "A Registar..." : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                ESTOU CIENTE DESTA SUSPENSÃO
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}