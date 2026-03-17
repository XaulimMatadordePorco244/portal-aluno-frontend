'use server'

import  prisma  from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAlmanaque() {
  try {
    const dados = await prisma.perfilAluno.findMany({
      where: {
        usuario: {
          status: 'ATIVO'
        },
        cargo: {
          nome: {
            not: 'Comandante Geral'
          }
        }
      },
      select: {
        id: true,
        dataUltimaPromocao: true,
        modalidadeUltimaPromocao: true,
        notaDesempatePromocao: true,
        cargo: {
          select: {
            nome: true,
            tipo: true,
            precedencia: true,
            abreviacao: true
          }
        },
        usuario: {
          select: {
            nomeDeGuerra: true,
            nome: true,
            dataNascimento: true,
            cpf: true
          }
        },
        anoIngresso: true,
        numero: true
      },
      orderBy: [
        { cargo: { precedencia: 'asc' } },
        { dataUltimaPromocao: 'asc' },
        { notaDesempatePromocao: 'desc' },
        { usuario: { dataNascimento: 'asc' } }
      ]
    });

    return { success: true, data: dados };
  } catch {
    return { success: false, error: "Falha ao buscar almanaque" };
  }
}

export async function updateAntiguidadeMassa(
  updates: { 
    id: string; 
    dataUltimaPromocao: Date | string | null; 
    modalidadeUltimaPromocao: string | null;
    notaDesempatePromocao?: number;
  }[]
) {
  try {
    await prisma.$transaction(
      updates.map((item) =>
        prisma.perfilAluno.update({
          where: { id: item.id },
          data: {
            dataUltimaPromocao: item.dataUltimaPromocao ? new Date(item.dataUltimaPromocao) : null,
            modalidadeUltimaPromocao: item.modalidadeUltimaPromocao,
            notaDesempatePromocao: item.notaDesempatePromocao
          },
        })
      )
    );

    revalidatePath("/admin/antiguidade");
    return { success: true };
  } catch {
    return { success: false, error: "Falha ao atualizar antiguidade" };
  }
}