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

    const { novoResultado, justificativa } = await req.json();

    if (!novoResultado || !Object.values(ResultadoAnalise).includes(novoResultado)) {
      return NextResponse.json({ error: 'Novo resultado é inválido.' }, { status: 400 });
    }
    if (!justificativa) {
        return NextResponse.json({ error: 'A justificativa é obrigatória para reverter uma decisão.' }, { status: 400 });
    }

    const parte = await prisma.parte.findUnique({ where: { id: parteId } });
    if (!parte || parte.status !== 'ANALISADA') {
      return NextResponse.json({ error: 'Apenas partes já analisadas podem ter a decisão revertida.' }, { status: 400 });
    }
    
 
    const [novaAnalise, log] = await prisma.$transaction(async (tx) => {
     
      const analise = await tx.analise.create({
        data: {
          resultado: novoResultado,
          observacoes: `[REVERSÃO] ${justificativa}`,
          parteId,
          analistaId: user.userId,
        },
      });

   
      const logReversao = await tx.logParte.create({
        data: {
            acao: `REVERSAO: ${novoResultado}`,
            detalhes: justificativa,
            parteId,
            atorId: user.userId,
        }
      });
      
      return [analise, logReversao];
    });



    return NextResponse.json(novaAnalise, { status: 201 });

  } catch (error) {
    console.error("Erro ao reverter análise:", error);
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}