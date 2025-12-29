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
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Cadastrar Novo Aluno</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para matricular um novo aluno.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 2. Passamos os dados obrigatórios para o formulário */}
          <AlunoForm cargos={cargos} companhias={companhias} />
        </CardContent>
      </Card>
    </div>
  );
}