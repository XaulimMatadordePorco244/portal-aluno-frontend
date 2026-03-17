
import  prisma  from "@/lib/prisma";

export async function recalcularConceitoAluno(perfilAlunoId: string): Promise<number> {
  const perfil = await prisma.perfilAluno.findUnique({
    where: { id: perfilAlunoId },
    include: {
      historicoCargos: {
        where: { status: 'ATIVO' },
        include: {
          anotacoes: true 
        }
      }
    },
  });

  if (!perfil) {
    throw new Error("Perfil do aluno não encontrado");
  }

  const blocoAtivo = perfil.historicoCargos[0];

  const rawInicial = blocoAtivo?.conceitoInicial ?? perfil.conceitoInicial;
  const pontuacaoInicial = rawInicial ? parseFloat(String(rawInicial).replace(',', '.')) : 7;

  const anotacoesValidas = blocoAtivo?.anotacoes || [];
  const somaAnotacoes = anotacoesValidas.reduce((total, anotacao) => {
    return total + Number(anotacao.pontos || 0);
  }, 0);

  const novoConceitoAtual = pontuacaoInicial + somaAnotacoes;

  await prisma.perfilAluno.update({
    where: { id: perfilAlunoId },
    data: {
      conceitoAtual: String(novoConceitoAtual), 
    },
  });

  return novoConceitoAtual;
}