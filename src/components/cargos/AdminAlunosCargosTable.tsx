'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface AlunoData {
  id: string;
  nome: string;
  perfilAluno: {
    id: string;
    nomeDeGuerra?: string;
    numero?: string;
    conceitoAtual?: string;
    foraDeData: boolean;
    cargo?: { id: string; nome: string; abreviacao: string };
    companhia?: { id: string; nome: string };
    historicoCargos: Array<{ dataInicio: Date }>;
  };
}

interface AdminAlunosTableProps {
  data: AlunoData[];
  companhias: any[];
  cargos: any[];
}

export function AdminAlunosTable({ data, companhias, cargos }: AdminAlunosTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);


  const highlightWarName = (fullName: string, warName?: string) => {
    if (!warName) return fullName;

    const escapedWarName = warName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const regex = new RegExp(`(${escapedWarName})`, 'gi');
    
    const parts = fullName.split(regex);

    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === warName.toLowerCase() ? (
            <strong key={index} className="font-extrabold text-foreground">{part}</strong>
          ) : (
            <span key={index} className="text-muted-foreground/90">{part}</span>
          )
        )}
      </>
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(data.map((d) => d.perfilAluno.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleMassAction = async (action: 'promover' | 'despromover' | 'companhia') => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    try {
      console.log(`Executando ${action} para:`, selectedIds);
      alert(`Ação: ${action} enviada para ${selectedIds.length} alunos.`);
      router.refresh();
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted border rounded-md shadow-sm">
          <span className="text-sm font-medium ml-2">
            {selectedIds.length} selecionado(s)
          </span>
          <div className="flex gap-2">
            <Button 
              size="sm" variant="outline" 
              onClick={() => handleMassAction('promover')} disabled={isProcessing}
            >
              Promover
            </Button>
            <Button 
              size="sm" variant="outline" 
              onClick={() => handleMassAction('despromover')} disabled={isProcessing}
            >
              Despromover
            </Button>
            <Button 
              size="sm" variant="outline"
              disabled={isProcessing}
            >
              Mudar Cia
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-10">
                <Checkbox 
                  checked={data.length > 0 && selectedIds.length === data.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Identificação</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Companhia</TableHead>
              <TableHead className="w-[100px]">Conceito</TableHead>
              <TableHead className="text-right w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum aluno encontrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((aluno) => (
                <TableRow key={aluno.perfilAluno.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(aluno.perfilAluno.id)}
                      onCheckedChange={(checked) => handleSelectOne(aluno.perfilAluno.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                                     <span className="text-sm">
                        {highlightWarName(aluno.nome, aluno.perfilAluno.nomeDeGuerra)}
                      </span>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {aluno.perfilAluno.numero ? (
                          <span>Nº {aluno.perfilAluno.numero}</span>
                        ) : (
                          <span>S/N</span>
                        )}
                        
                        {aluno.perfilAluno.foraDeData && (
                          <span className="text-red-600 font-medium bg-red-50 dark:bg-red-950/30 px-1 rounded">
                            Fora de Data
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {aluno.perfilAluno.cargo ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {aluno.perfilAluno.cargo.nome}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {aluno.perfilAluno.cargo.abreviacao}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground/80">
                      {aluno.perfilAluno.companhia?.nome || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {aluno.perfilAluno.conceitoAtual ? (
                      <span className="text-sm font-medium">
                        {aluno.perfilAluno.conceitoAtual}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                           <Link href={`/admin/alunos/${aluno.perfilAluno.id}/promover`} className="cursor-pointer">
                             Gerenciar Cargo
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                           <Link href={`/admin/alunos/${aluno.perfilAluno.id}/cargos`} className="cursor-pointer">
                             Ver Histórico
                           </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}