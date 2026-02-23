import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { put } from "@vercel/blob"
import prisma from "@/lib/prisma"
import { getCurrentUserWithRelations, canAccessAdminArea } from "@/lib/auth"

const createSchema = z.object({
  titulo: z.string().min(3),
  assunto: z.string().min(2),
  resumo: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRelations()
    
    if (!user || !canAccessAdminArea(user)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    
    const rawData = {
      titulo: formData.get("titulo") as string,
      assunto: formData.get("assunto") as string,
      resumo: formData.get("resumo") as string,
    }

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 })
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Apenas PDF permitido" }, { status: 400 })
    }

    const validation = createSchema.safeParse(rawData)
    if (!validation.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const anoAtual = new Date().getFullYear()
    
    const ultimaCI = await prisma.comunicacaoInterna.findFirst({
      where: { anoReferencia: anoAtual },
      orderBy: { numeroSequencial: 'desc' },
      select: { numeroSequencial: true }
    })

    const proximoNumero = (ultimaCI?.numeroSequencial || 0) + 1
    const numeroFormatado = String(proximoNumero).padStart(3, '0')

    const tituloSanitizado = rawData.titulo
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toUpperCase()

    const nomeArquivoFinal = `CI${numeroFormatado}-${tituloSanitizado}.pdf`
    const caminhoPasta = `COMUNICACOES_INTERNAS/${anoAtual}/${nomeArquivoFinal}`

    const blob = await put(caminhoPasta, file, {
      access: 'public',
      addRandomSuffix: false
    })

    const novaCI = await prisma.comunicacaoInterna.create({
      data: {
        titulo: rawData.titulo,
        assunto: rawData.assunto,
        resumo: rawData.resumo,
        arquivoUrl: blob.url,
        nomeArquivoGerado: nomeArquivoFinal,
        anoReferencia: anoAtual,
        numeroSequencial: proximoNumero,
        autorId: user.id 
      }
    })

    return NextResponse.json({ success: true, data: novaCI })

  } catch (error) {
    console.error("Erro API Create CI:", error)
    return NextResponse.json({ error: "Erro interno ao criar CI" }, { status: 500 })
  }
}