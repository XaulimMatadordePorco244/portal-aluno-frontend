import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth';


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRelations();
    if (!user || !canAccessAdminArea(user)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const cargoAbreviacao = formData.get('cargoAbreviacao') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Tipo de arquivo não permitido',
          allowedTypes: ALLOWED_TYPES,
          receivedType: file.type 
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'Arquivo muito grande',
          maxSize: '5MB',
          receivedSize: `${(file.size / 1024 / 1024).toFixed(2)}MB` 
        },
        { status: 400 }
      );
    }

    if (!cargoAbreviacao || cargoAbreviacao.trim().length < 2) {
      return NextResponse.json(
        { error: 'Abreviação do cargo é obrigatória' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const safeCargoName = cargoAbreviacao.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const extension = file.name.split('.').pop() || 'png';
    const fileName = `divisa_${safeCargoName}_${timestamp}.${extension}`;
    
    const pathname = `divisas/${fileName}`;

    const blob = await put(pathname, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      downloadUrl: blob.downloadUrl,
      contentType: blob.contentType,
      size: file.size,
      fileName,
      message: 'Divisa enviada com sucesso para o Vercel Blob Storage'
    });

} catch (error: unknown) {
  console.error('Erro no upload da divisa:', error);

  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'BlobError'
  ) {
    return NextResponse.json(
      {
        error: 'Erro no Blob Storage',
        details: 'message' in error ? String(error.message) : undefined,
        code: 'code' in error ? error.code : undefined
      },
      { status: 500 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message || 'Erro interno do servidor',
        stack:
          process.env.NODE_ENV === 'development'
            ? error.stack
            : undefined
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'Erro interno do servidor' },
    { status: 500 }
  );
}

}