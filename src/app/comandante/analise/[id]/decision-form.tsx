"use client";

import { useState, useTransition } from "react";
import { processarAnalise } from "../actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Loader2, AlertCircle, ArrowRightCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export function DecisionForm({ id }: { id: string }) {
  const [observacao, setObservacao] = useState("");
  const [decisaoSalva, setDecisaoSalva] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDecision = (decisao: "DEFERIDO" | "INDEFERIDO" | "ENCAMINHADO") => {
    if (!observacao.trim() && (decisao === "INDEFERIDO" || decisao === "ENCAMINHADO")) {
      toast.error(`A observação/despacho é obrigatória para ${decisao.toLowerCase()}.`);
      return;
    }

    startTransition(async () => {
      try {
        const res = await processarAnalise(id, decisao, observacao);
        
        // Se a Server Action retornar um objeto com { error: "mensagem" }
        if (res?.error) {
          toast.error(res.error);
          return;
        }

        setDecisaoSalva(decisao);
        toast.success("Decisão processada e registrada com sucesso!");
      } catch {
        toast.error("Ocorreu um erro inesperado ao salvar a decisão.");
      }
    });
  };

  if (decisaoSalva) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 text-center border rounded-lg bg-green-50/50 dark:bg-green-900/10 dark:border-green-900/30">
        <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-500" />
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">
            Decisão Registrada: {decisaoSalva}
          </h3>
          <p className="text-sm text-green-600/80 dark:text-green-500/80">
            A parte foi atualizada com sucesso. Você pode voltar para a lista de partes.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.href = '/comandante/partes'}
        >
          Voltar para a Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100">
          Parecer do Comando
        </h3>
        <p className="text-xs text-muted-foreground">
          Insira seu despacho. O PDF será atualizado com esta decisão.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="obs" className="sr-only">Despacho</Label>
        <Textarea
          id="obs"
          placeholder="Ex: Deferido conforme regulamento interno art. 5..."
          className="min-h-[150px] resize-none bg-white text-sm dark:bg-gray-900"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          onClick={() => handleDecision("DEFERIDO")}
          disabled={isPending}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Homologar
        </Button>

        <Button
          onClick={() => handleDecision("INDEFERIDO")}
          disabled={isPending}
          variant="outline"
          className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
          Indeferir
        </Button>

        <Button
          onClick={() => handleDecision("ENCAMINHADO")}
          disabled={isPending}
          variant="outline"
          className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/20"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightCircle className="mr-2 h-4 w-4" />}
          Encaminhar
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <p>Homologar ou Indeferir finalizam a parte. Encaminhar enviará para a Coordenação (Admin).</p>
      </div>
    </div>
  );
}