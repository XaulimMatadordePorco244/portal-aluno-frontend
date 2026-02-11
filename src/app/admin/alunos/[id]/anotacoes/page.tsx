import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdminStudentHistoryClient from "./client";
import { recalcularConceitoAluno } from "@/lib/conceitoUtils";

interface PageProps {
  params: Promise<{ 
    id: string;
  }>;
}

export default async function AdminStudentDetailsPage({ params }: PageProps) {
  const { id: alunoId } = await params;  

  const perfilAluno = await prisma.perfilAluno.findUnique({
    where: { id: alunoId }, 
    include: {
      usuario: true,
      cargo: true,
      funcao: true,
      companhia: true,
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
            include: { 
              cargo: true,
              funcao: true,
              companhia: true
            } 
          }
        }
      },
      quemAnotou: {
        include: {
          perfilAluno: {
            include: { 
              cargo: true,
              funcao: true,
              companhia: true
            }
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