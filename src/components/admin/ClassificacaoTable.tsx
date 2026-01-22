"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";

export interface ClassificacaoItem {
  id: string;
  posicao: number;
  nome: string; 
  nomeDeGuerra: string;
  cargo: string;
  precedencia: number;
  totalElogios: number;
  totalPunicoes: number;
  totalFoPos: number;
  totalFoNeg: number;
  conceitoAtual: number;
}

interface ClassificacaoTableProps {
  data: ClassificacaoItem[];
}

export function ClassificacaoTable({ data }: ClassificacaoTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((aluno) =>
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.nomeDeGuerra.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const groupedData = useMemo(() => {
    const groups: Record<string, typeof data> = {};
    
    filteredData.forEach(item => {
      if (!groups[item.cargo]) {
        groups[item.cargo] = [];
      }
      groups[item.cargo].push(item);
    });

    return Object.entries(groups)
      .map(([cargo, items]) => ({
        cargo,
        precedencia: items[0].precedencia,
        items: items.sort((a, b) => b.conceitoAtual - a.conceitoAtual)
      }))
      .sort((a, b) => a.precedencia - b.precedencia);
  }, [filteredData]);

  const NumberCell = ({ value, type = "neutral" }: { value: number, type?: "positive" | "negative" | "neutral" }) => {
    if (value === 0) {
      return <span className="text-muted-foreground/20 font-mono">—</span>;
    }
    
    const formatted = value.toFixed(1);
    let colorClass = "text-foreground"; 
    
    if (type === "positive") colorClass = "text-emerald-600 dark:text-emerald-500 font-semibold";
    if (type === "negative") colorClass = "text-red-600 dark:text-red-500 font-semibold";

    return (
      <span className={`font-mono ${colorClass}`}>
        {value > 0 && type === "positive" ? `+${formatted}` : formatted}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome de guerra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background border-input"
          />
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          {filteredData.length} registros encontrados
        </div>
      </div>

      {groupedData.length > 0 ? (
        groupedData.map((group) => (
          <div key={group.cargo} className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3 pl-1">
              {group.cargo}
            </h2>
            
            <div className="bg-card rounded-xl shadow-lg border overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="w-20 text-center border-r font-bold text-foreground h-12">Posição</TableHead>
                    <TableHead className="min-w-[180px] border-r font-bold text-foreground h-12">Nome de Guerra</TableHead>
                    
                    <TableHead className="w-[100px] text-center border-r font-semibold text-muted-foreground h-12">Elogios</TableHead>
                    <TableHead className="w-[100px] text-center border-r font-semibold text-muted-foreground h-12">Punições</TableHead>
                    <TableHead className="w-[90px] text-center border-r font-semibold text-muted-foreground h-12">FO (+)</TableHead>
                    <TableHead className="w-[90px] text-center border-r font-semibold text-muted-foreground h-12">FO (-)</TableHead>
                    
                    <TableHead className="w-[140px] text-center font-bold text-foreground h-12 bg-muted/5">Conceito Atual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.items.map((aluno) => (
                    <TableRow 
                      key={aluno.id} 
                      onClick={() => router.push(`/admin/alunos/${aluno.id}/anotacoes`)}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      
                      <TableCell className="font-bold text-center border-r text-foreground py-3 group-hover:text-primary transition-colors">
                        {aluno.posicao}º
                      </TableCell>
                      
                      <TableCell className="border-r py-3 font-medium text-foreground">
                        {aluno.nomeDeGuerra}
                      </TableCell>

                      <TableCell className="text-center border-r py-3 align-middle">
                        <NumberCell value={aluno.totalElogios} type="positive" />
                      </TableCell>

                      <TableCell className="text-center border-r py-3 align-middle">
                        <NumberCell value={aluno.totalPunicoes} type="negative" />
                      </TableCell>

                      <TableCell className="text-center border-r py-3 align-middle">
                        <NumberCell value={aluno.totalFoPos} type="positive" />
                      </TableCell>

                      <TableCell className="text-center border-r py-3 align-middle">
                        <NumberCell value={aluno.totalFoNeg} type="negative" />
                      </TableCell>

                      <TableCell className="text-center bg-muted/5 py-3 align-middle">
                        <span className={`font-mono font-bold ${
                            aluno.conceitoAtual < 7 ? "text-destructive" : "text-foreground"
                        }`}>
                           {aluno.conceitoAtual.toFixed(2)}
                        </span>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-card rounded-xl shadow-sm border p-12 text-center">
           <p className="text-muted-foreground">Nenhum mirim encontrado.</p>
        </div>
      )}
    </div>
  );
}