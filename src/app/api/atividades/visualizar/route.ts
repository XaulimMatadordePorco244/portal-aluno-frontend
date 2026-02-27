import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const { atividadeAlunoId } = await request.json();

    const vinculo = await prisma.atividadeAluno.findUnique({
      where: { id: atividadeAlunoId }
    });


    if (vinculo && vinculo.status === 'PENDENTE') {
      await prisma.atividadeAluno.update({
        where: { id: atividadeAlunoId },
        data: {
          status: 'VISUALIZADO',
          visualizadoEm: new Date(),
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao gravar recibo de leitura:", error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}