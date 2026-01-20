import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { TipoProcesso } from '@prisma/client'; 
import { parteService } from '@/services/parteService'; 

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { assunto, conteudo, tipo, dataFato } = body; 

    if (!assunto?.trim() || !conteudo?.trim() || !tipo) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 });
    }

    if (!Object.values(TipoProcesso).includes(tipo)) {
        return NextResponse.json({ error: 'Tipo de processo inválido.' }, { status: 400 });
    }

    const novaParte = await parteService.criar({
        assunto,
        conteudo,
        tipo,
        autorId: user.userId,
        dataFato 
    });

    return NextResponse.json(novaParte, { status: 201 });

  } catch (error: any) {
    console.error("Erro ao criar parte:", error);
    return NextResponse.json(
        { error: error.message || 'Erro interno ao criar parte.' }, 
        { status: 400 } 
    );
  }
}