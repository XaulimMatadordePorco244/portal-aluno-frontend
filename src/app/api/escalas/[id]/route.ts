import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth'; 
import { StatusEscala } from '@prisma/client';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const escalaId = resolvedParams.id;
    
    const body = await request.json();
    const {
      titulo,
      dataEscala,
      tipo,
      elaboradoPor,
      fardamento,
      observacoes,
      itens
    } = body;

    const itensParaManter = itens
      .filter((item: any) => item.id !== undefined && item.id !== null)
      .map((item: any) => item.id);

    const escalaAtualizada = await prisma.$transaction(async (tx) => {
      
      await tx.escala.update({
        where: { id: escalaId },
        data: {
          titulo: titulo || null,
          dataEscala: new Date(dataEscala),
          tipo: tipo,
          elaboradoPor: elaboradoPor,
          fardamento: fardamento,
          observacoes: observacoes,
          status: StatusEscala.RASCUNHO,
          pdfUrl: null, 
        },
      });

      await tx.escalaItem.deleteMany({
        where: {
          escalaId: escalaId,
          id: { notIn: itensParaManter.length > 0 ? itensParaManter : ['none'] },
        },
      });

      await Promise.all(
        itens.map((item: any) => {
          if (item.id) {
            return tx.escalaItem.update({
              where: { id: item.id },
              data: {
                secao: item.secao,
                cargo: item.cargo,
                horarioInicio: item.horarioInicio,
                horarioFim: item.horarioFim,
                alunoId: item.alunoId,
                observacao: item.observacao,
              },
            });
          } else {
            return tx.escalaItem.create({
              data: {
                secao: item.secao,
                cargo: item.cargo,
                horarioInicio: item.horarioInicio,
                horarioFim: item.horarioFim,
                alunoId: item.alunoId,
                observacao: item.observacao,
                escalaId: escalaId,
              },
            });
          }
        })
      );

      return await tx.escala.findUnique({
        where: { id: escalaId },
        include: {
          itens: {
            include: {
              aluno: {
                include: {
                  perfilAluno: { include: { funcao: true, cargo: true } },
                  funcaoAdmin: true
                }
              }
            },
            orderBy: { secao: 'asc' }
          },
          criadoPor: true
        }
      });
    }, 
    { 
      maxWait: 5000, 
      timeout: 15000 
    });

    return NextResponse.json(escalaAtualizada, { status: 200 });

  } catch (error) {
    console.error('[ESCALA_PUT_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao salvar alterações da escala. Verifique os dados enviados.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const escalaId = resolvedParams.id;

    await prisma.escala.delete({
      where: { id: escalaId }
    });

    return NextResponse.json({ message: "Escala excluída com sucesso" }, { status: 200 });
  } catch (error) {
    console.error('[ESCALA_DELETE_ERROR]', error);
    return NextResponse.json({ error: 'Erro ao excluir a escala' }, { status: 500 });
  }
}