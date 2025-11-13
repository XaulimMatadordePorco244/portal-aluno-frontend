import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';
import { StatusEscala, TipoEscala } from '@prisma/client';


const escalaItemSchema = z.object({
  secao: z.string().min(1, "A seção é obrigatória."),
  cargo: z.string().min(1, "O cargo/função/tema é obrigatório."), 
  horarioInicio: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)."),
  horarioFim: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)."),
  alunoId: z.string().cuid("ID de usuário inválido."),
  observacao: z.string().nullable().optional(), 

});


const createEscalaSchema = z.object({
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
  } catch (error) {
      return NextResponse.json({ error: 'JSON inválido no corpo da requisição.' }, { status: 400 });
  }


  const validation = createEscalaSchema.safeParse(body);
  if (!validation.success) {
    
    console.error("Erro de validação Zod:", JSON.stringify(validation.error.format(), null, 2));
    return NextResponse.json({ error: 'Dados inválidos', details: validation.error.format() }, { status: 400 });
  }

  const { dataEscala, tipo, elaboradoPor, itens, fardamento, observacoes } = validation.data;

  try {
    const novaEscala = await prisma.$transaction(async (tx) => {
      const escala = await tx.escala.create({
        data: {
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

    return NextResponse.json(novaEscala, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar escala no DB:", error); 
      if (error instanceof Error && 'code' in error && typeof error.code === 'string' && error.code.startsWith('P')) {
       return NextResponse.json({ error: `Erro no banco de dados: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Não foi possível criar a escala.' }, { status: 500 });
  }
}
//gdgdgd