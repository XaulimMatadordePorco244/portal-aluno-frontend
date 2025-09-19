"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { getFullCurrentUser } from "@/lib/auth"; 


export type QESState = {
  errors?: {
    titulo?: string[];
    arquivo?: string[];
  };
  message?: string;
  success?: boolean;
} | undefined;

const FormSchema = z.object({
  titulo: z.string().min(3, "O título é obrigatório."),
  arquivo: z
    .instanceof(File, { message: "Por favor, selecione um arquivo." })
    .refine((file) => file.size > 0, "O arquivo não pode estar vazio.")
    .refine(
      (file) => file.type === "application/pdf",
      "O arquivo precisa ser um PDF."
    ),
});


export async function createQES(prevState: QESState, formData: FormData): Promise<QESState> {
  const user = await getFullCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return { message: "Acesso negado." };
  }

  const validatedFields = FormSchema.safeParse({
    titulo: formData.get("titulo"),
    arquivo: formData.get("arquivo"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { titulo, arquivo } = validatedFields.data;

  try {
    const blob = await put(arquivo.name, arquivo, {
      access: "public",
    });

    await prisma.qES.create({
      data: {
        titulo,
        arquivoUrl: blob.url,
        autorId: user.id,
      },
    });

    revalidatePath("/admin/qes");
    return { success: true };
  } catch (error) {
    console.error("Erro ao fazer upload do QES:", error);
    return { success: false, message: "Erro ao salvar o QES." };
  }
}