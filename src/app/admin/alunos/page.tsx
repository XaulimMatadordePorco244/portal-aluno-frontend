import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { AlunoActions } from "./aluno-actions";

async function getAlunos() {
    return await prisma.usuario.findMany({
        where: {
            role: 'ALUNO'
        },
        include: {
            perfilAluno: true
        },
        orderBy: { nome: 'asc' }
    });
}

export default async function AdminAlunosPage() {
    const alunos = await getAlunos();

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Alunos</h1>
                    <p className="text-muted-foreground">Adicione, edite ou remova alunos do sistema.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/alunos/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Aluno
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Alunos Cadastrados</CardTitle>
                    <CardDescription>Total de {alunos.length} alunos encontrados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome Completo</TableHead>
                                <TableHead>Número</TableHead>
                                <TableHead>CPF</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alunos.map((aluno) => (
                                <TableRow key={aluno.id}>
                                    <TableCell className="font-medium">{aluno.nome}</TableCell>
                                    <TableCell>{aluno.perfilAluno?.numero || 'N/A'}</TableCell>
                                    <TableCell>{aluno.cpf}</TableCell>
                                    <TableCell>{aluno.status}</TableCell>
                                    <TableCell className="text-right">
                                        <AlunoActions aluno={aluno} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {alunos.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Nenhum aluno cadastrado.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}