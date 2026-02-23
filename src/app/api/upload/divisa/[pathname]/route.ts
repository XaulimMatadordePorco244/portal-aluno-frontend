import { NextRequest, NextResponse } from 'next/server';
import { del, head } from '@vercel/blob';
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth';

interface RouteContext {
  params: Promise<{
    pathname: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { pathname } = await context.params;
    const user = await getCurrentUserWithRelations();
    
    if (!user || !canAccessAdminArea(user)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const blobInfo = await head(`divisas/${pathname}`);

    return NextResponse.json({
      exists: true,
      url: blobInfo.url,
      pathname: blobInfo.pathname,
      size: blobInfo.size,
      uploadedAt: blobInfo.uploadedAt,
      contentType: blobInfo.contentType,
    });

  } catch (error) {
    if (error instanceof Error && error.message.includes('Blob not found')) {
      return NextResponse.json(
        { exists: false, error: 'Divisa não encontrada' },
        { status: 404 }
      );
    }

    console.error('Erro ao buscar divisa:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { pathname } = await context.params;
    const user = await getCurrentUserWithRelations();
    
    if (!user || !canAccessAdminArea(user)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    try {
      await head(`divisas/${pathname}`);
    } catch {
      return NextResponse.json(
        { error: 'Divisa não encontrada' },
        { status: 404 }
      );
    }

    await del(`divisas/${pathname}`);

    return NextResponse.json({
      success: true,
      message: 'Divisa removida com sucesso',
      deletedPathname: pathname,
    });

  } catch (error: unknown) {
    console.error('Erro ao remover divisa:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}