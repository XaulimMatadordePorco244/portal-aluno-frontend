'use server'

import prisma from '@/lib/prisma'
import { StatusFrequencia } from '@prisma/client'
import { revalidatePath } from 'next/cache'

type RegistroFrequencia = {
  alunoId: string
  status: StatusFrequencia
  observacao?: string | null
}

function normalizarData(date: Date): Date {
  const isoString = date.toISOString() 
  const [anoMesDia] = isoString.split('T') 
  return new Date(`${anoMesDia}T12:00:00.000Z`)
}

export async function salvarListaFrequencia(dataStr: Date | string, tipo: string, registros: RegistroFrequencia[]) {
  try {
    const data = new Date(dataStr)

    const startOfDay = new Date(data.getFullYear(), data.getMonth(), data.getDate(), 0, 0, 0)
    const endOfDay = new Date(data.getFullYear(), data.getMonth(), data.getDate(), 23, 59, 59)

    await prisma.$transaction(async (tx) => {
      await tx.frequencia.deleteMany({
        where: {
          tipo: tipo,
          data: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })

      if (registros.length > 0) {
        await tx.frequencia.createMany({
          data: registros.map(r => ({
            alunoId: r.alunoId,
            data: startOfDay, 
            tipo: tipo,
            status: r.status,
            observacao: r.observacao || null
          }))
        })
      }
    })

    revalidatePath('/admin/frequencia')
    return { success: true, message: 'Chamada guardada com sucesso!' }
  } catch (error) {
    console.error("Erro ao salvar frequência:", error)
    return { success: false, message: 'Erro ao guardar a chamada.' }
  }
}

export async function buscarFrequenciaDoDia(dataOriginal: Date, tipo: string) {
  const dataEvento = normalizarData(dataOriginal)
  
  const inicioDia = new Date(dataEvento)
  inicioDia.setUTCHours(0, 0, 0, 0)
  
  const fimDia = new Date(dataEvento)
  fimDia.setUTCHours(23, 59, 59, 999)

  const registros = await prisma.frequencia.findMany({
    where: {
      tipo,
      data: {
        gte: inicioDia,
        lte: fimDia
      }
    },
    select: { alunoId: true, status: true, observacao: true }
  })
  
  return registros
}