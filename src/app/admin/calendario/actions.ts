'use server'

import prisma from '@/lib/prisma'
import { TipoEvento } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const EventoSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  data: z.date(),
  dataFim: z.date().optional(), 
  tipo: z.nativeEnum(TipoEvento),
  descricao: z.string().optional()
})

export async function criarEvento(formData: FormData) {
  const dataRaw = formData.get('data') as string
  const dataFimRaw = formData.get('dataFim') as string | null
  const tipo = formData.get('tipo') as TipoEvento
  
  const dataEvento = new Date(dataRaw + 'T12:00:00Z')
  let dataFimEvento = undefined

  if (dataFimRaw) {
    dataFimEvento = new Date(dataFimRaw + 'T12:00:00Z')
  }

  const dados = {
    titulo: formData.get('titulo') as string,
    descricao: formData.get('descricao') as string,
    tipo,
    data: dataEvento,
    dataFim: dataFimEvento
  }

  try {
    const validado = EventoSchema.parse(dados)
    
    await prisma.gmEventoCalendario.create({
      data: validado
    })

    revalidatePath('/admin/calendario')
    revalidatePath('/frequencia') 
  } catch (e) {
    console.error('Erro ao criar evento:', e)
  }
}

export async function deletarEvento(id: string) {
  await prisma.gmEventoCalendario.delete({ where: { id } })
  revalidatePath('/admin/calendario')
  revalidatePath('/aluno/frequencia')
}