import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditEscalaForm } from "./edit-escala-form";
import { getCurrentUser } from "@/lib/auth";
import { Scale } from "lucide-react";


export type EscalaCompleta = NonNullable<Awaited<ReturnType<typeof getEscalaDetails>>>;


async function getEscalaDetails(id: string) {
  const escala = await prisma.escala.findUnique({
    where: { id },
    include: {
      itens: {
        include: {
          aluno: true, 
        },
        orderBy: {
          secao: 'asc', 
        },
      },
      criadoPor: true,
    },
  });
  return escala;
}


async function getAlunos() {
    return prisma.user.findMany({
        where: { role: 'ALUNO', status: 'ATIVO' },
        orderBy: { nomeDeGuerra: 'asc' }
    });
}

type PageProps = {
    params: { id: string };
};

export default async function DetalheEscalaPage({ params }: PageProps) {
  const { id } = params;

  const [escala, alunos, currentUser] = await Promise.all([
    getEscalaDetails(id),
    getAlunos(),
    getCurrentUser()
  ]);

  if (!escala) {
    notFound();
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Scale className="w-8 h-8 text-foreground" />
          <h1 className="text-3xl font-bold text-foreground">Detalhes da Escala</h1>
        </div>
      </div>
      
 
      <EditEscalaForm escalaInicial={escala} alunos={alunos} />
    </>
  );
}