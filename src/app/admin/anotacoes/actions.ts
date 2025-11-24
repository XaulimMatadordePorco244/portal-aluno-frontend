"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserWithRelations } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { recalcularConceitoAluno } from "@/lib/conceitoUtils";


export interface FormState {
  errors?: {
    alunoIds?: string[];
    tipoId?: string[];
    data?: string[];
    pontos?: string[];
    detalhes?: string[];
    _form?: string[];
  };
  message?: string;
}


const AnotacaoSchema = z.object({
  alunoIds: z.array(z.string().cuid()).min(1, "Selecione pelo menos um aluno."),
  tipoId: z.string().min(1, "Selecione o tipo de anotação."),
  data: z.string().min(1, "Data é obrigatória.").pipe(z.coerce.date()),
  pontos: z.string().min(1, "Pontos são obrigatórios.").pipe(z.coerce.number()),
  detalhes: z.string().trim().min(3, "A descrição deve ter no mínimo 3 caracteres."),
});



export async function createAnotacao(prevState: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUserWithRelations();
  const allowedRoles = ['ADMIN'];
  if (!user || !allowedRoles.includes(user.role)) {
    return { message: "Acesso negado: Você não tem permissão para realizar esta ação." };
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

  const { tipoId, data, pontos: pontosFormulario, detalhes } = validatedFields.data;

  try {

    const tipoAnotacao = await prisma.tipoDeAnotacao.findUnique({
      where: { id: tipoId },
      select: { pontos: true, abertoCoordenacao: true }
    });

    if (!tipoAnotacao) {
      return { message: "O tipo de anotação selecionado não existe ou foi removido." };
    }


    let pontosFinais = pontosFormulario;

    if (!tipoAnotacao.abertoCoordenacao) {

      pontosFinais = tipoAnotacao.pontos ?? 0;
    }


    const anotacoesData = alunoIds.map(alunoId => ({
      alunoId,
      tipoId,
      data,
      pontos: pontosFinais,
      detalhes,
      autorId: user.id,
    }));

    await prisma.$transaction(
      anotacoesData.map(data => prisma.anotacao.create({ data }))
    );


    const resultadosCalculo = await Promise.allSettled(
      alunoIds.map(id => recalcularConceitoAluno(id))
    );

    resultadosCalculo.forEach((res, index) => {
      if (res.status === 'rejected') {
        console.error(`Falha ao recalcular aluno ${alunoIds[index]}:`, res.reason);
      }
    });

  } catch (error) {
    console.error("Erro crítico em createAnotacao:", error);
    return { message: "Ocorreu um erro interno ao processar sua solicitação. Tente novamente." };
  }


  revalidatePath("/admin/anotacoes");
  revalidatePath("/admin/alunos");
  redirect("/admin/alunos");
}