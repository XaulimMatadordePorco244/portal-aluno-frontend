import Link from "next/link";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { AlunoActions } from "./aluno-actions";

export default async function AdminAlunosPage() {
  const alunos = await prisma.usuario.findMany({
    where: { role: 'ALUNO' },
    include: {
      perfilAluno: {
        include: {
          cargo: true,
          companhia: true
        }
      }
    },
    orderBy: { nome: 'asc' }
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
          <p className="text-muted-foreground">Gerencie o efetivo de alunos da instituição.</p>
        </div>
        <Link href="/admin/alunos/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Novo Aluno
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Efetivo Ativo</CardTitle>
          <CardDescription>Lista de todos os alunos cadastrados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunos.map((aluno) => (
                  <TableRow key={aluno.id} className="group">
                    <TableCell className="font-medium">
                      <Link 
                        href={`/admin/alunos/${aluno.id}`} 
                        className="block w-full h-full hover:underline font-semibold text-primary"
                      >
                        {aluno.nome}
                      </Link>
                    </TableCell>
                    <TableCell>{aluno.perfilAluno?.numero || 'N/A'}</TableCell>
                    <TableCell>{aluno.cpf}</TableCell>
                    <TableCell>
                      {aluno.perfilAluno?.cargo?.nome || 'Sem Cargo'}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlunoActions aluno={aluno} />
                    </TableCell>
                  </TableRow>
                ))}
                {alunos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Nenhum aluno encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}