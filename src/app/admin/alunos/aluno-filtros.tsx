"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

type TurmaMin = { id: string; nome: string; ano: number };

export function AlunoFiltros({ 
  turmas, 
  anosDisponiveis 
}: { 
  turmas: TurmaMin[]; 
  anosDisponiveis: number[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTurma = searchParams.get("turmaId") || "todas";
  const currentAno = searchParams.get("ano") || "todos";
  const currentStatus = searchParams.get("status") || "TODOS";

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`);
  };

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-end">
        
        <div className="grid gap-1 w-full sm:w-auto">
          <label htmlFor="turmaId" className="text-xs font-semibold text-muted-foreground">Turma (Origem)</label>
          <select 
            id="turmaId" 
            value={currentTurma} 
            onChange={(e) => handleFilterChange("turmaId", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          >
            <option value="todas">Todas as Turmas</option>
            {turmas.map(t => (
              <option key={t.id} value={t.id}>{t.nome} ({t.ano})</option>
            ))}
          </select>
        </div>

        <div className="grid gap-1 w-full sm:w-auto">
          <label htmlFor="ano" className="text-xs font-semibold text-muted-foreground">Ano Letivo (Atividade)</label>
          <select 
            id="ano" 
            value={currentAno} 
            onChange={(e) => handleFilterChange("ano", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          >
            <option value="todos">Todos os Anos</option>
            {anosDisponiveis.map(ano => (
              <option key={ano} value={ano.toString()}>{ano}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-1 w-full sm:w-auto">
          <label htmlFor="status" className="text-xs font-semibold text-muted-foreground">Status Atual</label>
          <select 
            id="status" 
            value={currentStatus} 
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="ATIVO">Apenas Ativos</option>
            <option value="INATIVO">Desligados/Inativos</option>
            <option value="SUSPENSO">Suspensos</option>
          </select>
        </div>

      </CardContent>
    </Card>
  );
}