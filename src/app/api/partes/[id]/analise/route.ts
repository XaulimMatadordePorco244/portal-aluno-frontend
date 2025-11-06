import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ResultadoAnalise } from '@prisma/client';
import { Resend } from 'resend'; 
import ParteAnaliseEmail from '@/emails/ParteAnaliseEmail'; 

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const user = await getCurrentUser();
      const { id: parteId } = await params;

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { resultado, observacoes } = await req.json();
    if (!resultado || !Object.values(ResultadoAnalise).includes(resultado)) {
      return NextResponse.json({ error: 'Resultado da análise é inválido.' }, { status: 400 });
    }

    const { novaAnalise, parteAtualizada } = await prisma.$transaction(async (tx) => {
      const parte = await tx.parte.findUnique({
        where: { id: parteId },
        include: { autor: true } 
      });

      if (!parte) {
        throw new Error('Parte não encontrada.');
      }

      const parteAtualizada = await tx.parte.update({
        where: { id: parteId },
        data: { status: 'ANALISADA' },
        include: { autor: true } 
      });

      const novaAnalise = await tx.analise.create({
        data: {
          resultado,
          observacoes,
          parteId,
          analistaId: user.userId,
        },
      });

      await tx.logParte.create({
        data: {
            acao: `ANALISE: ${resultado}`,
            detalhes: observacoes,
            parteId,
            atorId: user.userId,
        }
      });
      
      return { novaAnalise, parteAtualizada };
    });

    const autor = parteAtualizada.autor;
    if (autor && autor.email) {
      const parteLink = `${process.env.NEXT_PUBLIC_APP_URL}/partes/${parteId}`;
      
      await resend.emails.send({
        from: 'Portal do Aluno <onboarding@resend.dev>', 
        to: autor.email,
        subject: `Sua parte foi analisada: ${parteAtualizada.assunto}`,
        react: ParteAnaliseEmail({
          alunoNome: autor.nomeDeGuerra || autor.nome,
          parteAssunto: parteAtualizada.assunto,
          resultado: novaAnalise.resultado,
          observacoes: novaAnalise.observacoes,
          parteLink: parteLink,
        }),
      });
    }

    return NextResponse.json(novaAnalise, { status: 201 });

  } catch (error: unknown) {
    console.error("Erro ao analisar parte:", error);

    if (error instanceof Error) {
      if (error.message === 'Parte não encontrada.') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}