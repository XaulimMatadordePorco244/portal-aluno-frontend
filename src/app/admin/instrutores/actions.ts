'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function salvarInstrutor(formData: FormData) {
  const id = formData.get('id') as string | null
  const nome = formData.get('nome') as string

  if (!nome || nome.trim() === '') {
    return { error: 'O nome é obrigatório' }
  }

  if (id) {
    await prisma.instrutor.update({
      where: { id },
      data: { nome }
    })
  } else {
    await prisma.instrutor.create({
      data: { nome, ativo: true }
    })
  }

  revalidatePath('/admin/instrutores')
  revalidatePath('/admin/frequencia') 
  redirect('/admin/instrutores')
}

export async function alternarStatusInstrutor(id: string, statusAtual: boolean) {
  await prisma.instrutor.update({
    where: { id },
    data: { ativo: !statusAtual }
  })

  revalidatePath('/admin/instrutores')
  revalidatePath('/admin/frequencia')
}