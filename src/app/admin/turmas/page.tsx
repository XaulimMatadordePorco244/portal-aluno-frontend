import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormTurma } from "./form-turma";

export default async function TurmasPage() {
  const turmas = await prisma.turma.findMany({
    orderBy: { ano: 'desc' },
    include: {
      _count: {
        select: { alunos: true }
      }
    }
  });

  const alunosSemTurma = await prisma.usuario.findMany({
    where: {
      role: 'ALUNO',
      status: 'ATIVO',
      perfilAluno: {
        turmaId: null 
      }
    },
    select: {
      id: true,
      nome: true,
      perfilAluno: {
        select: {
          id: true,
          anoIngresso: true
        }
      }
    },
    orderBy: { nome: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Turmas</h1>
        <p className="text-muted-foreground">Crie e acompanhe as turmas (pelotões) da instituição.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        <Card className="md:col-span-1 h-fit border-primary/20 shadow-sm">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-lg">Nova Turma</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <FormTurma alunosSemTurma={alunosSemTurma} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-lg">Turmas Registadas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Ano</TableHead>
                  <TableHead>Nome da Turma</TableHead>
                  <TableHead className="text-center w-40">Qtd. Alunos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turmas.map(turma => (
                  <TableRow key={turma.id}>
                    <TableCell className="font-bold">{turma.ano}</TableCell>
                    <TableCell>{turma.nome}</TableCell>
                    <TableCell className="text-center font-medium">
                      <span className="bg-secondary px-2 py-1 rounded-md text-xs">
                        {turma._count.alunos} alunos
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {turmas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      Nenhuma turma registada. Adicione a sua primeira turma ao lado!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}