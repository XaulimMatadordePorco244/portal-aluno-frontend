import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRelations();
    if (!user || !canAccessAdminArea(user)) {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' }, { status: 403 });
    }

    const body = await request.json();
    const { alunoId, motivo } = body;

    if (!alunoId) {
      return NextResponse.json(
        { error: 'ID do aluno é obrigatório' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
  
      const blocoAtual = await tx.cargoHistory.findFirst({
        where: {
          alunoId,
          status: 'ATIVO'
        },
        include: { anotacoes: true }
      });

      if (!blocoAtual) {
        throw new Error('Nenhum bloco ativo encontrado para o aluno');
      }

      const blocoAnterior = await tx.cargoHistory.findFirst({
        where: {
          alunoId,
          status: 'FECHADO',
          id: { not: blocoAtual.id }
        },
        orderBy: { dataFim: 'desc' }
      });

      if (!blocoAnterior) {
        throw new Error('Nenhum bloco anterior encontrado para reversão');
      }


      if (blocoAtual.anotacoes.length > 0) {
        await tx.anotacao.updateMany({
          where: { blocoCargoId: blocoAtual.id },
          data: { blocoCargoId: blocoAnterior.id }
        });
      }


      await tx.cargoHistory.update({
        where: { id: blocoAnterior.id },
        data: {
          status: 'ATIVO',
          dataFim: null
        }
      });


      const cargoAnterior = await tx.cargo.findUnique({
        where: { id: blocoAnterior.cargoId }
      });


      await tx.perfilAluno.update({
        where: { id: alunoId },
        data: {
          cargoId: blocoAnterior.cargoId,
          conceitoAtual: blocoAnterior.conceitoAtual.toString()
        }
      });


      await tx.cargoHistory.update({
        where: { id: blocoAtual.id },
        data: {
          status: 'REVERTIDO',
          dataFim: new Date()
        }
      });


      await tx.cargoLog.create({
        data: {
          blocoId: blocoAnterior.id,
          adminId: user.id,
          tipo: 'REVERSAO',
          motivo: motivo || 'Reversão solicitada pelo administrador',
          metadata: {
            blocoRevertidoId: blocoAtual.id,
            blocoRestauradoId: blocoAnterior.id,
            cargoRevertido: blocoAtual.cargoNomeSnapshot,
            cargoRestaurado: blocoAnterior.cargoNomeSnapshot,
            anotacoesMovidas: blocoAtual.anotacoes.length,
            adminNome: user.nome,
            dataReversao: new Date().toISOString()
          }
        }
      });

      return {
        success: true,
        blocoRestaurado: {
          ...blocoAnterior,
          cargo: cargoAnterior
        },
        blocoRevertido: blocoAtual
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro ao reverter cargo:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}