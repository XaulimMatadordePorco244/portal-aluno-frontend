import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';
import { TipoEscala } from '@prisma/client';


const escalaItemSchema = z.object({
  secao: z.string().min(1),
  cargo: z.string().min(1),
  horarioInicio: z.string().regex(/^\d{2}:\d{2}$/),
  horarioFim: z.string().regex(/^\d{2}:\d{2}$/),
  alunoId: z.string().cuid(),
  observacao: z.string().optional(),
});


const updateEscalaSchema = z.object({
  dataEscala: z.string().datetime(),
  tipo: z.nativeEnum(TipoEscala),
  elaboradoPor: z.string().min(3),
  itens: z.array(escalaItemSchema).min(1, "A escala precisa ter pelo menos um item."),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {

  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
  }

  const { id } = params;
  const body = await request.json();


  const validation = updateEscalaSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: validation.error.format() }, { status: 400 });
  }

  const { dataEscala, tipo, elaboradoPor, itens } = validation.data;

  try {
    
    const escalaAtualizada = await prisma.$transaction(async (tx) => {
   
      const escala = await tx.escala.update({
        where: { id },
        data: {
          dataEscala: new Date(dataEscala),
          tipo,
          elaboradoPor,
        },
      });

      
      await tx.escalaItem.deleteMany({
        where: { escalaId: id },
      });


      await tx.escalaItem.createMany({
        data: itens.map(item => ({
          ...item,
          escalaId: escala.id,
        })),
      });

      return escala;
    });

    return NextResponse.json(escalaAtualizada);

  } catch (error) {
    console.error("Erro ao atualizar escala:", error);

    if (error instanceof Error && error.message.includes('Record to update not found')) {
        return NextResponse.json({ error: 'Escala não encontrada.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Não foi possível atualizar a escala.' }, { status: 500 });
  }
}