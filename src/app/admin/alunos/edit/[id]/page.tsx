import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditAlunoForm from "./edit-aluno-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAlunoPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const [aluno, cargosData, companhiasData, escolasData] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id },
      include: { 
        perfilAluno: {
          include: {
            companhia: true,
            cargo: true,
            escola: true 
          }
        } 
      },
    }),
    prisma.cargo.findMany({
      orderBy: { precedencia: 'asc' }
    }),
    prisma.companhia.findMany({
      orderBy: { nome: 'asc' }
    }),
    prisma.escola.findMany({
      orderBy: { nome: 'asc' }
    })
  ]);

  if (!aluno) {
    notFound();
  }

  return (
    <div >
      <Card >
        <CardHeader>
          <CardTitle>Editar Aluno</CardTitle>
          <CardDescription>
            Altere os dados de {aluno.nomeDeGuerra || aluno.nome}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditAlunoForm 
            aluno={aluno} 
            cargos={cargosData} 
            companhias={companhiasData} 
            escolas={escolasData} 
          />
        </CardContent>
      </Card>
    </div>
  );
}