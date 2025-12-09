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
    const { alunoId } = body;

    if (!alunoId) {
      return NextResponse.json(
        { error: 'ID do aluno é obrigatório' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const aluno = await tx.perfilAluno.findUnique({
        where: { id: alunoId },
        include: { cargo: true, usuario: true }
      });

      if (!aluno || !aluno.cargoId) {
        throw new Error('Aluno não encontrado ou sem cargo definido');
      }

  
      const blocoExistente = await tx.cargoHistory.findFirst({
        where: {
          alunoId,
          status: 'ATIVO'
        }
      });

      if (blocoExistente) {
        throw new Error('Aluno já possui bloco ativo');
      }

      const bloco = await tx.cargoHistory.create({
        data: {
          alunoId,
          cargoId: aluno.cargoId,
          cargoNomeSnapshot: aluno.cargo?.nome || 'Cargo Inicial',
          conceitoInicial: aluno.conceitoInicial ? parseFloat(aluno.conceitoInicial) : 7.0,
          conceitoAtual: aluno.conceitoAtual ? parseFloat(aluno.conceitoAtual) : 7.0,
          status: 'ATIVO',
          dataInicio: new Date(),
          motivo: 'Inicialização do sistema de histórico'
        }
      });


      await tx.cargoLog.create({
        data: {
          blocoId: bloco.id,
          adminId: user.id,
          tipo: 'PROMOCAO',
          motivo: 'Inicialização do sistema de histórico de cargos',
          metadata: {
            sistemaInicializado: true,
            alunoNome: aluno.usuario.nome,
            alunoNumero: aluno.numero,
            cargoInicial: aluno.cargo?.nome,
            adminNome: user.nome,
            dataInicializacao: new Date().toISOString()
          }
        }
      });

      return { 
        success: true, 
        bloco,
        aluno: {
          nome: aluno.usuario.nome,
          numero: aluno.numero
        }
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro ao inicializar histórico:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}