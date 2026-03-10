import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';
import { StatusEscala, TipoEscala } from '@prisma/client';
import { notificarTodosAlunosEscala } from '@/actions/push-actions';

const escalaItemSchema = z.object({
  secao: z.string().min(1, "A seção é obrigatória."),
  cargo: z.string().min(1, "O cargo/função/tema é obrigatório."),
  horarioInicio: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)."),
  horarioFim: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)."),
  alunoId: z.string().cuid("ID de usuário inválido."),
  observacao: z.string().nullable().optional(),
});

const createEscalaSchema = z.object({
  titulo: z.string().optional(), 
  dataEscala: z.string().datetime("Formato de data inválido."),
  tipo: z.nativeEnum(TipoEscala),
  elaboradoPor: z.string().min(3, "O nome do elaborador é obrigatório."),
  itens: z.array(escalaItemSchema).min(1, "A escala deve ter pelo menos um item."),
  fardamento: z.string().optional(),
  observacoes: z.string().optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }

  const validation = createEscalaSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: validation.error.format() }, { status: 400 });
  }

  const { titulo, dataEscala, tipo, elaboradoPor, itens, fardamento, observacoes } = validation.data;

  try {
    const novaEscala = await prisma.$transaction(async (tx) => {
      const escala = await tx.escala.create({
        data: {
          titulo: titulo, 
          dataEscala: new Date(dataEscala),
          tipo: tipo,
          elaboradoPor: elaboradoPor,
          status: StatusEscala.RASCUNHO,
          criadoPorId: user.userId,
          fardamento: fardamento,
          observacoes: observacoes,
        },
      });

      const itensParaCriar = itens.map(item => ({
        secao: item.secao,
        cargo: item.cargo,
        horarioInicio: item.horarioInicio,
        horarioFim: item.horarioFim,
        alunoId: item.alunoId,
        observacao: item.observacao,
        escalaId: escala.id,
      }));

      await tx.escalaItem.createMany({
        data: itensParaCriar,
      });

      return escala;
    });

    try {
      const dataFormatada = new Date(dataEscala).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      notificarTodosAlunosEscala({
        titulo: "⚠️ Nova Escala Publicada!",
        mensagem: `Uma nova escala para o dia ${dataFormatada} acabou de ser publicada. Verifique o portal!`,
        url: "/escalas",
        tag: "nova-escala"
      });
    } catch (notifError) {
      console.error("A escala foi salva, mas falhou ao enviar notificações de push:", notifError);
    }

    return NextResponse.json(novaEscala, { status: 201 });

  } catch (error: unknown) {
    console.error("Erro ao salvar a escala:", error);
    return NextResponse.json({ error: 'Não foi possível criar a escala.' }, { status: 500 });
  }
}