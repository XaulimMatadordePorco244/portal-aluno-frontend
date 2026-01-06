'use server'

import prisma from "@/lib/prisma"
import { put, del } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { z } from "zod"

interface AutorMinimo {
  id: string  
  nome: string
}

interface ComunicacaoInternaComAutor {
  id: string
  titulo: string
  assunto: string
  resumo?: string | null
  arquivoUrl: string
  nomeArquivoGerado: string
  anoReferencia: number
  numeroSequencial: number
  createdAt: Date
  autor?: AutorMinimo  
  autorId: string
}

interface GetComunicacoesResponse {
  data: ComunicacaoInternaComAutor[]
  total: number
  totalPages: number
}

interface CreateSuccessResponse {
  success: true
}

interface CreateErrorResponse {
  error: string
}

type CreateResponse = CreateSuccessResponse | CreateErrorResponse

interface DeleteSuccessResponse {
  success: true
}

interface DeleteErrorResponse {
  error: string
}

type DeleteResponse = DeleteSuccessResponse | DeleteErrorResponse

const formSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 letras"),
  assunto: z.string().min(2, "Selecione um assunto"),
  resumo: z.string().optional(),
})

export async function createComunicacaoInterna(
  formData: FormData, 
  autorId: string
): Promise<CreateResponse> {
  const file = formData.get("file")
  const titulo = formData.get("titulo")
  const assunto = formData.get("assunto")
  const resumo = formData.get("resumo")

  if (!(file instanceof File)) {
    return { error: "Nenhum arquivo enviado." }
  }

  if (file.size === 0) {
    return { error: "O arquivo está vazio." }
  }
  
  if (file.type !== "application/pdf") {
    return { error: "O arquivo deve ser um PDF." }
  }

  if (typeof titulo !== 'string' || typeof assunto !== 'string') {
    return { error: "Título e assunto são obrigatórios." }
  }

  const validatedFields = formSchema.safeParse({ 
    titulo, 
    assunto, 
    resumo: typeof resumo === 'string' ? resumo : undefined 
  })

  if (!validatedFields.success) {
  const errorMessages = validatedFields.error.issues
    .map(issue => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ')
  return { error: `Dados inválidos: ${errorMessages}` }
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
        resumo: validatedFields.data.resumo || null,
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

  } catch (error: unknown) {
    console.error("Erro ao criar CI:", error)
    
    let errorMessage = "Erro interno ao salvar a comunicação."
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return { error: errorMessage }
  }
}

export async function getComunicacoes(
  query: string = "", 
  dateFrom?: string, 
  dateTo?: string,
  page: number = 1
): Promise<GetComunicacoesResponse> {
  const ITEMS_PER_PAGE = 10
  const skip = (page - 1) * ITEMS_PER_PAGE

  type WhereCondition = {
    OR?: Array<
      { titulo: { contains: string; mode: 'insensitive' } } |
      { assunto: { contains: string; mode: 'insensitive' } } |
      { numeroSequencial: { equals: number | undefined } }
    >
    createdAt?: {
      gte?: Date
      lte?: Date
    }
  }

  const where: WhereCondition = {}

  if (query) {
    const parsedNumber = parseInt(query)
    where.OR = [
      { titulo: { contains: query, mode: 'insensitive' } },
      { assunto: { contains: query, mode: 'insensitive' } },
      { numeroSequencial: { equals: isNaN(parsedNumber) ? undefined : parsedNumber } }
    ]
  }

  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom)
    }
    if (dateTo) {
      where.createdAt.lte = new Date(dateTo)
    }
  }

  try {
    const [data, total] = await Promise.all([
      prisma.comunicacaoInterna.findMany({
        where,
        orderBy: { numeroSequencial: 'desc' },
        take: ITEMS_PER_PAGE,
        skip,
        include: { autor: { select: {id: true, nome: true } } }
      }),
      prisma.comunicacaoInterna.count({ where })
    ])

    return { 
      data: data as ComunicacaoInternaComAutor[], 
      total, 
      totalPages: Math.ceil(total / ITEMS_PER_PAGE) 
    }
  } catch (error: unknown) {
    console.error("Erro ao buscar CIs:", error)
    return { data: [], total: 0, totalPages: 0 }
  }
}

export async function deleteComunicacao(
  id: string, 
  fileUrl: string
): Promise<DeleteResponse> {
  try {
    if (fileUrl) {
        await del(fileUrl)
    }

    await prisma.comunicacaoInterna.delete({ where: { id } })

    revalidatePath("/admin/comunicacoes-internas")
    return { success: true }
  } catch (error: unknown) {
    console.error("Erro ao deletar comunicação:", error)
    
    let errorMessage = "Erro ao deletar comunicação."
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return { error: errorMessage }
  }
}