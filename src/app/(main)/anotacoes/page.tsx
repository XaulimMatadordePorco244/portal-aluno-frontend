import { getCurrentUserWithRelations } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import EvaluationsClient from "./evaluations-client"; 



export type AnotacaoComRelacoes = Awaited<ReturnType<typeof getAlunoData>>['anotacoes'][0];

async function getAlunoData() {
  const user = await getCurrentUserWithRelations();
  if (!user) {
    redirect('/login');
  }

  const anotacoes = await prisma.anotacao.findMany({
    where: { alunoId: user.id },
    include: {
      tipo: true,
      autor: true,
    },
    orderBy: {
      data: 'desc',
    },
  });

  return { user, anotacoes };
}

export default async function EvaluationsPage() {
  const { user, anotacoes } = await getAlunoData();

  return <EvaluationsClient user={user} anotacoes={anotacoes} />;
}