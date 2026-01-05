import { NextRequest, NextResponse } from "next/server"
import { put, del } from "@vercel/blob"
import prisma from "@/lib/prisma"
import { getCurrentUserWithRelations, canAccessAdminArea } from "@/lib/auth"

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
    const titulo = formData.get("titulo") as string
    const file = formData.get("arquivo") as File | null

    if (!titulo || titulo.length < 3) {
      return NextResponse.json({ error: "Título inválido" }, { status: 400 })
    }

    const regAtual = await prisma.regulamento.findUnique({ where: { id } })
    if (!regAtual) {
      return NextResponse.json({ error: "Regulamento não encontrado" }, { status: 404 })
    }

    let novoArquivoUrl = regAtual.arquivoUrl

    if (file && file.size > 0) {
      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Apenas PDF permitido" }, { status: 400 })
      }

      if (regAtual.arquivoUrl) {
        await del(regAtual.arquivoUrl)
      }

      const filenameSanitized = file.name
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9.-]/g, "_")

      const caminhoBlob = `REGULAMENTOS/${filenameSanitized}`

      const blob = await put(caminhoBlob, file, {
        access: 'public',
        contentType: 'application/pdf',
        addRandomSuffix: true
      })
      novoArquivoUrl = blob.url
    }

    await prisma.regulamento.update({
      where: { id },
      data: {
        titulo,
        arquivoUrl: novoArquivoUrl
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Erro API Update Regulamento:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}