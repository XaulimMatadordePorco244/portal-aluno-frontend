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

  const blocoAtivo = await prisma.cargoHistory.findFirst({
    where: {
      alunoId: alunoId,
      status: "ATIVO"
    },
    select: { id: true }
  });

  const anotacoes = await prisma.anotacao.findMany({
    where: { 
      alunoId: alunoId,
      blocoCargoId: blocoAtivo?.id || null 
    },
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
          perfilAluno: { include: { cargo: true } }
        }
      }
    },
    orderBy: { data: 'desc' },
  });

  const suspensoes = await prisma.suspensao.findMany({
    where: { 
      alunoId: alunoId 
    },
    include: {
      tipo: true,
      quemLancou: {
        include: {
          perfilAluno: { include: { cargo: true } }
        }
      },
      quemAplicou: {
        include: {
          perfilAluno: { include: { cargo: true } }
        }
      }
    },
    orderBy: { dataOcorrencia: 'desc' },
  });

  return (
    <div >
      <AdminStudentHistoryClient 
        student={perfilAluno as any} 
        conceitoAtual={conceitoAtual}
        anotacoes={anotacoes as any}
        suspensoes={suspensoes as any} 
      />
    </div>
  );
}