// src/app/(admin)/admin/anotacoes/actions.ts
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getFullCurrentUser } from "@/lib/auth";
import { redirect } from 'next/navigation';

const AnotacaoSchema = z.object({
  alunoIds: z.array(z.string()).min(1, "É obrigatório selecionar pelo menos um aluno."),
  tipoId: z.string().min(1, "É obrigatório selecionar o tipo de anotação."),
  data: z.string().min(1, "A data é obrigatória.").pipe(z.coerce.date()),
  pontos: z.string().min(1, "Os pontos são obrigatórios.").pipe(z.coerce.number()),
  // Tornamos o campo de detalhes obrigatório
  detalhes: z.string().min(1, "A descrição do ocorrido é obrigatória."),
});

export async function createAnotacao(prevState: any, formData: FormData) {
  const user = await getFullCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return { message: "Acesso negado." };
  }

  const alunoIds = formData.getAll("alunoIds") as string[];
  
  const validatedFields = AnotacaoSchema.safeParse({
    alunoIds,
    tipoId: formData.get("tipoId"),
    data: formData.get("data"),
    pontos: formData.get("pontos"),
    detalhes: formData.get("detalhes"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  
  const { tipoId, data, pontos, detalhes } = validatedFields.data;

  try {
    const anotacoesParaCriar = alunoIds.map(alunoId => ({
      alunoId,
      tipoId,
      data: data,
      pontos,
      detalhes: detalhes, // Não precisa mais verificar se é nulo
      autorId: user.id,
    }));

    await prisma.$transaction(
      anotacoesParaCriar.map(anotacaoData => 
        prisma.anotacao.create({ data: anotacaoData })
      )
    );

  } catch (error) {
    console.error("Erro ao criar anotação:", error);
    return { message: "Ocorreu um erro ao criar a anotação." };
  }

  revalidatePath("/admin/anotacoes");
  revalidatePath("/admin/alunos");
  redirect("/admin/alunos");
}