import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';
import { StatusEscala, TipoEscala } from '@prisma/client';


const escalaItemSchema = z.object({
  secao: z.string().min(1, "A seção é obrigatória."),
  cargo: z.string().min(1, "O cargo é obrigatório."),
  horarioInicio: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido."),
  horarioFim: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido."),
  alunoId: z.string().cuid("ID de aluno inválido."),
  observacao: z.string().optional(),
});


const createEscalaSchema = z.object({
  dataEscala: z.string().datetime("Formato de data inválido."),
  tipo: z.nativeEnum(TipoEscala),
  elaboradoPor: z.string().min(3, "O nome do elaborador é obrigatório."),
  itens: z.array(escalaItemSchema).min(1, "A escala deve ter pelo menos um item."),
});

export async function POST(request: Request) {

  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
  }

  const body = await request.json();


  const validation = createEscalaSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: validation.error.format() }, { status: 400 });
  }

  const { dataEscala, tipo, elaboradoPor, itens } = validation.data;

  try {
   
    const novaEscala = await prisma.$transaction(async (tx) => {
      const escala = await tx.escala.create({
        data: {
          dataEscala: new Date(dataEscala),
          tipo: tipo,
          elaboradoPor: elaboradoPor,
          status: StatusEscala.RASCUNHO, 
          criadoPorId: user.userId,
        },
      });

   
      const itensParaCriar = itens.map(item => ({
        ...item,
        escalaId: escala.id,
      }));

      await tx.escalaItem.createMany({
        data: itensParaCriar,
      });

      return escala;
    });

    return NextResponse.json(novaEscala, { status: 201 }); 

  } catch (error) {
    console.error("Erro ao criar escala:", error);
    return NextResponse.json({ error: 'Não foi possível criar a escala.' }, { status: 500 });
  }
}