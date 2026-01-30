"use server";

import prisma from "@/lib/prisma"; 
import { redirect } from "next/navigation";

export interface FormState {
  error: string | null;
}

export async function validateUserByNumber(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  
  const numero = formData.get("numero") as string;

  if (!numero || numero.trim() === '') {
    return { error: "Por favor, insira o número da matrícula." };
  }

  const numeroLimpo = numero.trim().toUpperCase();

  let user;
  try {
    user = await prisma.usuario.findFirst({
      where: { 
        perfilAluno: { numero: numeroLimpo } 
      },
      include: {
        perfilAluno: true 
      }
    });

  } catch (error) {
    console.error("Erro na validação:", error);
    return { error: "Erro de conexão. Tente novamente mais tarde." };
  }

  if (!user || !user.perfilAluno) {
    return { error: `Nenhum aluno encontrado com a matrícula "${numeroLimpo}".` };
  }
  
  redirect(`/validar/${user.perfilAluno.id}`);
}