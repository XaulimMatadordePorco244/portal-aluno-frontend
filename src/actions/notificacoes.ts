"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth"; 
import { revalidatePath } from "next/cache";




export async function criarNotificacao(usuarioId: string, titulo: string, mensagem: string, linkRelacionado?: string) {
  try {
    await prisma.notificacao.create({
      data: {
        usuarioId,     
        titulo,         
        mensagem,       
        link: linkRelacionado || null,
        lida: false,
    
      }
    });
  } catch (error) {
    console.error("Erro ao criar notificação no banco de dados:", error);
  }
}


export async function getNotificacoes() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autorizado");

  const notificacoes = await prisma.notificacao.findMany({
    where: { usuarioId: user.userId }, 
    orderBy: { createdAt: 'desc' },
    take: 30, 
  });

  const naoLidasCount = await prisma.notificacao.count({
    where: { usuarioId: user.userId, lida: false },
  });

  return { notificacoes, naoLidasCount };
}

export async function marcarNotificacaoComoLida(id: string) {
  const user = await getCurrentUser();
  if (!user) return;


  await prisma.notificacao.updateMany({
    where: { 
        id: id,
        usuarioId: user.userId 
    },
    data: { lida: true },
  });

  revalidatePath("/"); 
}

export async function marcarTodasComoLidas() {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.notificacao.updateMany({
    where: { 
        usuarioId: user.userId, 
        lida: false 
    },
    data: { lida: true },
  });

  revalidatePath("/");
}