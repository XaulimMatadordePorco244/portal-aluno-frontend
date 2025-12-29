'use server'

import prisma from '@/lib/prisma'
import { StatusFrequencia } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function obterMapaFrequencia(mes: number, ano: number, tipo: string = 'GERAL') {
  const startDate = new Date(ano, mes - 1, 1)
  const endDate = new Date(ano, mes, 0) 

  const alunos = await prisma.perfilAluno.findMany({
    where: { usuario: { status: 'ATIVO' } },
    orderBy: { nomeDeGuerra: 'asc' },
    select: { 
      id: true, 
      nomeDeGuerra: true, 
      cargo: { 
        select: { 
          abreviacao: true 
        } 
      } 
    }
  })

  const frequencias = await prisma.frequencia.findMany({
    where: {
      data: { gte: startDate, lte: endDate },
      tipo: tipo
    }
  })

  const datasSet = new Set(frequencias.map(f => f.data.toISOString().split('T')[0]))
  const datasOrdenadas = Array.from(datasSet).sort()

  const alunosFormatados = alunos.map(aluno => ({
    id: aluno.id,
    graduacao: aluno.cargo?.abreviacao || '', 
    nomeDeGuerra: aluno.nomeDeGuerra || ''
  }))

  return { 
    alunos: alunosFormatados,
    frequencias, 
    datas: datasOrdenadas 
  }
}

export async function alternarFrequencia(alunoId: string, dataString: string, tipo: string, statusAtual: StatusFrequencia | null) {
  const data = new Date(dataString)
  
  let novoStatus: StatusFrequencia = StatusFrequencia.PRESENTE
  
  if (statusAtual === StatusFrequencia.PRESENTE) novoStatus = StatusFrequencia.FALTA
  else if (statusAtual === StatusFrequencia.FALTA) novoStatus = StatusFrequencia.JUSTIFICADA
  else if (statusAtual === StatusFrequencia.JUSTIFICADA) novoStatus = StatusFrequencia.PRESENTE 

  await prisma.frequencia.upsert({
    where: {
      alunoId_data_tipo: { alunoId, data, tipo }
    },
    update: { status: novoStatus },
    create: { alunoId, data, tipo, status: novoStatus }
  })

  revalidatePath('/admin/frequencia')
  return { success: true, novoStatus }
}