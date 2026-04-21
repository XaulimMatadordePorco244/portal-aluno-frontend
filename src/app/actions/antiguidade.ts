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
    notaDesempatePromocao?: number | string; 
  }[]
) {
  try {
    await prisma.$transaction(
      updates.map((item) => {
        
        let notaFormatada = undefined;
        if (item.notaDesempatePromocao !== undefined && item.notaDesempatePromocao !== null && item.notaDesempatePromocao !== '') {
          notaFormatada = Number(item.notaDesempatePromocao);
        }

        let dataFormatada = null;
        if (item.dataUltimaPromocao) {
            const d = new Date(item.dataUltimaPromocao);
            d.setUTCHours(12, 0, 0, 0); 
            dataFormatada = d;
        }

        return prisma.perfilAluno.update({
          where: { id: item.id },
          data: {
            dataUltimaPromocao: dataFormatada,
            modalidadeUltimaPromocao: item.modalidadeUltimaPromocao,
            notaDesempatePromocao: notaFormatada 
          },
        });
      })
    );

    revalidatePath("/admin/antiguidade");
    return { success: true };
  } catch (error) {
    console.error("ERRO NO UPDATE EM MASSA:", error); 
    return { success: false, error: "Falha ao atualizar antiguidade" };
  }
}