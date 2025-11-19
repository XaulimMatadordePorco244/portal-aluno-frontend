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
    return { error: "Por favor, insira um número de matrícula." };
  }

  let user;
  try {
    user = await prisma.usuario.findFirst({
      where: { 
        perfilAluno: { 
          numero: numero 
        }
      },
      select: {
        validationId: true
      }
    });

  } catch (error) {
    return { error: "Ocorreu um erro ao consultar o banco de dados. Tente novamente." };
  }

  if (!user) {
    return { error: "Aluno não encontrado com este número de matrícula." };
  }
  
  redirect(`/validar/${user.validationId}`);
}