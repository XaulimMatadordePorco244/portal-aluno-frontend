import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlusCircle, Scale, Eye } from "lucide-react";
import { StatusEscala } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";


async function getEscalas() {
  const escalas = await prisma.escala.findMany({
    orderBy: {
      dataEscala: 'desc', 
    },
    include: {
      criadoPor: true, 
      _count: {
        select: { itens: true }, 
      },
    },
  });
  return escalas;
}


const getStatusVariant = (status: StatusEscala) => {
  switch (status) {
    case 'PUBLICADA':
      return { variant: "default", text: "Publicada" } as const;
    case 'FECHADA':
      return { variant: "secondary", text: "Fechada" } as const;
    case 'ARQUIVADA':
        return { variant: "destructive", text: "Arquivada" } as const;
    case 'RASCUNHO':
    default:
      return { variant: "outline", text: "Rascunho" } as const;
  }
};

export default async function EscalasPage() {
  const escalas = await getEscalas();

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Scale className="w-8 h-8 text-foreground" />
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Escalas</h1>
        </div>
        <Link href="/admin/escalas/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Nova Escala
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Data da Escala</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[120px]">Nº de Alunos</TableHead>
              <TableHead>Elaborado Por</TableHead>
              <TableHead className="text-right w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {escalas.map((escala) => {
              const statusInfo = getStatusVariant(escala.status);
              const dataFormatada = format(new Date(escala.dataEscala), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
              
              return (
                <TableRow key={escala.id}>
                  <TableCell className="font-medium">{dataFormatada}</TableCell>
                  <TableCell>{escala.tipo.charAt(0) + escala.tipo.slice(1).toLowerCase()}</TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{escala._count.itens}</TableCell>
                  <TableCell>{escala.elaboradoPor}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/escalas/${escala.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {escalas.length === 0 && (
          <div className="text-center p-10 text-muted-foreground">
            Nenhuma escala foi criada ainda.
          </div>
        )}
      </div>
    </>
  );
}