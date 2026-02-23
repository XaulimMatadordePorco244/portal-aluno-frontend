'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const SessaoSchema = z.object({
  id: z.string(),
  responsaveis: z.string(),
  atribuicoes: z.string(),
})

export async function atualizarSessao(formData: FormData) {
  const data = {
    id: formData.get('id'),
    responsaveis: formData.get('responsaveis'),
    atribuicoes: formData.get('atribuicoes'),
  }

  const parsed = SessaoSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  await prisma.gmSessao.update({
    where: { id: parsed.data.id },
    data: { 
      responsaveis: parsed.data.responsaveis,
      atribuicoes: parsed.data.atribuicoes
    }
  })

  revalidatePath('/admin/sessoes-funcoes')
  revalidatePath('/sessoes-funcoes')
}

const FuncaoSchema = z.object({
  id: z.string(),
  funcao: z.string(),
})

export async function atualizarFuncao(formData: FormData) {
  const data = {
    id: formData.get('id'),
    funcao: formData.get('funcao'),
  }

  const parsed = FuncaoSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  await prisma.gmFuncao.update({
    where: { id: parsed.data.id },
    data: { funcao: parsed.data.funcao }
  })

  revalidatePath('/admin/sessoes-funcoes')
  revalidatePath('/sessoes-funcoes')
}

export async function listarAlunosParaSelect() {
  const alunos = await prisma.perfilAluno.findMany({
    where: { usuario: { status: 'ATIVO' } },
    orderBy: { nomeDeGuerra: 'asc' },
    select: {
      id: true,
      nomeDeGuerra: true,
      cargo: { select: { abreviacao: true } }
    }
  })

  return alunos.map(aluno => ({
    id: aluno.id,
    label: `${aluno.cargo?.abreviacao || 'AL'} GM ${aluno.nomeDeGuerra}`.toUpperCase(),
    value: `${aluno.cargo?.abreviacao || 'AL'} GM ${aluno.nomeDeGuerra}`.toUpperCase() 
  }))
}