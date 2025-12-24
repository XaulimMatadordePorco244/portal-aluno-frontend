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

export async function salvarListaFrequencia(
  dataOriginal: Date,
  tipo: string,
  registros: RegistroFrequencia[]
) {
  const dataEvento = normalizarData(dataOriginal)
  
  const inicioDia = new Date(dataEvento)
  inicioDia.setUTCHours(0, 0, 0, 0)
  
  const fimDia = new Date(dataEvento)
  fimDia.setUTCHours(23, 59, 59, 999)

  try {
    await prisma.$transaction(async (tx) => {
      await tx.frequencia.deleteMany({
        where: {
            tipo: tipo,
            data: {
                gte: inicioDia,
                lte: fimDia
            },
            alunoId: { in: registros.map(r => r.alunoId) }
        }
      })

      // Preparar dados para inserção em lote
      const dadosParaInserir = registros.map(reg => ({
        alunoId: reg.alunoId,
        data: dataEvento, 
        tipo: tipo,
        status: reg.status,
        observacao: reg.observacao
      }))

      // Usar createMany para inserir todos os registros de uma vez
      await tx.frequencia.createMany({
        data: dadosParaInserir
      })
    }, {
      timeout: 10000 // Aumentar timeout para 10 segundos
    })

    revalidatePath('/admin/frequencia')
    return { success: true, message: 'Frequência salva e padronizada com sucesso!' }
  } catch (error) {
    console.error('Erro ao salvar frequência:', error)
    return { success: false, message: 'Erro ao salvar dados.' }
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