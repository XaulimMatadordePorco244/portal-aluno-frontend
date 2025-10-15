import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { EscalaPDFBuilder } from '@/lib/escalaPdfGenerator';
import { put } from '@vercel/blob';
import path from 'path';
import fs from 'fs/promises';
import { format } from 'date-fns'; 

async function getEscalaCompleta(id: string) {
  return prisma.escala.findUnique({
    where: { id },
    include: {
      itens: {
        include: { aluno: true },
        orderBy: { secao: 'asc' },
      },
      criadoPor: true,
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
  }

  const { id } = params;

  try {
    const escala = await getEscalaCompleta(id);
    if (!escala) {
      return NextResponse.json({ error: 'Escala não encontrada' }, { status: 404 });
    }

    const imagePath = path.join(process.cwd(), 'public', 'logo-gm.png');
    const imageBuffer = await fs.readFile(imagePath);
    const logoBase64 = imageBuffer.toString('base64');
    
    const pdfBuilder = new EscalaPDFBuilder(escala, logoBase64);
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
    return NextResponse.json({ error: 'Não foi possível gerar o PDF.' }, { status: 500 });
  }
}