'use server'

import  prisma  from "@/lib/prisma"
import { put, del } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const formSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 letras"),
  assunto: z.string().min(2, "Selecione um assunto"),
  resumo: z.string().optional(),
})

export async function createComunicacaoInterna(formData: FormData, autorId: string) {
  const file = formData.get("file") as File
  const titulo = formData.get("titulo") as string
  const assunto = formData.get("assunto") as string
  const resumo = formData.get("resumo") as string

  if (!file || file.size === 0) {
    return { error: "Nenhum arquivo enviado." }
  }
  
  if (file.type !== "application/pdf") {
    return { error: "O arquivo deve ser um PDF." }
  }

  const validatedFields = formSchema.safeParse({ titulo, assunto, resumo })
  if (!validatedFields.success) {
    return { error: "Dados inválidos. Verifique o título e assunto." }
  }

  try {
    const anoAtual = new Date().getFullYear()
    
    const ultimaCI = await prisma.comunicacaoInterna.findFirst({
      where: { anoReferencia: anoAtual },
      orderBy: { numeroSequencial: 'desc' },
      select: { numeroSequencial: true }
    })

    const proximoNumero = (ultimaCI?.numeroSequencial || 0) + 1
    const numeroFormatado = String(proximoNumero).padStart(3, '0')

    const tituloSanitizado = titulo
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toUpperCase()

    const nomeArquivoFinal = `CI${numeroFormatado}-${tituloSanitizado}.pdf`
    const caminhoPasta = `COMUNICACOES_INTERNAS/${anoAtual}/${nomeArquivoFinal}`

    const blob = await put(caminhoPasta, file, {
      access: 'public',
      addRandomSuffix: false
    })

    await prisma.comunicacaoInterna.create({
      data: {
        titulo,
        assunto,
        resumo,
        arquivoUrl: blob.url,
        nomeArquivoGerado: nomeArquivoFinal,
        anoReferencia: anoAtual,
        numeroSequencial: proximoNumero,
        autorId
      }
    })

    revalidatePath("/admin/comunicacoes")
    revalidatePath("/")

    return { success: true }

  } catch (error) {
    console.error("Erro ao criar CI:", error)
    return { error: "Erro interno ao salvar a comunicação." }
  }
}



export async function getComunicacoes(
  query: string = "", 
  dateFrom?: string, 
  dateTo?: string,
  page: number = 1
) {
  const ITEMS_PER_PAGE = 10
  const skip = (page - 1) * ITEMS_PER_PAGE

  const where: any = {}

  if (query) {
    where.OR = [
      { titulo: { contains: query, mode: 'insensitive' } },
      { assunto: { contains: query, mode: 'insensitive' } },
      // Tenta converter para número, se falhar ignora (undefined)
      { numeroSequencial: { equals: parseInt(query) || undefined } }
    ]
  }

  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = new Date(dateFrom)
    if (dateTo) where.createdAt.lte = new Date(dateTo)
  }

  try {
    const [data, total] = await Promise.all([
      prisma.comunicacaoInterna.findMany({
        where,
        orderBy: { numeroSequencial: 'desc' },
        take: ITEMS_PER_PAGE,
        skip,
        include: { autor: { select: { nome: true } } }
      }),
      prisma.comunicacaoInterna.count({ where })
    ])

    return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) }
  } catch (error) {
    console.error("Erro ao buscar CIs:", error)
    return { data: [], total: 0, totalPages: 0 }
  }
}

export async function deleteComunicacao(id: string, fileUrl: string) {
  try {
    // 1. Deletar do Blob Storage
    if (fileUrl) {
        await del(fileUrl)
    }

    // 2. Deletar do Banco
    await prisma.comunicacaoInterna.delete({ where: { id } })

    revalidatePath("/admin/comunicacoes-internas")
    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar:", error)
    return { error: "Erro ao deletar comunicação." }
  }
}