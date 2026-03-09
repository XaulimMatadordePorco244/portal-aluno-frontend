import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const { fileBase64, fileName } = await req.json();

    if (!fileBase64 || !fileName) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const base64Data = fileBase64.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    const anoAtual = new Date().getFullYear();
    const filePath = `PARTES/${anoAtual}/${fileName}`;

    const blob = await put(filePath, buffer, {
      access: 'public',
      addRandomSuffix: false, 
      contentType: 'application/pdf', 
    });

    await prisma.parte.update({
      where: { id },
      data: { urlPdf: blob.url } 
    });

    return NextResponse.json({ 
      success: true, 
      urlPdf: blob.url,
      message: "PDF salvo com sucesso!"
    });

  } catch (error: unknown) {
    console.error("Erro no upload do PDF:", error);
    return NextResponse.json(
      { error: "Falha ao salvar o documento no servidor." },
      { status: 500 }
    );
  }
}