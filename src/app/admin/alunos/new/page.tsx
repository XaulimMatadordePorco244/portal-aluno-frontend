import prisma from "@/lib/prisma";
import AlunoForm from "./aluno-form"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewAlunoPage() {
  const [cargos, companhias] = await Promise.all([
    prisma.cargo.findMany({
      orderBy: { precedencia: 'asc' },
    }),
    prisma.companhia.findMany({
      orderBy: { nome: 'asc' },
    })
  ]);

  return (
    <div >
      <Card >
        <CardHeader>
          <CardTitle>Cadastrar Novo Aluno</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para matricular um novo aluno.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlunoForm cargos={cargos} companhias={companhias} />
        </CardContent>
      </Card>
    </div>
  );
}