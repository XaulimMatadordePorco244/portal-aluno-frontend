import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ResultadoAnalise } from '@prisma/client';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    const parteId = params.id;

 
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { resultado, observacoes } = await req.json();

   
    if (!resultado || !Object.values(ResultadoAnalise).includes(resultado)) {
      return NextResponse.json({ error: 'Resultado da análise é inválido.' }, { status: 400 });
    }

    const parte = await prisma.parte.findUnique({ where: { id: parteId } });
    if (!parte) {
      return NextResponse.json({ error: 'Parte não encontrada.' }, { status: 404 });
    }
    
   
    const transacao = await prisma.$transaction(async (tx) => {

      const parteAtualizada = await tx.parte.update({
        where: { id: parteId },
        data: {
          status: 'ANALISADA',
        },
      });

      const novaAnalise = await tx.analise.create({
        data: {
          resultado,
          observacoes,
          parteId,
          analistaId: user.userId,
        },
      });

      await tx.logParte.create({
        data: {
            acao: `ANALISE: ${resultado}`,
            detalhes: observacoes,
            parteId,
            atorId: user.userId,
        }
      });
      
      return { parteAtualizada, novaAnalise };
    });



    return NextResponse.json(transacao.novaAnalise, { status: 201 });

  } catch (error) {
    console.error("Erro ao analisar parte:", error);
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}