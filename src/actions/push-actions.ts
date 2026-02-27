"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth"; 
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT as string,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function salvarSubscricao(subscription: any) {
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