import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdminStudentHistoryClient from "./client";
import { recalcularConceitoAluno } from "@/lib/conceitoUtils"; 

interface PageProps {
  params: {
    id: string;
  };
}

export default async function AdminStudentDetailsPage({ params }: PageProps) {
  const alunoId = params.id;

  const perfilAluno = await prisma.perfilAluno.findUnique({
    where: { id: alunoId }, 
    include: {
      usuario: true,
      cargo: true,
    }
  });

  if (!perfilAluno) {
    return notFound();
  }

  const conceitoAtual = await recalcularConceitoAluno(alunoId);

  const anotacoes = await prisma.anotacao.findMany({
    where: { alunoId: alunoId },
    include: {
      tipo: true,
      autor: {
        include: {
          perfilAluno: {
            include: { cargo: true } 
          }
        }
      },
      quemAnotou: {
        include: {
          perfilAluno: {
            include: { cargo: true }
          }
        }
      }
    },
    orderBy: {
      data: 'desc',
    },
  });

  return (
    <AdminStudentHistoryClient 
      perfilAluno={perfilAluno}
      anotacoes={anotacoes}
      conceitoAtual={conceitoAtual}
    />
  );
}