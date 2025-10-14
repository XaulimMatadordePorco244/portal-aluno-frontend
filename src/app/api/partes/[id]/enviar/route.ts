// app/api/partes/[id]/enviar/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // params é uma Promise
) {
  try {
    const user = await getCurrentUser();
    // Aguardar a Promise dos params
    const { id: parteId } = await params;

    if (!user?.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const parte = await prisma.parte.findUnique({
      where: { id: parteId },
    });

    if (!parte) {
      return NextResponse.json({ error: 'Parte não encontrada.' }, { status: 404 });
    }
    if (parte.autorId !== user.userId) {
      return NextResponse.json({ error: 'Você não tem permissão para editar esta parte.' }, { status: 403 });
    }
    if (parte.status !== 'RASCUNHO') {
      return NextResponse.json({ error: 'Esta parte não pode mais ser enviada.' }, { status: 400 });
    }

    const parteAtualizada = await prisma.parte.update({
      where: { id: parteId },
      data: {
        status: 'ENVIADA',
        dataEnvio: new Date(),
      },
    });

    return NextResponse.json(parteAtualizada);

  } catch (error) {
    console.error("Erro ao enviar parte:", error);
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}