import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { EscalaPDFBuilder } from '@/lib/escalaPdfGenerator';
import { put } from '@vercel/blob';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EscalaCompleta } from '@/app/admin/escalas/[id]/page';
import { StatusEscala } from '@prisma/client';
import { criarNotificacao } from '@/actions/notificacoes';
import webpush from 'web-push';

if (process.env.NEXT_PUBLIC_VAPID_SUBJECT && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.NEXT_PUBLIC_VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

async function getEscalaCompleta(id: string): Promise<EscalaCompleta | null> {
  const escala = await prisma.escala.findUnique({
    where: { id },
    include: {
      itens: {
        include: {
          aluno: { 
            include: {
              perfilAluno: { 
                include: {
                  funcao: true,
                  cargo: true
                }
              },
              funcaoAdmin: true 
            }
          },
        },
        orderBy: { secao: 'asc' },
      },
      criadoPor: { include: { funcaoAdmin: true } },
    },
  });

  if (!escala) return null;

  return {
    ...escala,
    itens: escala.itens.map(item => ({
      ...item,
      alunoId: item.aluno.id, 
      funcaoId: item.aluno.perfilAluno?.funcao?.id || null 
    }))
  } as EscalaCompleta; 
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const escala = await getEscalaCompleta(id);
    if (!escala) {
      return NextResponse.json({ error: 'Escala não encontrada' }, { status: 404 });
    }

    const pdfBuilder = new EscalaPDFBuilder(escala);
    const pdfBytes = await pdfBuilder.build(); 
    const pdfBuffer = Buffer.from(pdfBytes);

    const dataFormatada = format(new Date(escala.dataEscala), 'dd.MM.yyyy');
    const fileName = `ESCALA.${dataFormatada}-${escala.id}.pdf`;
    const filePath = `escalas/${fileName}`;
    
    const blob = await put(filePath, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
    });

    const escalaAtualizada = await prisma.escala.update({
      where: { id: escala.id },
      data: {
        pdfUrl: blob.url,
        status: StatusEscala.PUBLICADA, 
        publishedAt: new Date(), 
      },
    });

    
    const dataEscalaFormatada = format(new Date(escala.dataEscala), "dd/MM/yyyy (EEEE)", { locale: ptBR });
    
    const idsAlunos = Array.from(new Set(escala.itens.map(item => item.alunoId)));

    const tituloNotif = "Nova Escala Publicada!";
    const msgNotif = `Você foi escalado para o dia ${dataEscalaFormatada}.`;
    const linkNotif = blob.url;

    await Promise.all(idsAlunos.map(async (alunoId) => {
      await criarNotificacao(alunoId, tituloNotif, msgNotif, linkNotif);

      if (process.env.NEXT_PUBLIC_VAPID_SUBJECT && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        const subscricoes = await prisma.pushSubscription.findMany({
          where: { usuarioId: alunoId }
        });

        for (const sub of subscricoes) {
          try {
            const pushConfig = {
              endpoint: sub.endpoint,
              keys: {
                auth: sub.auth,
                p256dh: sub.p256dh
              }
            };

            await webpush.sendNotification(
              pushConfig,
              JSON.stringify({
                title: tituloNotif,
                body: msgNotif,
                url: linkNotif
              })
            );
          } catch (err) {
            console.error(`Falha ao enviar push para subscricao ${sub.id}:`, err);
          }
        }
      }
    }));

    return NextResponse.json(escalaAtualizada);

  } catch (error) {
    console.error("Erro ao publicar escala:", error);
    return NextResponse.json({ 
      error: 'Não foi possível gerar a publicação.',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}