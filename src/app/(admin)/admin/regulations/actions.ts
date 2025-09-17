"use server";

import { put } from '@vercel/blob';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';


const FormSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter no mínimo 3 caracteres.'),
  arquivo: z
    .instanceof(File, { message: 'Um arquivo PDF é obrigatório.' })
    .refine((file) => file.size > 0, 'Um arquivo PDF é obrigatório.')
    .refine((file) => file.type === 'application/pdf', 'Apenas arquivos PDF são permitidos.')
    .refine((file) => file.size < 4 * 1024 * 1024, 'O arquivo deve ter no máximo 4MB.'),
});

export interface UploadState {
  error?: string;
  success?: boolean;
}

export async function uploadRegulamento(prevState: UploadState, formData: FormData): Promise<UploadState> {
  const validatedFields = FormSchema.safeParse({
    titulo: formData.get('titulo'),
    arquivo: formData.get('arquivo'),
  });

  if (!validatedFields.success) {
    
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError };
  }

  const { titulo, arquivo } = validatedFields.data;

  try {
   
    const blob = await put(arquivo.name, arquivo, {
      access: 'public',
      contentType: 'application/pdf',
    });

    
    await prisma.regulamento.create({
      data: {
        titulo: titulo,
        arquivoUrl: blob.url, 
      },
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return { error: 'Ocorreu um erro no servidor ao tentar fazer o upload.' };
  }


  revalidatePath('/regulations');
  redirect('/regulations');
}