'use server'

import prisma from '@/lib/prisma'
import { StatusFrequencia } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function obterMapaFrequencia(mes: number, ano: number, tipo: string = 'GERAL') {
  const startDate = new Date(ano, mes - 1, 1)
  const endDate = new Date(ano, mes, 0) 

  const alunos = await prisma.perfilAluno.findMany({
    where: {
      usuario: {
        status: 'ATIVO'
      }
    },
    orderBy: [
      { cargo: { precedencia: 'asc' } },
      { dataUltimaPromocao: 'asc' },
      { numero: 'asc' }
    ],
    select: {
      id: true,
      usuario: {
        select: {
          nomeDeGuerra: true
        }
      },
      cargo: {
        select: {
          abreviacao: true
        }
      }
    }
  })

  const instrutorId = tipo === 'GERAL' ? null : tipo

  const frequencias = await prisma.frequencia.findMany({
    where: {
      data: { gte: startDate, lte: endDate },
      instrutorId: instrutorId 
    }
  })

  const datasSet = new Set(frequencias.map(f => f.data.toISOString().split('T')[0]))
  const datasOrdenadas = Array.from(datasSet).sort()

  const alunosFormatados = alunos.map(aluno => ({
    id: aluno.id,
    graduacao: aluno.cargo?.abreviacao || 'AL', 
    nomeDeGuerra: aluno.usuario.nomeDeGuerra || 'N/D'
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

  const instrutorId = tipo === 'GERAL' ? null : tipo

  const frequenciaExistente = await prisma.frequencia.findFirst({
    where: { alunoId, data, instrutorId }
  })

  if (frequenciaExistente) {
    await prisma.frequencia.update({
      where: { id: frequenciaExistente.id },
      data: { status: novoStatus }
    })
  } else {
    await prisma.frequencia.create({
      data: { 
        alunoId, 
        data, 
        instrutorId, 
        status: novoStatus 
      }
    })
  }

  revalidatePath('/admin/frequencia/')
  return { success: true, novoStatus }
}