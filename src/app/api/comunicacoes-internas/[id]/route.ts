import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { put, del } from "@vercel/blob"
import prisma from "@/lib/prisma"
import { getCurrentUserWithRelations, canAccessAdminArea } from "@/lib/auth" 

const updateSchema = z.object({
  titulo: z.string().min(3),
  assunto: z.string().min(2),
  resumo: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const user = await getCurrentUserWithRelations()
    if (!user || !canAccessAdminArea(user)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const formData = await request.formData()
    
    const rawData = {
      titulo: formData.get("titulo") as string,
      assunto: formData.get("assunto") as string,
      resumo: formData.get("resumo") as string,
    }
    const file = formData.get("file") as File | null

    const validation = updateSchema.safeParse(rawData)
    if (!validation.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const ciAtual = await prisma.comunicacaoInterna.findUnique({ where: { id } })
    if (!ciAtual) {
      return NextResponse.json({ error: "CI não encontrada" }, { status: 404 })
    }

    let novoArquivoUrl = ciAtual.arquivoUrl
    let nomeArquivoFinal = ciAtual.nomeArquivoGerado

    if (file && file.size > 0) {
      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Apenas arquivos PDF são permitidos" }, { status: 400 })
      }

      if (ciAtual.arquivoUrl) {
        await del(ciAtual.arquivoUrl)
      }

      const numeroFormatado = String(ciAtual.numeroSequencial).padStart(3, '0')
      const tituloSanitizado = rawData.titulo
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toUpperCase()
      
      nomeArquivoFinal = `CI${numeroFormatado}-${tituloSanitizado}.pdf`
      const caminhoPasta = `COMUNICACOES_INTERNAS/${ciAtual.anoReferencia}/${nomeArquivoFinal}`

      const blob = await put(caminhoPasta, file, { 
        access: 'public', 
        addRandomSuffix: false 
      })
      novoArquivoUrl = blob.url
    }

    const ciAtualizada = await prisma.comunicacaoInterna.update({
      where: { id },
      data: {
        titulo: rawData.titulo,
        assunto: rawData.assunto,
        resumo: rawData.resumo,
        arquivoUrl: novoArquivoUrl,
        nomeArquivoGerado: nomeArquivoFinal
      }
    })

    return NextResponse.json({ success: true, data: ciAtualizada })

  } catch (error) {
    console.error("Erro na API de Update:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}