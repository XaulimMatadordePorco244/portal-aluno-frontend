import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { put } from "@vercel/blob"
import prisma from "@/lib/prisma"
import { getCurrentUserWithRelations, canAccessAdminArea } from "@/lib/auth"

const createSchema = z.object({
  titulo: z.string().min(3),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRelations()
    if (!user || !canAccessAdminArea(user)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("arquivo") as File | null
    const titulo = formData.get("titulo") as string

    
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 })
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Apenas PDF permitido" }, { status: 400 })
    }

    const validation = createSchema.safeParse({ titulo })
    if (!validation.success) {
      return NextResponse.json({ error: "Título inválido (mínimo 3 caracteres)" }, { status: 400 })
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

    const regulamento = await prisma.regulamento.create({
      data: {
        titulo,
        arquivoUrl: blob.url,
      }
    })

    return NextResponse.json({ success: true, data: regulamento })

  } catch (error) {
    console.error("Erro API Create Regulamento:", error)
    return NextResponse.json({ error: "Erro interno ao criar" }, { status: 500 })
  }
}