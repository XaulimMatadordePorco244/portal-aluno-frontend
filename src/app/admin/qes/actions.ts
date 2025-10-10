"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { getCurrentUserWithRelations } from "@/lib/auth";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { redirect } from 'next/navigation';

export type QESState = {
  errors?: {
    dataInicio?: string[];
    dataFim?: string[];
    arquivo?: string[];
  };
  message?: string;
  success?: boolean;
} | undefined;

const CreateFormSchema = z.object({
  dataInicio: z.string().min(1, "A data de início é obrigatória.").pipe(z.coerce.date()),
  dataFim: z.string().min(1, "A data de fim é obrigatória.").pipe(z.coerce.date()),
  arquivo: z
    .instanceof(File, { message: "Por favor, selecione um arquivo." })
    .refine((file) => file.size > 0, "O arquivo não pode estar vazio.")
    .refine((file) => file.type === "application/pdf", "O arquivo precisa ser um PDF."),
});

export async function createQES(prevState: QESState, formData: FormData): Promise<QESState> {
  const user = await getCurrentUserWithRelations();
  if (!user || user.role !== 'ADMIN') {
    return { message: "Acesso negado." };
  }

  const validatedFields = CreateFormSchema.safeParse({
    dataInicio: formData.get("dataInicio"),
    dataFim: formData.get("dataFim"),
    arquivo: formData.get("arquivo"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { dataInicio, dataFim, arquivo } = validatedFields.data;
  const titulo = `QES - ${format(dataInicio, 'dd/MM')} a ${format(dataFim, 'dd/MM/yyyy', { locale: ptBR })}`;

  try {
    const blob = await put(arquivo.name, arquivo, { access: "public", addRandomSuffix: true });
    await prisma.qES.create({
      data: { titulo, arquivoUrl: blob.url, dataInicio, dataFim, autorId: user.id },
    });

    revalidatePath("/admin/qes");
    return { success: true }; 
  } catch (error) {
    console.error("Erro ao fazer upload do QES:", error);
    return { success: false, message: "Erro ao salvar o QES." };
  }
}

export async function deleteQES(formData: FormData) {
  const user = await getCurrentUserWithRelations();
  if (!user || user.role !== 'ADMIN') {
    throw new Error("Acesso negado.");
  }

  const id = formData.get('id') as string;
  const arquivoUrl = formData.get('arquivoUrl') as string;

  if (!id || !arquivoUrl) {
    throw new Error("ID ou URL do arquivo não fornecidos.");
  }

  try {
    await del(arquivoUrl);
    await prisma.qES.delete({ where: { id } });
    revalidatePath("/admin/qes");
  } catch (error) {
    console.error("Erro ao deletar QES:", error);
  }
}

const UpdateFormSchema = z.object({
  id: z.string(),
  dataInicio: z.string().min(1, "A data de início é obrigatória.").pipe(z.coerce.date()),
  dataFim: z.string().min(1, "A data de fim é obrigatória.").pipe(z.coerce.date()),
  arquivo: z.instanceof(File).optional(),
});

export async function updateQES(prevState: QESState, formData: FormData): Promise<QESState> {
  const user = await getCurrentUserWithRelations();
  if (!user || user.role !== 'ADMIN') {
    return { message: "Acesso negado." };
  }

  const validatedFields = UpdateFormSchema.safeParse({
    id: formData.get("id"),
    dataInicio: formData.get("dataInicio"),
    dataFim: formData.get("dataFim"),
    arquivo: formData.get("arquivo"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { id, dataInicio, dataFim, arquivo } = validatedFields.data;
  const titulo = `QES - ${format(dataInicio, 'dd/MM')} a ${format(dataFim, 'dd/MM/yyyy', { locale: ptBR })}`;

  try {
    let arquivoUrl;
    if (arquivo && arquivo.size > 0) {
      const qesAntigo = await prisma.qES.findUnique({ where: { id } });
      if (qesAntigo?.arquivoUrl) {
        await del(qesAntigo.arquivoUrl);
      }
      const blob = await put(arquivo.name, arquivo, { access: "public", addRandomSuffix: true });
      arquivoUrl = blob.url;
    }

    await prisma.qES.update({
      where: { id },
      data: { titulo, dataInicio, dataFim, ...(arquivoUrl && { arquivoUrl }) },
    });
  } catch (error) {
    console.error("Erro ao atualizar o QES:", error);
    return { success: false, message: "Erro ao atualizar o QES." };
  }

  revalidatePath("/admin/qes");
  redirect("/admin/qes");
}