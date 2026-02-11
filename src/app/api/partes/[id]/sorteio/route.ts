import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { oficiaisSelecionadosIds } = await req.json(); 


    if (!oficiaisSelecionadosIds || oficiaisSelecionadosIds.length === 0) {
       return NextResponse.json({ error: 'Nenhum oficial selecionado para sorteio.' }, { status: 400 });
    }

    const oficialSorteadoId = oficiaisSelecionadosIds[Math.floor(Math.random() * oficiaisSelecionadosIds.length)];

    await prisma.$transaction(async (tx) => {
      const prazo = new Date();
      prazo.setDate(prazo.getDate() + 10);

      await tx.processoBravura.create({
        data: {
            parteId: id,
            oficialId: oficialSorteadoId,
            prazoInvestigacao: prazo
        }
      });

      await tx.parte.update({
        where: { id },
        data: {
            status: 'EM_INVESTIGACAO',
            responsavelAtualId: oficialSorteadoId 
        }
      });

    });

    return NextResponse.json({ message: 'Oficial sorteado e processo iniciado.' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro no sorteio.' }, { status: 500 });
  }
}