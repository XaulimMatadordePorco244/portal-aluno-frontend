'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { calcularNotaIndividual, calcularMediaTaf } from './calcular-nota'

const TafSchema = z.object({
  alunoId: z.string(),
  anoLetivo: z.coerce.number(),
  bimestre: z.coerce.number().min(1).max(4),
  genero: z.enum(['MASCULINO', 'FEMININO']),
  
  abdominalQtd: z.coerce.number().min(0),

  apoioTipo: z.enum(['BARRA', 'FLEXAO']),
  apoioValor: z.coerce.number().min(0), 
  corridaTempo: z.coerce.number().min(0),
  
  observacoes: z.string().optional()
})

export async function salvarTaf(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  
  const result = TafSchema.safeParse(rawData)

  if (!result.success) {
    return { success: false, message: 'Dados inválidos. Verifique os campos.' }
  }

  const data = result.data

  try {
    const abdominalNota = await calcularNotaIndividual(data.genero, 'ABDOMINAL', data.abdominalQtd)
    const apoioNota = await calcularNotaIndividual(data.genero, data.apoioTipo, data.apoioValor)
    
    const corridaNota = await calcularNotaIndividual(data.genero, 'CORRIDA', data.corridaTempo)

    const mediaFinal = await calcularMediaTaf([abdominalNota, apoioNota, corridaNota])

    await prisma.tafDesempenho.upsert({
      where: {
        alunoId_anoLetivo_bimestre: {
          alunoId: data.alunoId,
          anoLetivo: data.anoLetivo,
          bimestre: data.bimestre
        }
      },
      update: {
        abdominalQtd: data.abdominalQtd,
        abdominalNota,
        apoioTipo: data.apoioTipo,
        apoioValor: data.apoioValor,
        apoioNota,
        corridaTempo: data.corridaTempo,
        corridaNota,
        mediaFinal,
        observacoes: data.observacoes
      },
      create: {
        alunoId: data.alunoId,
        anoLetivo: data.anoLetivo,
        bimestre: data.bimestre,
        abdominalQtd: data.abdominalQtd,
        abdominalNota,
        apoioTipo: data.apoioTipo,
        apoioValor: data.apoioValor,
        apoioNota,
        corridaTempo: data.corridaTempo,
        corridaNota,
        mediaFinal,
        observacoes: data.observacoes
      }
    })

    revalidatePath(`/admin/alunos/${data.alunoId}`)
    revalidatePath('/admin/taf')
    return { success: true, message: 'TAF lançado com sucesso!' }

  } catch (error) {
    console.error(error)
    return { success: false, message: 'Erro ao salvar TAF. Verifique se já existe lançamento.' }
  }
}

export async function excluirTaf(id: string) {
  try {
    const tafExcluido = await prisma.tafDesempenho.delete({
      where: { id }
    })

    revalidatePath(`/admin/alunos/${tafExcluido.alunoId}`)
    revalidatePath('/admin/taf')
    
    return { success: true, message: 'Nota excluída com sucesso!' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Erro ao excluir o TAF.' }
  }
}