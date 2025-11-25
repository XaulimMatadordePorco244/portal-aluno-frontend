import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListTodo, Edit } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";

async function getMinhasTarefas() {
    const user = await getCurrentUser();
    if (!user?.userId) return [];

    const tarefas = await prisma.etapaProcesso.findMany({
        where: {
            responsavelId: user.userId,
            status: "PENDENTE", 
        },
        include: {
            processo: true, 
        },
        orderBy: {
            createdAt: 'asc',
        }
    });
    return tarefas;
}

export default async function MinhasTarefasPage() {
    const tarefas = await getMinhasTarefas();

    return (
        <div className="container mx-auto py-10 max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
                <ListTodo className="w-8 h-8 text-foreground" />
                <h1 className="text-3xl font-bold text-foreground">Minhas Tarefas</h1>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-foreground">Tarefas Pendentes</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Aqui estão os processos que aguardam seu parecer ou ação.
                    </p>
                </div>
                
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nº do Processo</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Assunto</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tarefas.map((tarefa) => (
                                <TableRow key={tarefa.id}>
                                    <TableCell className="font-mono">{tarefa.processo.numeroDocumento}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{tarefa.titulo}</Badge>
                                    </TableCell>
                                    <TableCell>{tarefa.processo.assunto}</TableCell>
                                    <TableCell className="text-right">
                                                                          <Link href={`/minhas-tarefas/${tarefa.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="mr-2 h-4 w-4" />
                                                Emitir Parecer
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {tarefas.length === 0 && (
                    <div className="text-center p-10 text-muted-foreground">
                        Você não tem nenhuma tarefa pendente.
                    </div>
                )}
            </div>
        </div>
    );
}