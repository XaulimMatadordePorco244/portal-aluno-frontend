'use server'

import prisma from "@/lib/prisma"
import { del } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export async function getRegulamentos(query: string = "") {
  try {
    const where: any = {}
    if (query) {
      where.titulo = { contains: query, mode: 'insensitive' }
    }

    const data = await prisma.regulamento.findMany({
      where,
      orderBy: { createdAt: 'desc' }, 
    })

    return { data }
  } catch (error) {
    console.error("Erro ao buscar Regulamentos:", error)
    return { data: [] }
  }
}

export async function deleteRegulamento(id: string, fileUrl: string) {
  try {
    if (fileUrl) {
        await del(fileUrl)
    }
    
    await prisma.regulamento.delete({ where: { id } })

    revalidatePath("/admin/regulamentos")
    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar:", error)
    return { error: "Erro ao excluir regulamento." }
  }
}