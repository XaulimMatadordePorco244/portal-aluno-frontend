"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays } from "lucide-react";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function FiltroMeses() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const mesAtual = new Date().getMonth();
  const mesSelecionado = searchParams.get("mes") || mesAtual.toString();

  const handleMesChange = (valor: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mes", valor);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full sm:w-60">
      <Select value={mesSelecionado} onValueChange={handleMesChange}>
        <SelectTrigger className="h-12 w-full bg-muted/30 hover:bg-muted/60 border-border/50 rounded-7 px-5 text-base font-medium transition-all shadow-sm focus:ring-1 focus:ring-primary">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            <SelectValue placeholder="Selecione o mês" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl border-border/50 shadow-xl">
          {MESES.map((mes, index) => (
            <SelectItem 
              key={index} 
              value={index.toString()}
              className="rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary font-medium"
            >
              {mes}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}