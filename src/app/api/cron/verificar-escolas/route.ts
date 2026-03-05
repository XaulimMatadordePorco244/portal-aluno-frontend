import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { enviarNotificacaoPush } from '@/actions/push-actions'; 

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const anoAtual = new Date().getFullYear();

const alunosDesatualizadosCount = await prisma.perfilAluno.count({
        where: {
            usuario: {
                status: 'ATIVO',
                role: 'ALUNO'
            },
            OR: [
                { serieEscolar: null }, 
                {
                    serieEscolar: { not: 'CONCLUIDO' },
                    OR: [
                        { anoLetivoAtualizado: { lt: anoAtual } },
                        { escolaId: null },
                        { turno: null }
                    ]
                }
            ]
        }
    });

    if (alunosDesatualizadosCount === 0) {
      return NextResponse.json({ message: 'Tudo atualizado. Nenhuma notificação enviada.' });
    }

    const admins = await prisma.usuario.findMany({
      where: { role: 'ADMIN', status: 'ATIVO' }
    });

    const titulo = "Atenção Cadastral Obrigatória";
    const mensagem = `Temos ${alunosDesatualizadosCount} alunos com dados escolares desatualizados ou pendentes. Por favor, regularize a situação.`;
    const link = "/admin/dados-escolares";

    const notificacoesData = admins.map(admin => ({
      usuarioId: admin.id,
      titulo,
      mensagem,
      link,
      lida: false,
    }));

    await prisma.notificacao.createMany({
      data: notificacoesData,
    });

  
    await Promise.all(
      admins.map(admin => 
        enviarNotificacaoPush(admin.id, {
          titulo,
          mensagem,
          url: link,
          tag: 'alerta-dados-escolares' 
        })
      )
    );

    return NextResponse.json({ 
      success: true, 
      message: `Sininho e Push gerados para ${admins.length} admins.` 
    });

  } catch (error) {
    console.error('Erro no Cron Job de verificação escolar:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}