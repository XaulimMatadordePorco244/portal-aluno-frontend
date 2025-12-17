'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const BoletimSchema = z.object({
  alunoId: z.string(),
  anoLetivo: z.coerce.number(),
  escola: z.string().optional(),
  serie: z.string().optional(),
  
  mediaB1: z.coerce.number().min(0).max(10).nullable().optional(),
  faltasB1: z.coerce.number().default(0),
  
  mediaB2: z.coerce.number().min(0).max(10).nullable().optional(),
  faltasB2: z.coerce.number().default(0),
  
  mediaB3: z.coerce.number().min(0).max(10).nullable().optional(),
  faltasB3: z.coerce.number().default(0),
  
  mediaB4: z.coerce.number().min(0).max(10).nullable().optional(),
  faltasB4: z.coerce.number().default(0),
  
  qtdNotasVermelhas: z.coerce.number().default(0),
  observacoes: z.string().optional(),
})

export async function salvarBoletim(formData: FormData) {

  const rawData: any = Object.fromEntries(formData.entries())
  
  const camposDeNota = ['mediaB1', 'mediaB2', 'mediaB3', 'mediaB4']
  
  camposDeNota.forEach(campo => {
    if (rawData[campo] === '') {
      rawData[campo] = null
    }
  })

  const result = BoletimSchema.safeParse(rawData)

  if (!result.success) {
    console.error(result.error) 
    return { success: false, message: 'Dados inválidos. Verifique as notas (0-10).' }
  }

  const data = result.data

  
  const totalFaltas = data.faltasB1 + data.faltasB2 + data.faltasB3 + data.faltasB4

  let mediaFinal: number | null = null
  let situacao = "CURSANDO"

  const notas = [data.mediaB1, data.mediaB2, data.mediaB3, data.mediaB4]
  
  const boletimCompleto = notas.every(n => n !== null && n !== undefined)

  if (boletimCompleto) {
    const soma = (data.mediaB1 || 0) + (data.mediaB2 || 0) + (data.mediaB3 || 0) + (data.mediaB4 || 0)
    
    mediaFinal = parseFloat((soma / 4).toFixed(1))

    if (mediaFinal >= 6.0) {
      situacao = "APROVADO"
    } else {
      situacao = "REPROVADO" 
    }
  }

  try {
    await prisma.desempenhoEscolar.upsert({
      where: {
        alunoId_anoLetivo: {
          alunoId: data.alunoId,
          anoLetivo: data.anoLetivo
        }
      },
      update: {
        escola: data.escola,
        serie: data.serie,
        mediaB1: data.mediaB1, faltasB1: data.faltasB1,
        mediaB2: data.mediaB2, faltasB2: data.faltasB2,
        mediaB3: data.mediaB3, faltasB3: data.faltasB3,
        mediaB4: data.mediaB4, faltasB4: data.faltasB4,
        qtdNotasVermelhas: data.qtdNotasVermelhas,
        observacoes: data.observacoes,
        mediaFinal,
        totalFaltas,
        situacao
      },
      create: {
        alunoId: data.alunoId,
        anoLetivo: data.anoLetivo,
        escola: data.escola,
        serie: data.serie,
        mediaB1: data.mediaB1, faltasB1: data.faltasB1,
        mediaB2: data.mediaB2, faltasB2: data.faltasB2,
        mediaB3: data.mediaB3, faltasB3: data.faltasB3,
        mediaB4: data.mediaB4, faltasB4: data.faltasB4,
        qtdNotasVermelhas: data.qtdNotasVermelhas,
        observacoes: data.observacoes,
        mediaFinal,
        totalFaltas,
        situacao
      }
    })


    if (data.escola || data.serie) {
      await prisma.perfilAluno.update({
        where: { id: data.alunoId },
        data: { 
            escola: data.escola,
            serieEscolar: data.serie
        }
      })
    }

    revalidatePath(`/admin/alunos/${data.alunoId}`)
    revalidatePath(`/admin/nota-escolar`) 

    return { success: true, message: 'Boletim escolar atualizado com sucesso!' }
    
  } catch (error) {
    console.error("Erro ao salvar boletim:", error)
    return { success: false, message: 'Erro interno ao salvar no banco de dados.' }
  }
}