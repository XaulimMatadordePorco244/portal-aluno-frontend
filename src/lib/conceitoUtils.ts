import prisma  from "@/lib/prisma" 

export async function recalcularConceitoAluno(perfilAlunoId: string) {
   const perfil = await prisma.perfilAluno.findUnique({
    where: { id: perfilAlunoId },
    include: {
      anotacoesRecebidas: true, 
    },
  })

  if (!perfil) {
    throw new Error("Perfil do aluno não encontrado")
  }


  const pontuacaoInicial = Number(perfil.conceitoInicial) || 7
  

  const somaAnotacoes = perfil.anotacoesRecebidas.reduce((total, anotacao) => {
    return total + anotacao.pontos
  }, 0)

  const novoConceitoAtual = pontuacaoInicial + somaAnotacoes


  await prisma.perfilAluno.update({
    where: { id: perfilAlunoId },
    data: {
      conceitoAtual: String(novoConceitoAtual), 
    },
  })

  return novoConceitoAtual
}