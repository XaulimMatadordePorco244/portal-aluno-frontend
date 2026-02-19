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
import { Plus, ArrowDownAZ, Hash, Medal } from "lucide-react";
import { AlunoActions } from "./aluno-actions";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function AdminAlunosPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const sort = searchParams.sort || 'nome';

  let orderByClause: any = { nome: 'asc' }; 

  if (sort === 'numero') {
    orderByClause = { perfilAluno: { numero: 'asc' } };
  } else if (sort === 'antiguidade') {
    orderByClause = [
      { perfilAluno: { cargo: { precedencia: 'asc' } } },
      { perfilAluno: { dataUltimaPromocao: 'asc' } },
      { perfilAluno: { notaDesempatePromocao: 'desc' } },
      { dataNascimento: 'asc' }
    ];
  }

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
    orderBy: orderByClause
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Efetivo Ativo</CardTitle>
            <CardDescription>Lista de todos os alunos cadastrados.</CardDescription>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium mr-1">Ordenar por:</span>
            
            <Button asChild variant={sort === 'nome' ? 'default' : 'outline'} size="sm" className="h-8">
              <Link href="?sort=nome">
                <ArrowDownAZ className="w-4 h-4 mr-2"/> Nome
              </Link>
            </Button>
            
            <Button asChild variant={sort === 'numero' ? 'default' : 'outline'} size="sm" className="h-8">
              <Link href="?sort=numero">
                <Hash className="w-4 h-4 mr-2"/> Número
              </Link>
            </Button>
            
            <Button asChild variant={sort === 'antiguidade' ? 'default' : 'outline'} size="sm" className="h-8">
              <Link href="?sort=antiguidade">
                <Medal className="w-4 h-4 mr-2"/> Antiguidade
              </Link>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="w-[100px]">Número</TableHead>
                  <TableHead className="w-[150px]">CPF</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunos.map((aluno) => (
                  <TableRow key={aluno.id} className="group">
                    <TableCell className="font-medium whitespace-nowrap">
                      <Link 
                        href={`/admin/alunos/${aluno.perfilAluno?.id}`} 
                        className="block w-full h-full hover:underline font-semibold text-primary"
                      >
                        {aluno.nome}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono">{aluno.perfilAluno?.numero || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{aluno.cpf}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-xs font-semibold uppercase ring-1 ring-inset ring-secondary">
                        {aluno.perfilAluno?.cargo?.nome || 'Sem Cargo'}
                      </span>
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