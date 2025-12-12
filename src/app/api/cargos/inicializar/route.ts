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

    const aluno = await prisma.perfilAluno.findUnique({
      where: { id: alunoId },
      include: { cargo: true, usuario: true }
    });

    if (!aluno || !aluno.cargoId) {
      return NextResponse.json(
        { error: 'Aluno não encontrado ou sem cargo definido' },
        { status: 400 }
      );
    }

    const blocoExistente = await prisma.cargoHistory.findFirst({
      where: {
        alunoId,
        status: 'ATIVO'
      }
    });

    if (blocoExistente) {
      return NextResponse.json(
        { error: 'Aluno já possui bloco ativo' },
        { status: 400 }
      );
    }


    const result = await prisma.$transaction(async (tx) => {
      const bloco = await tx.cargoHistory.create({
        data: {
          alunoId,
          cargoId: aluno.cargoId || '',
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
        blocoId: bloco.id,
        aluno: {
          nome: aluno.usuario.nome,
          numero: aluno.numero
        }
      };
    }, {
      maxWait: 10000,
      timeout: 10000, 
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro ao inicializar histórico:', error);
    
    if (error.code === 'P2028') {
      return NextResponse.json(
        { error: 'Tempo limite excedido. Tente novamente com menos dados ou contate o suporte.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}