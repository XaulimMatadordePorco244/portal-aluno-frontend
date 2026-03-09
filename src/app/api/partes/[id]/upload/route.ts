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

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const anoAtual = new Date().getFullYear();
    const filePath = `PARTES/${anoAtual}/${file.name}`;

    const blob = await put(filePath, file, {
      access: 'public',
      addRandomSuffix: false, 
    });

    await prisma.parte.update({
      where: { id },
      data: { 
        urlPdf: blob.url 
      }
    });

    return NextResponse.json({ 
      success: true, 
      url: blob.url,
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