'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const exibirDataBR = (date: string | Date | null | undefined) => {
  if (!date) return '-';
  try {
    if (typeof date === 'string' && date.length === 10 && date.includes('-')) {
      const [ano, mes, dia] = date.split('-');
      return `${dia}/${mes}/${ano}`;
    }
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch {
    return '-';
  }
};

export interface AlunoAntiguidade {
  id: string;
  anoIngresso?: number | null;
  dataMatricula?: string | Date | null;
  dataUltimaPromocao?: string | Date | null;
  nomeDeGuerra?: string | null;
  modalidadeUltimaPromocao?: string | null;
  usuario?: {
    nome: string;
  } | null;
  cargo: {
    nome: string;
    tipo?: string; 
  };
}

export default function TabelaAntiguidade({ dados }: { dados: AlunoAntiguidade[] }) {
  return (
    <div className="border border-border rounded-lg shadow-sm bg-card text-card-foreground overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[700px] md:min-w-full">
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-b border-border">
              <TableHead className="w-[60px] text-center font-bold text-foreground border-r border-border/50 whitespace-nowrap">CLASS.</TableHead>
              <TableHead className="text-center font-bold text-foreground border-r border-border/50 whitespace-nowrap">INGRESSO</TableHead>
              <TableHead className="text-center font-bold text-foreground border-r border-border/50 whitespace-nowrap min-w-[130px]">PROMOVIDO EM</TableHead>
              <TableHead className="text-center font-bold text-foreground border-r border-border/50 whitespace-nowrap">POSTO/GRAD.</TableHead>
              <TableHead className="text-center font-bold text-foreground border-r border-border/50 whitespace-nowrap">NOME</TableHead>
              <TableHead className="text-center font-bold text-foreground whitespace-nowrap">MODALIDADE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dados.map((aluno, index) => {
  
              const rowColorClass = ""; 
              
              return (
                <TableRow key={aluno.id} className="hover:bg-muted/50 border-b border-border text-xs sm:text-sm transition-colors">
                  
                  <TableCell className="text-center font-medium bg-muted/20 border-r border-border p-2 text-foreground">
                    {index + 1}º
                  </TableCell>

                  <TableCell className="text-center font-medium border-r border-border p-2 text-foreground whitespace-nowrap">
                     {aluno.anoIngresso || (aluno.dataMatricula ? new Date(aluno.dataMatricula).getFullYear() : '-')}
                  </TableCell>

                  <TableCell className="text-center border-r border-border p-2 whitespace-nowrap">
                    <span className="font-medium text-foreground">
                      {exibirDataBR(aluno.dataUltimaPromocao)}
                    </span>
                  </TableCell>

                  <TableCell className="p-0 border-r border-border min-w-[120px]">
                    <div className={cn("h-full w-full py-3 px-2 flex items-center justify-center font-medium uppercase text-[10px] sm:text-xs whitespace-nowrap", rowColorClass)}>
                      {aluno.cargo.nome.toUpperCase()}
                    </div>
                  </TableCell>

                  <TableCell className="text-center font-medium uppercase border-r border-border p-2 truncate max-w-[180px] sm:max-w-none text-foreground">
                    {aluno.nomeDeGuerra || aluno.usuario?.nome || '-'}
                  </TableCell>

                  <TableCell className="text-center p-2 bg-muted/10 whitespace-nowrap">
                    <span className="font-medium text-foreground uppercase text-[10px] sm:text-xs">
                      {aluno.modalidadeUltimaPromocao || '-'}
                    </span>
                  </TableCell>
                  
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}