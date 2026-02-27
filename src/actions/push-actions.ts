"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth"; 
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT as string,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export type PushSubscriptionType = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export async function salvarSubscricao(subscription: PushSubscriptionType) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Não autorizado");

    const subExiste = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint },
    });

    if (!subExiste) {
      await prisma.pushSubscription.create({
        data: {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          usuarioId: user.userId,
        },
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar subscrição:", error);
    return { success: false, error: "Falha ao guardar subscrição" };
  }
}

export async function enviarNotificacaoPush(userId: string, payload: { titulo: string; mensagem: string; url?: string; tag?: string }) {
  try {
    const subs = await prisma.pushSubscription.findMany({
      where: { usuarioId: userId },
    });

    if (subs.length === 0) return; 

    const notificacaoPromises = subs.map((sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth,
          p256dh: sub.p256dh,
        },
      };

      return webpush.sendNotification(
        pushSubscription,
        JSON.stringify({
          title: payload.titulo,
          body: payload.mensagem,
          url: payload.url || "/",
          tag: payload.tag 
        })
      ).catch(async (err) => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
      });
    });

    await Promise.all(notificacaoPromises);
  } catch (error) {
    console.error("Erro ao enviar push:", error);
  }
}

export async function notificarTodosAlunosEscala(payload: { titulo: string; mensagem: string; url?: string; tag?: string }) {
  try {
    const subscricoes = await prisma.pushSubscription.findMany({
      where: {
        usuario: {
          role: "ALUNO",
          status: "ATIVO"
        }
      }
    });

    if (subscricoes.length === 0) {
      console.log("Nenhum aluno inscrito para receber notificações gerais.");
      return;
    }

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const promessasDeEnvio = subscricoes.map((sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth,
          p256dh: sub.p256dh,
        },
      };

      return webpush.sendNotification(pushSubscription, JSON.stringify(payload)).catch((error) => {
        if (error.statusCode === 404 || error.statusCode === 410) {
          return prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
        console.error("Erro ao enviar push para subscrição:", sub.id, error);
      });
    });

    await Promise.all(promessasDeEnvio);
    console.log(`Notificação geral enviada para ${subscricoes.length} dispositivos.`);
    
  } catch (error) {
    console.error("Erro fatal ao notificar todos os alunos:", error);
  }
}