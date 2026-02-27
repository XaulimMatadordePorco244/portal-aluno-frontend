"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { StatusAtividade } from "@prisma/client";

export function LinhaAlunoAtividade({ 
  vinculo 
}: { 
  vinculo: any 
}) {
  const [status, setStatus] = useState<StatusAtividade>(vinculo.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const perfil = vinculo.aluno.perfilAluno;
  const nomeExibicao = perfil?.nomeDeGuerra 
    ? `${perfil.cargo?.abreviacao || ''} ${perfil.nomeDeGuerra}` 
    : vinculo.aluno.nome;

  const handleStatusChange = async (novoStatus: StatusAtividade) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/atividades/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ atividadeAlunoId: vinculo.id, status: novoStatus })
      });

      if (!res.ok) throw new Error("Erro");
      setStatus(novoStatus);
      toast.success("Status atualizado!");
    } catch (e) {
      toast.error("Falha ao atualizar status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderBadge = () => {
    switch (status) {
      case 'PENDENTE': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Não Abriu</Badge>;
      case 'VISUALIZADO': return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1"/> Visualizado</Badge>;
      case 'REALIZADO': return <Badge className="bg-primary text-primary-foreground"><CheckCircle2 className="w-3 h-3 mr-1"/> Realizado</Badge>;
      case 'NAO_REALIZADO': return <Badge variant="destructive" className="bg-destructive/80"><AlertCircle className="w-3 h-3 mr-1"/> Não Realizado</Badge>;
      default: return null;
    }
  };

  return (
    <TableRow className={status === 'PENDENTE' ? 'bg-destructive/5' : ''}>
      <TableCell className="font-medium">{nomeExibicao.trim()}</TableCell>
      <TableCell>{renderBadge()}</TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {vinculo.visualizadoEm 
          ? format(new Date(vinculo.visualizadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
          : "---"}
      </TableCell>
      <TableCell className="text-right">
        <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating}>
          <SelectTrigger className="w-40 ml-auto h-8 text-xs">
            <SelectValue placeholder="Avaliar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDENTE" disabled>Pendente</SelectItem>
            <SelectItem value="VISUALIZADO">Deixar em Andamento</SelectItem>
            <SelectItem value="REALIZADO">Marcar como Realizado</SelectItem>
            <SelectItem value="NAO_REALIZADO">Marcar como Não Realizado</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  );
}