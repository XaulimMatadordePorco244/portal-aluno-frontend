'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function listarFeedbacksDoAluno(alunoId: string) {
  try {
    return await prisma.feedback.findMany({
      where: { alunoId },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    return []
  }
}

export async function excluirFeedback(id: string, alunoId: string) {
  try {
    // Só permite deletar se pertencer ao aluno E não tiver sido lida
    const feedback = await prisma.feedback.findUnique({
      where: { id }
    })

    if (!feedback || feedback.alunoId !== alunoId) {
      return { success: false, message: 'Permissão negada.' }
    }

    if (feedback.lida) {
      return { success: false, message: 'Não é possível apagar uma mensagem já lida pelo admin.' }
    }

    await prisma.feedback.delete({ where: { id } })
    
    revalidatePath('/aluno/feedback')
    revalidatePath('/admin/feedback')
    return { success: true, message: 'Mensagem apagada com sucesso.' }
  } catch (error) {
    return { success: false, message: 'Erro ao apagar mensagem.' }
  }
}

export async function editarFeedback(id: string, alunoId: string, dados: FormData) {
  const assunto = dados.get('assunto') as string
  const mensagem = dados.get('mensagem') as string
  const destinatario = dados.get('destinatario') as string

  try {
    const feedback = await prisma.feedback.findUnique({ where: { id } })

    if (!feedback || feedback.alunoId !== alunoId) return { success: false, message: 'Erro de permissão.' }
    if (feedback.lida) return { success: false, message: 'Mensagem já lida não pode ser editada.' }

    await prisma.feedback.update({
      where: { id },
      data: { assunto, mensagem, destinatario }
    })

    revalidatePath('/aluno/feedback')
    revalidatePath('/admin/feedback')
    return { success: true, message: 'Mensagem atualizada!' }
  } catch (error) {
    return { success: false, message: 'Erro ao atualizar.' }
  }
}

export async function listarAdminsParaDestinatario() {
  try {
    const admins = await prisma.usuario.findMany({
      where: {
        role: 'ADMIN',
        status: 'ATIVO'
      },
      select: {
        id: true,
        nome: true
      },
      orderBy: {
        nome: 'asc'
      }
    })
    return admins
  } catch (error) {
    console.error('Erro ao listar admins:', error)
    return []
  }
}

export async function listarFeedbacksAdmin() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        aluno: {
          select: {
            id: true,
            numero: true,
            nomeDeGuerra: true,
            usuario: {
              select: { nome: true }
            }
          }
        }
      }
    })
    return feedbacks
  } catch (error) {
    console.error('Erro ao listar feedbacks:', error)
    return []
  }
}


export async function enviarFeedback(alunoId: string, dados: FormData) {
  const assunto = dados.get('assunto') as string
  const mensagem = dados.get('mensagem') as string
  const destinatario = dados.get('destinatario') as string

  if (!alunoId || !assunto || !mensagem || !destinatario) {
    return { success: false, message: 'Preencha todos os campos.' }
  }

  try {
    await prisma.feedback.create({
      data: {
        alunoId,
        assunto,
        mensagem,
        destinatario
      }
    })

    revalidatePath('/aluno/feedback')
    revalidatePath('/admin/feedback')
    return { success: true, message: 'Mensagem enviada com sucesso!' }
  } catch (error) {
    console.error('Erro ao enviar feedback:', error)
    return { success: false, message: 'Erro ao enviar mensagem.' }
  }
}

export async function marcarComoLida(id: string) {
  try {
    await prisma.feedback.update({
      where: { id },
      data: { lida: true }
    })
    revalidatePath('/admin/feedback')
    return { success: true }
  } catch (error) {
    console.error('Erro ao marcar como lida:', error)
    return { success: false }
  }
}