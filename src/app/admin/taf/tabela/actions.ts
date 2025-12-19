'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const RegraSchema = z.object({
  id: z.string(),
  valorMinimo: z.coerce.number(),
  valorMaximo: z.coerce.number().nullable(),
  nota: z.coerce.number()
})

export async function atualizarRegra(formData: FormData) {
  const rawData = {
    id: formData.get('id'),
    valorMinimo: formData.get('valorMinimo'),
    valorMaximo: formData.get('valorMaximo') === '' ? null : formData.get('valorMaximo'),
    nota: formData.get('nota')
  }

  const result = RegraSchema.safeParse(rawData)

  if (!result.success) {
    return { success: false, message: 'Dados inválidos. Verifique os números.' }
  }

  try {
    await prisma.tafTabela.update({
      where: { id: result.data.id },
      data: {
        valorMinimo: result.data.valorMinimo,
        valorMaximo: result.data.valorMaximo,
        nota: result.data.nota
      }
    })

    revalidatePath('/admin/taf/tabela')
    return { success: true, message: 'Regra atualizada!' }
  } catch (error) {
    return { success: false, message: 'Erro ao atualizar no banco.' }
  }
}