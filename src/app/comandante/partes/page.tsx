import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Eye, ShieldAlert } from "lucide-react";

export default async function PainelComandantePage() {
  const session = await getCurrentUser();

  if (!session?.userId) {
    redirect("/auth/login");
  }

  const user = await prisma.usuario.findUnique({
    where: { id: session.userId },
    include: {
        perfilAluno: {
            include: { funcao: true }
        }
    }
  });

  if (!user) {
    redirect("/auth/login");
  }

  const isComandante = user.perfilAluno?.funcao?.nome === "COMANDANTE GERAL";
  const isAdmin = user.role === "ADMIN";

  if (!isComandante && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-5">
        <ShieldAlert className="h-16 w-16 text-red-600 mb-4" />
        <h1 className="text-2xl font-bold text-red-700">Acesso Restrito</h1>
        <p className="text-muted-foreground mt-2">
          Esta área é exclusiva do Comando ou Administração.
        </p>
        <Link href="/dashboard" className="mt-6">
            <Button variant="outline">Voltar ao Início</Button>
        </Link>
      </div>
    );
  }

  const partesPendentes = await prisma.parte.findMany({
    where: {
      status: "AGUARDANDO_COMANDANTE",
    },
    include: {
      autor: {
        include: {
          perfilAluno: {
            include: { cargo: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc", 
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Partes Pendentes</h1>
            <p className="text-muted-foreground">
                Partes aguardando análise e despacho.
            </p>
        </div>
        {isAdmin && !isComandante && (
            <Badge variant="destructive">Modo Admin</Badge>
        )}
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Caixa de Entrada ({partesPendentes.length})</CardTitle>
        </CardHeader>
        <CardContent>
            {partesPendentes.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    Nenhum protocolo pendente no momento.
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Protocolo</TableHead>
                            <TableHead>Militar</TableHead>
                            <TableHead>Assunto</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Data Envio</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {partesPendentes.map((parte) => (
                            <TableRow key={parte.id}>
                                <TableCell className="font-mono font-medium">
                                    #{parte.id.slice(0, 8).toUpperCase()}
                                </TableCell>
                                <TableCell>
                                    {parte.autor.perfilAluno?.cargo?.abreviacao} {parte.autor.perfilAluno?.nomeDeGuerra}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate" title={parte.assunto}>
                                    {parte.assunto}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{parte.tipo.replace(/_/g, " ")}</Badge>
                                </TableCell>
                                <TableCell>
                                    {parte.dataEnvio 
                                        ? new Date(parte.dataEnvio).toLocaleDateString('pt-BR') 
                                        : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/comandante/analise/${parte.id}`}>
                                        <Button size="sm">
                                            <Eye className="mr-2 h-4 w-4" />
                                            Analisar
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}