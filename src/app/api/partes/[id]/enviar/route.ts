import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { parteService } from '@/services/parteService';

export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const user = await getCurrentUser();
    
    if (!user?.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const parteEnviada = await parteService.enviarParaAnalise(id, user.userId);

    return NextResponse.json(parteEnviada);

  } catch (error: unknown) {
    console.error("Erro ao enviar parte:", error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar o envio.' }, 
      { status: 400 }
    );
  }
}