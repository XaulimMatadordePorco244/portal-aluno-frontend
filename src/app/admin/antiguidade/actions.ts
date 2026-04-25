'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function salvarComandantes(comandanteId: string | null, subComandanteId: string | null) {
  try {
    const funcCmd = await prisma.funcao.findFirst({ where: { nome: "COMANDANTE GERAL" } })
    const funcSub = await prisma.funcao.findFirst({ where: { nome: "SUB COMANDANTE GERAL" } })

    if (!funcCmd || !funcSub) {
      return { success: false, message: "As funções 'COMANDANTE GERAL' e 'SUB COMANDANTE GERAL' não existem no banco de dados." }
    }

    await prisma.perfilAluno.updateMany({
      where: { funcaoId: { in: [funcCmd.id, funcSub.id] } },
      data: { funcaoId: null }
    })

    if (comandanteId && comandanteId !== "none") {
      await prisma.perfilAluno.update({
        where: { id: comandanteId },
        data: { funcaoId: funcCmd.id }
      })
    }

    if (subComandanteId && subComandanteId !== "none") {
      await prisma.perfilAluno.update({
        where: { id: subComandanteId },
        data: { funcaoId: funcSub.id }
      })
    }

    revalidatePath('/admin/antiguidade')
    return { success: true, message: "Comandos atualizados com sucesso!" }
  } catch (error) {
    console.error("Erro ao salvar comandantes:", error)
    return { success: false, message: "Ocorreu um erro interno ao salvar." }
  }
}