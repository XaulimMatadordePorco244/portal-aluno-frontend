import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PlusCircle, Eye } from "lucide-react";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

async function getAtividadesAdmin() {
  const atividades = await prisma.atividade.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { destinatarios: true }
      },
      destinatarios: {
        select: { status: true }
      }
    }
  });

  return atividades.map(atividade => {
    const visualizados = atividade.destinatarios.filter(d => d.status !== 'PENDENTE').length;
    return {
      ...atividade,
      totalAlunos: atividade._count.destinatarios,
      visualizados,
    };
  });
}

export default async function AdminAtividadesPage() {
  const atividades = await getAtividadesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Gestão de Tarefas</h1>
        </div>
        <Link href="/admin/atividades/novo">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título / Tipo</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead className="text-center">Engajamento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {atividades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma atividade criada ainda.
                </TableCell>
              </TableRow>
            ) : (
              atividades.map((atividade) => (
                <TableRow key={atividade.id}>
                  <TableCell>
                    <div className="font-medium">{atividade.titulo}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {atividade.tipo.replace('_', ' ')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(atividade.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {atividade.prazoEntrega 
                      ? <Badge variant="outline">{format(new Date(atividade.prazoEntrega), "dd/MM/yyyy", { locale: ptBR })}</Badge> 
                      : <span className="text-muted-foreground text-sm">Sem prazo</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-semibold">
                        {atividade.visualizados} / {atividade.totalAlunos}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase">Visualizaram</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/atividades/${atividade.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Relatório
                      </Button>
                    </Link>
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