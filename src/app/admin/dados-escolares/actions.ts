'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma, SerieEscolar } from '@prisma/client'

export interface AtualizacaoEscolarData {
  userId: string;
  escolaId?: string;
  serieEscolar?: SerieEscolar; 
  turno?: string;
  turmaEscolar?: string; 
}

export async function getEscolas() {
  return await prisma.escola.findMany({ orderBy: { nome: 'asc' } })
}

export async function criarEscola(nome: string) {
  const novaEscola = await prisma.escola.create({ data: { nome } })
  revalidatePath('/admin/dados-escolares')
  return novaEscola
}

export async function getTodosAlunos(ordenacao: 'nome' | 'guerra' | 'antiguidade' = 'nome') {
  let orderByClause: Prisma.UsuarioOrderByWithRelationInput | Prisma.UsuarioOrderByWithRelationInput[] = { nome: 'asc' }

  if (ordenacao === 'guerra') {
    orderByClause = { nomeDeGuerra: 'asc' } 
  } else if (ordenacao === 'antiguidade') {
    orderByClause = [
      { perfilAluno: { cargo: { precedencia: 'asc' } } },
      { perfilAluno: { dataUltimaPromocao: 'asc' } },
      { perfilAluno: { notaDesempatePromocao: 'desc' } },
      { dataNascimento: 'asc' }
    ]
  }

  return await prisma.usuario.findMany({
    where: { perfilAluno: { isNot: null } }, 
    include: {
      perfilAluno: { include: { escola: true, cargo: true } }
    },
    orderBy: orderByClause
  })
}

export async function salvarDadosEscolaresEmLote(atualizacoes: AtualizacaoEscolarData[], anoAtual: number) {
  try {
    await prisma.$transaction(
      atualizacoes.map((update) => 
        prisma.perfilAluno.update({
          where: { usuarioId: update.userId },
          data: {
            escolaId: update.escolaId,
            serieEscolar: update.serieEscolar,
            turno: update.turno,
            turmaEscolar: update.turmaEscolar, 
            anoLetivoAtualizado: anoAtual
          }
        })
      )
    )
    revalidatePath('/admin/dados-escolares')
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Erro no salvamento em lote:', error)
    return { success: false }
  }
}