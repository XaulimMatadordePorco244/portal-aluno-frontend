import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user?.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { assunto, conteudo } = await req.json();

    if (!assunto || !conteudo) {
      return NextResponse.json({ error: 'Assunto e conteúdo são obrigatórios.' }, { status: 400 });
    }

   
    const novaParte = await prisma.$transaction(async (tx) => {
        
        const config = await tx.configuracao.update({
            where: { id: "singleton" },
            data: {
                ultimaParteNumero: {
                    increment: 1,
                },
            },
        });

        const novoNumero = config.ultimaParteNumero;

   
        const numeroFormatado = `DOC-${String(novoNumero).padStart(4, '0')}-${new Date().getFullYear()}`;

        const parteCriada = await tx.parte.create({
            data: {
                assunto,
                conteudo,
                autorId: user.userId,
                numeroDocumento: numeroFormatado,
            },
        });

        return parteCriada;
    });


    return NextResponse.json(novaParte, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar parte:", error);
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}