import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';
import { StatusEscala } from '@prisma/client';

const updateStatusSchema = z.object({
  status: z.nativeEnum(StatusEscala),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
 
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const validation = updateStatusSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
  }

  const { status: novoStatus } = validation.data;

  try {
 
    const escalaAtual = await prisma.escala.findUnique({ where: { id } });
    if (!escalaAtual) {
      return NextResponse.json({ error: 'Escala não encontrada' }, { status: 404 });
    }

  
    if (novoStatus === 'PUBLICADA' && !escalaAtual.pdfUrl) {
      return NextResponse.json({ error: 'Gere o PDF da escala antes de publicar.' }, { status: 400 });
    }

 
    const escalaAtualizada = await prisma.escala.update({
      where: { id },
      data: {
        status: novoStatus,
              publishedAt: novoStatus === 'PUBLICADA' ? new Date() : escalaAtual.publishedAt,
      },
    });

    return NextResponse.json(escalaAtualizada);

  } catch (error) {
    console.error("Erro ao atualizar status da escala:", error);
    return NextResponse.json({ error: 'Não foi possível atualizar o status da escala.' }, { status: 500 });
  }
}