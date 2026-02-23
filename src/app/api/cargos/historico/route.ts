import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import { getCurrentUserWithRelations } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRelations();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const alunoId = searchParams.get('alunoId');

    if (!alunoId) {
      return NextResponse.json({ error: 'ID do aluno é obrigatório' }, { status: 400 });
    }

    const isAdmin = user.role === 'ADMIN';
    const isOwnProfile = user.perfilAluno?.id === alunoId;

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const historico = await prisma.cargoHistory.findMany({
      where: { alunoId },
      include: {
        cargo: true,
        anotacoes: {
          include: {
            tipo: true,
            autor: {
              select: {
                id: true,
                nome: true,
                role: true
              }
            }
          },
          orderBy: { data: 'desc' }
        },
        logs: isAdmin ? {
          include: {
            admin: {
              select: {
                id: true,
                nome: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        } : false
      },
      orderBy: { dataInicio: 'desc' }
    });

    return NextResponse.json(historico);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}