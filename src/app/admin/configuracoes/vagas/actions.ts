'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function atualizarVagasAntiguidade(dados: {
  superiores: number
  intermediarios: number
  subalternos: number
  subtenentes: number
  sargentos: number
  cabos: number
  soldados: number
}) {
  try {
    await prisma.quadroVagasAntiguidade.upsert({
      where: { id: 'singleton' },
      update: dados,
      create: { id: 'singleton', ...dados }
    })

    revalidatePath('/admin/configuracoes/vagas')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Erro ao salvar as vagas.' }
  }
}