'use server'

import prisma  from "@/lib/prisma"
import { put, del } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getCurrentUserWithRelations, canAccessAdminArea } from "@/lib/auth"

const formSchema = z.object({
  titulo: z.string().min(3, "Título muito curto"),
  descricao: z.string().optional(),
})
export async function updateInformativo(id: string, formData: FormData) {
  const user = await getCurrentUserWithRelations()
  if (!user || !canAccessAdminArea(user)) return { error: "Não autorizado" }

  const titulo = formData.get("titulo") as string
  const descricao = formData.get("descricao") as string
  const file = formData.get("file") as File | null

  const validation = formSchema.safeParse({ titulo, descricao })
  if (!validation.success) return { error: "Dados inválidos" }

  try {
    const currentInformativo = await prisma.informativo.findUnique({ where: { id } })
    if (!currentInformativo) return { error: "Informativo não encontrado" }

    let arquivoUrl = currentInformativo.arquivoUrl
    let nomeArquivo = currentInformativo.nomeArquivo


    if (file && file.size > 0) {
          if (currentInformativo.arquivoUrl) {
        await del(currentInformativo.arquivoUrl)
      }
      

      const anoAtual = new Date().getFullYear()
      const path = `INFORMATIVOS/${anoAtual}/${file.name}`
      const blob = await put(path, file, { access: 'public', addRandomSuffix: true })
      
      arquivoUrl = blob.url
      nomeArquivo = file.name
    }

    await prisma.informativo.update({
      where: { id },
      data: {
        titulo,
        descricao,
        arquivoUrl,
        nomeArquivo
      }
    })

    revalidatePath("/admin/informativos")
    revalidatePath("/informativos")
    revalidatePath("/")
    
    return { success: true }

  } catch (error) {
    console.error(error)
    return { error: "Erro ao atualizar." }
  }
}

export async function createInformativo(formData: FormData) {
  const user = await getCurrentUserWithRelations()
  if (!user || !canAccessAdminArea(user)) {
    return { error: "Não autorizado" }
  }

  const titulo = formData.get("titulo") as string
  const descricao = formData.get("descricao") as string
  const file = formData.get("file") as File | null


  const validation = formSchema.safeParse({ titulo, descricao })
  if (!validation.success) return { error: "Dados inválidos" }

  let arquivoUrl = null
  let nomeArquivo = null

  try {
    if (file && file.size > 0) {
         const anoAtual = new Date().getFullYear()
      const path = `INFORMATIVOS/${anoAtual}/${file.name}`
      
      const blob = await put(path, file, {
        access: 'public',
        addRandomSuffix: true 
      })
      
      arquivoUrl = blob.url
      nomeArquivo = file.name
    }

    await prisma.informativo.create({
      data: {
        titulo,
        descricao,
        arquivoUrl,
        nomeArquivo,
        autorId: user.id
      }
    })

    revalidatePath("/") 
    revalidatePath("/informativos")
    revalidatePath("/admin/informativos") 

    return { success: true }

  } catch (error) {
    console.error("Erro criar informativo:", error)
    return { error: "Erro interno ao salvar." }
  }
}

export async function deleteInformativo(id: string) {
  const user = await getCurrentUserWithRelations()
  if (!user || !canAccessAdminArea(user)) return { error: "Não autorizado" }

  try {
    const item = await prisma.informativo.findUnique({ where: { id } })
    if (!item) return { error: "Informativo não encontrado" }

    if (item.arquivoUrl) {
       await del(item.arquivoUrl)
    }

    await prisma.informativo.delete({ where: { id } })

    revalidatePath("/")
    revalidatePath("/informativos")
    
    return { success: true }
  } catch (error) {
    return { error: "Erro ao excluir" }
  }
}