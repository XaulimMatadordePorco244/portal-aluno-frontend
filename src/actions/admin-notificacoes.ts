"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth"; 
import { revalidatePath } from "next/cache";

export async function getNotificacoesAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Não autorizado");


  const notificacoes = await prisma.notificacao.findMany({
    where: { 
      usuarioId: user.userId, 
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  const naoLidasCount = await prisma.notificacao.count({
    where: { usuarioId: user.userId, lida: false },
  });

  return { notificacoes, naoLidasCount };
}

export async function marcarNotificacaoAdminLida(id: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return;

  await prisma.notificacao.update({
    where: { id },
    data: { lida: true },
  });

  revalidatePath("/admin");
}


export async function notificarAdminsNovoFeedback(nomeAluno: string, idFeedback: string) {
  const admins = await prisma.usuario.findMany({
    where: { role: "ADMIN" }
  });

  const notificacoesData = admins.map(admin => ({
    usuarioId: admin.id,
    titulo: "Novo Feedback Recebido",
    mensagem: `${nomeAluno} enviou um novo feedback ao sistema.`,
    link: `/admin/feedback/${idFeedback}`, 
    lida: false,
  }));

  await prisma.notificacao.createMany({
    data: notificacoesData,
  });
}