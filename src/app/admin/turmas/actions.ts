"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTurma(formData: FormData) {
  const nome = formData.get("nome") as string;
  const ano = parseInt(formData.get("ano") as string);
  
  const alunosIds = formData.getAll("alunosIds") as string[];

  if (!nome || !ano) {
    return { success: false, error: "Nome e ano são obrigatórios." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const turma = await tx.turma.create({
        data: { nome, ano },
      });

      if (alunosIds.length > 0) {
        await tx.perfilAluno.updateMany({
          where: { id: { in: alunosIds } },
          data: { turmaId: turma.id },
        });
      }
    });

    revalidatePath("/admin/turmas");
    revalidatePath("/admin/alunos"); 
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar turma:", error);
    return { success: false, error: "Erro ao criar turma. Pode já existir uma com este nome e ano." };
  }
}