import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user?.userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const parte = await prisma.parte.findUnique({ where: { id } });

    if (!parte) return NextResponse.json({ error: 'Parte não encontrada' }, { status: 404 });

    if (parte.autorId !== user.userId) {
      return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });
    }
    if (parte.status !== 'RASCUNHO') {
      return NextResponse.json({ error: 'Não é possível excluir uma parte que já foi enviada.' }, { status: 400 });
    }

    await prisma.parte.delete({ where: { id } });

    return NextResponse.json({ message: 'Parte excluída com sucesso' });

  } catch {
    return NextResponse.json({ error: 'Erro ao excluir parte' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const body = await req.json();

    if (!user?.userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const parte = await prisma.parte.findUnique({ where: { id } });

    if (!parte) return NextResponse.json({ error: 'Parte não encontrada' }, { status: 404 });

    if (parte.autorId !== user.userId) {
      return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });
    }
    if (parte.status !== 'RASCUNHO') {
      return NextResponse.json({ error: 'Não é possível editar uma parte já enviada.' }, { status: 400 });
    }

    const parteAtualizada = await prisma.parte.update({
        where: { id },
        data: {
            assunto: body.assunto,
            conteudo: body.conteudo,
            dataFato: body.dataFato ? new Date(body.dataFato) : undefined,
        }
    });

    return NextResponse.json(parteAtualizada);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar rascunho' }, { status: 500 });
  }
}