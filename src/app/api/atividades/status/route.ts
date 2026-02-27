import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  try {
    const { atividadeAlunoId, status } = await request.json();
    await prisma.atividadeAluno.update({
      where: { id: atividadeAlunoId },
      data: { status }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}