import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const agora = new Date();

    const atividadesExpiradas = await prisma.atividade.findMany({
      where: {
        prazoEntrega: {
          lt: agora, 
        },
        prazoEncerrado: false, 
      }
    });

    if (atividadesExpiradas.length === 0) {
      return NextResponse.json({ message: 'Nenhuma atividade expirada no momento.' });
    }

    for (const atividade of atividadesExpiradas) {
      
      await prisma.atividade.update({
        where: { id: atividade.id },
        data: { prazoEncerrado: true }
      });

      await prisma.notificacao.create({
        data: {
          usuarioId: atividade.criadoPorId, 
          titulo: "Prazo Encerrado!",
          mensagem: `O prazo da atividade "${atividade.titulo}" encerrou. Clique aqui para avaliar quem realizou ou para estender o prazo.`,
          lida: false,
          link: `/admin/atividades/${atividade.id}`,
        }
      });
      
    }

    return NextResponse.json({ 
      success: true, 
      notificadas: atividadesExpiradas.length 
    });

  } catch (error) {
    console.error("Erro no Cron de verificação de prazos:", error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}