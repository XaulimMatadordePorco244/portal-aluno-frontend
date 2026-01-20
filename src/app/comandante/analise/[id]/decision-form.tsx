"use client";

import { useState, useTransition } from "react";
import { processarAnalise } from "../actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export function DecisionForm({ id }: { id: string }) {
  const [observacao, setObservacao] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDecision = (decisao: "DEFERIDO" | "INDEFERIDO") => {
    if (!observacao.trim() && decisao === "INDEFERIDO") {
      toast.error("Observação obrigatória para indeferimento.");
      return;
    }

    startTransition(async () => {
      await processarAnalise(id, decisao, observacao);
      toast.success("Processado com sucesso!");
    });
  };

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

      <div className="grid gap-3">
        <Button
          onClick={() => handleDecision("DEFERIDO")}
          disabled={isPending}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Homologar
        </Button>

        <Button
          onClick={() => handleDecision("INDEFERIDO")}
          disabled={isPending}
          variant="outline"
          className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
          Indeferir / Arquivar
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <p>A decisão é irrevogável e notifica o aluno imediatamente.</p>
      </div>
    </div>
  );
}