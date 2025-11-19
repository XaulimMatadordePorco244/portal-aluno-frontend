import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditAlunoForm from "./edit-aluno-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditAlunoPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const [aluno, cargos, companhias] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id },
      include: { 
        perfilAluno: {
          include: {
            companhia: true,
            cargo: true
          }
        } 
      },
    }),
    prisma.cargo.findMany({
      orderBy: { precedencia: 'asc' }
    }),
    prisma.companhia.findMany({
      orderBy: { nome: 'asc' }
    })
  ]);

  if (!aluno) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Editar Aluno</CardTitle>
          <CardDescription>
            Altere os dados de {aluno.perfilAluno?.nomeDeGuerra || aluno.nome}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditAlunoForm 
            aluno={aluno} 
            cargosDisponiveis={cargos}
            companhiasDisponiveis={companhias}
          />
        </CardContent>
      </Card>
    </div>
  );
}