"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, AlertCircle, CheckCircle2, Trash2, Edit, Loader2 } from "lucide-react";
import Link from "next/link";
import { deleteSuspensao } from "@/actions/suspensao"; 
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SuspensaoData {
  id: string;
  dataOcorrencia: Date;
  dias: number;
  pontosRetirados: number;
  detalhes: string;
  visualizadoEm: Date | null;
  tipo?: {
    titulo: string;
  } | null;
  aluno: {
    nomeDeGuerra?: string;
    cargo: {
      abreviacao: string;
    } | null;
    usuario: {
      nome: string;
    };
  };
}

export default function SuspensoesClient({ suspensoes }: { suspensoes: SuspensaoData[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [isPending, startTransition] = useTransition();
  const [idAExcluir, setIdAExcluir] = useState<string | null>(null);

  const suspensoesFiltradas = suspensoes.filter((s) => {
    const nomeAluno = s.aluno.usuario.nome.toLowerCase();
    const nomeGuerra = (s.aluno.nomeDeGuerra || "").toLowerCase();
    const termo = busca.toLowerCase();
    return nomeAluno.includes(termo) || nomeGuerra.includes(termo);
  });

  const handleDelete = (id: string) => {
    if (!window.confirm("Tem a certeza que deseja excluir esta suspensão? Os pontos retirados serão devolvidos ao aluno.")) return;

    setIdAExcluir(id);
    startTransition(async () => {
      const result = await deleteSuspensao(id);
      if (result.success) {
        toast.success(result.message);
        router.refresh(); 
      } else {
        toast.error(result.message);
      }
      setIdAExcluir(null);
    });
  };

  return (
    <div className="space-y-4 bg-card p-6 rounded-lg border shadow-sm">
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por aluno..."
            className="pl-8"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data Fato</TableHead>
              <TableHead>Aluno</TableHead>
              <TableHead>Penalidade</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead> 
            </TableRow>
          </TableHeader>
          <TableBody>
            {suspensoesFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhuma suspensão encontrada.
                </TableCell>
              </TableRow>
            ) : (
              suspensoesFiltradas.map((susp) => (
                <TableRow key={susp.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(new Date(susp.dataOcorrencia), "dd/MM/yyyy")}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">
                        {susp.aluno.cargo?.abreviacao} GM {susp.aluno.nomeDeGuerra || susp.aluno.usuario.nome.split(" ")[0]}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {susp.aluno.usuario.nome}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge variant="destructive" className="whitespace-nowrap">
                        {susp.dias} dias
                      </Badge>
                      <span className="text-xs text-red-600 font-semibold whitespace-nowrap">
                        {susp.pontosRetirados} pts
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="text-sm max-w-[200px] truncate font-medium" title={susp.tipo?.titulo}>
                      {susp.tipo?.titulo || 'Infração Disciplinar'}
                    </p>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[200px] block" title={susp.detalhes}>
                      {susp.detalhes}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    {susp.visualizadoEm ? (
                      <div className="flex flex-col items-center gap-1">
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Lido
                        </Badge>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {format(new Date(susp.visualizadoEm), "dd/MM/yy HH:mm")}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                        <AlertCircle className="w-3 h-3 mr-1" /> Pendente
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Link href={`/admin/suspensoes/${susp.id}/editar`}>
                        <Button variant="ghost" size="icon" title="Editar Suspensão">
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Apagar Suspensão"
                        onClick={() => handleDelete(susp.id)}
                        disabled={isPending && idAExcluir === susp.id}
                      >
                        {isPending && idAExcluir === susp.id ? (
                          <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-600" />
                        )}
                      </Button>
                    </div>
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