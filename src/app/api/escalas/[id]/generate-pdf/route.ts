import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { EscalaPDFBuilder } from '@/lib/escalaPdfGenerator';
import { put } from '@vercel/blob';
import { format } from 'date-fns';
import { EscalaCompleta } from '@/app/admin/escalas/[id]/page'; 

async function getEscalaCompleta(id: string): Promise<EscalaCompleta | null> {
  const escala = await prisma.escala.findUnique({
    where: { id },
    include: {
      itens: {
        include: {
          aluno: {
            include: {
              usuario: true,
              funcao: true,
              cargo: true
            }
          },
        },
        orderBy: { secao: 'asc' },
      },
      criadoPor: true,
    },
  });

  if (!escala) return null;

  return {
    ...escala,
    itens: escala.itens.map(item => ({
      ...item,
      alunoId: item.aluno.usuarioId,
      funcaoId: item.aluno.funcao?.id || null 
    }))
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const escala = await getEscalaCompleta(id);
    if (!escala) {
      return NextResponse.json({ error: 'Escala não encontrada' }, { status: 404 });
    }

    const pdfBuilder = new EscalaPDFBuilder(escala);
    const pdfBytes = await pdfBuilder.build();

    const pdfBuffer = Buffer.from(pdfBytes);

    const dataFormatada = format(new Date(escala.dataEscala), 'dd.MM.yyyy');
    const fileName = `ESCALA.${dataFormatada}-${escala.id}.pdf`;
    const filePath = `escalas/${fileName}`;
    
    const blob = await put(filePath, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
    });

    const escalaAtualizada = await prisma.escala.update({
      where: { id: escala.id },
      data: {
        pdfUrl: blob.url,
      },
    });

    return NextResponse.json(escalaAtualizada);

  } catch (error) {
    console.error("Erro ao gerar PDF da escala:", error);
    return NextResponse.json({ 
      error: 'Não foi possível gerar o PDF.',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}