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
    const { alunoId, novoCargoId, tipo, motivo } = body;

    if (!alunoId || !novoCargoId || !tipo) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    if (!['PROMOCAO', 'DESPROMOCAO'].includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo de transição inválido' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {

      const aluno = await tx.perfilAluno.findUnique({
        where: { id: alunoId },
        include: { cargo: true, usuario: true }
      });

      if (!aluno) {
        throw new Error('Aluno não encontrado');
      }

      const blocoAtual = await tx.cargoHistory.findFirst({
        where: {
          alunoId,
          status: 'ATIVO'
        }
      });

      if (blocoAtual) {
        await tx.cargoHistory.update({
          where: { id: blocoAtual.id },
          data: {
            status: 'FECHADO',
            dataFim: new Date(),
            conceitoAtual: aluno.conceitoAtual ? parseFloat(aluno.conceitoAtual) : 7.0
          }
        });
      }

      const novoCargo = await tx.cargo.findUnique({
        where: { id: novoCargoId }
      });

      if (!novoCargo) {
        throw new Error('Cargo não encontrado');
      }

      const novoBloco = await tx.cargoHistory.create({
        data: {
          alunoId,
          cargoId: novoCargoId,
          cargoNomeSnapshot: novoCargo.nome,
          conceitoInicial: 7.0,
          conceitoAtual: 7.0,
          status: 'ATIVO',
          dataInicio: new Date(),
          motivo
        }
      });


      await tx.perfilAluno.update({
        where: { id: alunoId },
        data: {
          cargoId: novoCargoId,
          conceitoAtual: '7.0'
        }
      });

      await tx.cargoLog.create({
        data: {
          blocoId: novoBloco.id,
          adminId: user.id,
          tipo,
          motivo,
          metadata: {
            cargoAnteriorId: aluno.cargoId,
            cargoAnteriorNome: aluno.cargo?.nome,
            cargoNovoId: novoCargo.id,
            cargoNovoNome: novoCargo.nome,
            alunoNome: aluno.usuario.nome,
            alunoNumero: aluno.numero,
            adminNome: user.nome
          }
        }
      });

      return {
        success: true,
        blocoId: novoBloco.id,
        cargoAnterior: aluno.cargo,
        cargoNovo: novoCargo,
        aluno: {
          nome: aluno.usuario.nome,
          numero: aluno.numero
        }
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro na transição de cargo:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}