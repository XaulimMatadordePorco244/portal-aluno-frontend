import prisma from "@/lib/prisma";
import AnotacaoForm from "./anotacao-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

async function getData() {
  const alunos = await prisma.usuario.findMany({
    where: { role: 'ALUNO', status: 'ATIVO' },
    orderBy: { 
      perfilAluno: {
        nomeDeGuerra: 'asc'
      }
    },
    include: { 
      perfilAluno: {
        include: {
          companhia: true
        }
      } 
    },
  });

  const tiposDeAnotacao = await prisma.tipoDeAnotacao.findMany({
    orderBy: { titulo: 'asc' },
  });

  return { alunos, tiposDeAnotacao };
}

export default async function NewAnotacaoPage() {
  const { alunos, tiposDeAnotacao } = await getData();

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Lançar Nova Anotação</CardTitle>
          <CardDescription>
            Selecione o aluno, o tipo de anotação e preencha os detalhes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnotacaoForm alunos={alunos} tiposDeAnotacao={tiposDeAnotacao} />
        </CardContent>
      </Card>
    </div>
  );
}