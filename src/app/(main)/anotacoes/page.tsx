import { getCurrentUserWithRelations } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import EvaluationsClient from "./evaluations-client"; 
import { recalcularConceitoAluno } from "@/lib/conceitoUtils";

export type AnotacaoComRelacoes = Awaited<ReturnType<typeof getAlunoData>>['anotacoes'][0];

async function getAlunoData() {
  const user = await getCurrentUserWithRelations();
  if (!user) {
    redirect('/login');
  }

  const perfilId = user.perfilAluno?.id;

  if (!perfilId) {
    return { 
      user, 
      anotacoes: [], 
      conceitoAtual: 0 
    };
  }

  const novoConceito = await recalcularConceitoAluno(perfilId);

  const anotacoes = await prisma.anotacao.findMany({
    where: { alunoId: perfilId },
    include: {
      tipo: true,
      autor: {
        include: {
          perfilAluno: {
            include: {
              cargo: true
            }
          }
        }
      },
    },
    orderBy: {
      data: 'desc',
    },
  });

  return { 
    user, 
    anotacoes, 
    conceitoAtual: novoConceito
  };
}

export default async function EvaluationsPage() {
  const { user, anotacoes, conceitoAtual} = await getAlunoData();

  return <EvaluationsClient 
    user={user} 
    anotacoes={anotacoes} 
    conceitoAtual={conceitoAtual} 
  />;
}