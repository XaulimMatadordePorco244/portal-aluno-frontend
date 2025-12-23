'use server'

import { PrismaClient, StatusFrequencia } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

type RegistroFrequencia = {
  alunoId: string
  status: StatusFrequencia
}

export async function salvarListaFrequencia(
  data: Date,
  tipo: string,
  registros: RegistroFrequencia[]
) {
  try {
    await prisma.$transaction(
      registros.map((reg) =>
        prisma.frequencia.upsert({
          where: {
            alunoId_data_tipo: {
              alunoId: reg.alunoId,
              data: data,
              tipo: tipo,
            },
          },
          update: { status: reg.status },
          create: {
            alunoId: reg.alunoId,
            data: data,
            tipo: tipo,
            status: reg.status,
          },
        })
      )
    )

    revalidatePath('/admin/frequencia')
    return { success: true, message: 'Frequência salva com sucesso!' }
  } catch (error) {
    console.error('Erro ao salvar frequência:', error)
    return { success: false, message: 'Erro ao salvar dados.' }
  }
}

export async function buscarFrequenciaDoDia(data: Date, tipo: string) {
  const registros = await prisma.frequencia.findMany({
    where: { data, tipo },
    select: { alunoId: true, status: true }
  })
  return registros
}