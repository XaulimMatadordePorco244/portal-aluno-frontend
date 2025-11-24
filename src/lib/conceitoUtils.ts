// Em um novo arquivo lib/conceitoUtils.ts ou nas suas actions
import prisma from '@/lib/prisma';

export async function atualizarConceitoAtual(alunoId: string) {
  try {
    // Buscar todas as anotações do aluno
    const anotacoes = await prisma.anotacao.findMany({
      where: { alunoId },
      include: {
        aluno: {
          include: {
            perfilAluno: true
          }
        }
      }
    });

    // Calcular soma dos pontos
    const somaPontos = anotacoes.reduce((total, anotacao) => {
      return total + Number(anotacao.pontos);
    }, 0);

    // Buscar conceito inicial
    const perfilAluno = await prisma.perfilAluno.findUnique({
      where: { id: alunoId }
    });

    if (!perfilAluno) {
      throw new Error('Perfil do aluno não encontrado');
    }

    
    const conceitoInicial = parseFloat(perfilAluno.conceitoInicial || '7.0');
    const conceitoAtual = Math.max(0, conceitoInicial + somaPontos).toFixed(2);

    await prisma.perfilAluno.update({
      where: { id: alunoId },
      data: { conceitoAtual }
    });

    return conceitoAtual;
  } catch (error) {
    console.error('Erro ao atualizar conceito atual:', error);
    throw error;
  }
}