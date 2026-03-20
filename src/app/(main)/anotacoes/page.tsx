import { getCurrentUserWithRelations } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import EvaluationsClient from "./evaluations-client"; 
import { recalcularConceitoAluno } from "@/lib/conceitoUtils";

export type AnotacaoComRelacoes = Awaited<ReturnType<typeof getAlunoData>>['anotacoes'][0];
export type SuspensaoComRelacoes = Awaited<ReturnType<typeof getAlunoData>>['suspensoes'][0];

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
      suspensoes: [],
      conceitoAtual: 0 
    };
  }

  const novoConceito = await recalcularConceitoAluno(perfilId);

  const blocoAtivo = await prisma.cargoHistory.findFirst({
    where: {
      alunoId: perfilId,
      status: "ATIVO"
    },
    select: { id: true }
  });

  const anotacoes = await prisma.anotacao.findMany({
    where: { 
      alunoId: perfilId,
      blocoCargoId: blocoAtivo?.id || null 
    },
    include: {
      tipo: true,
      autor: {
        include: {
          perfilAluno: { include: { cargo: true } }
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
      alunoId: perfilId 
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

  return { 
    user, 
    anotacoes, 
    suspensoes,
    conceitoAtual: novoConceito
  };
}

export default async function EvaluationsPage() {
  const { user, anotacoes, suspensoes, conceitoAtual} = await getAlunoData();

  return <EvaluationsClient 
    user={user} 
    anotacoes={anotacoes} 
    suspensoes={suspensoes}
    conceitoAtual={conceitoAtual} 
  />;
}