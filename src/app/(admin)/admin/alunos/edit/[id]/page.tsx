import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditAlunoForm from "./edit-aluno-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditAlunoPage({ params }: { params: { id: string } }) {
  const aluno = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!aluno) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Editar Aluno</CardTitle>
          <CardDescription>
            Altere os dados de {aluno.nomeDeGuerra}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditAlunoForm aluno={aluno} />
        </CardContent>
      </Card>
    </div>
  );
}