"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const currentStatus = searchParams.get("status") || "ATIVO";

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`);
  };

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-end">
        
        <div className="grid gap-1 w-full sm:w-auto sm:min-w-[200px]">
          <label htmlFor="turmaId" className="text-xs font-semibold text-muted-foreground">
            Turma (Origem)
          </label>
          <Select value={currentTurma} onValueChange={(value) => handleFilterChange("turmaId", value)}>
            <SelectTrigger id="turmaId" className="h-9 w-full bg-background shadow-sm">
              <SelectValue placeholder="Selecione a Turma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Turmas</SelectItem>
              {turmas.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  {t.nome} ({t.ano})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1 w-full sm:w-auto sm:min-w-[180px]">
          <label htmlFor="ano" className="text-xs font-semibold text-muted-foreground">
            Ano Letivo (Atividade)
          </label>
          <Select value={currentAno} onValueChange={(value) => handleFilterChange("ano", value)}>
            <SelectTrigger id="ano" className="h-9 w-full bg-background shadow-sm">
              <SelectValue placeholder="Selecione o Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Anos</SelectItem>
              {anosDisponiveis.map(ano => (
                <SelectItem key={ano} value={ano.toString()}>
                  {ano}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1 w-full sm:w-auto sm:min-w-[180px]">
          <label htmlFor="status" className="text-xs font-semibold text-muted-foreground">
            Status Atual
          </label>
          <Select value={currentStatus} onValueChange={(value) => handleFilterChange("status", value)}>
            <SelectTrigger id="status" className="h-9 w-full bg-background shadow-sm">
              <SelectValue placeholder="Selecione o Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os Status</SelectItem>
              <SelectItem value="ATIVO">Apenas Ativos</SelectItem>
              <SelectItem value="INATIVO">Desligados/Inativos</SelectItem>
              <SelectItem value="SUSPENSO">Suspensos</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </CardContent>
    </Card>
  );
}