import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { EscalaPDFBuilder } from '@/lib/escalaPdfGenerator';
import { put } from '@vercel/blob';
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
  { params }: { params: Promise<{ id: string }> } 
) {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
  }

  const { id } = await params; // ✅ Aguardar params

  try {
    const escala = await getEscalaCompleta(id);
    if (!escala) {
      return NextResponse.json({ error: 'Escala não encontrada' }, { status: 404 });
    }


    let logoBase64 = '';
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
      const logoUrl = `${baseUrl}/img/logo.png`;
      
      const response = await fetch(logoUrl);
      if (response.ok) {
        const imageBuffer = await response.arrayBuffer();
        logoBase64 = Buffer.from(imageBuffer).toString('base64');
      } else {
        console.warn('Logo não encontrada, continuando sem logo...');
      }
    } catch (logoError) {
      console.warn('Erro ao carregar logo:', logoError);
    }
    
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
    return NextResponse.json({ 
      error: 'Não foi possível gerar o PDF.',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}