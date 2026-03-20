"use server";

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  titulo: z.string().min(3, 'O título é obrigatório.'),
  descricao: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
  selectionType: z.string().min(1, 'Selecione um tipo de item.'),
  pontos: z.string().optional(),
});

export interface CreateQPEState {
  message?: string;
  type?: 'success' | 'error';
}

export async function createTipoDeAnotacao(prevState: CreateQPEState, formData: FormData): Promise<CreateQPEState> {
  const validatedFields = FormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return { message: firstError || "Erro de validação.", type: 'error' };
  }

  const { titulo, descricao, selectionType, pontos: customPontos } = validatedFields.data;

  try {
    if (selectionType === 'SUSPENSAO') {
      await prisma.tipoDeSuspensao.create({
        data: { titulo, descricao }
      });
      revalidatePath('/admin/qpe');
      return { message: `Suspensão "${titulo}" adicionada com sucesso!`, type: 'success' };
    }

    const data: any = { titulo, descricao, pontos: null, abertoCoordenacao: false, categoriaAberto: null };

    switch (selectionType) {
      case 'FO_POSITIVO': data.pontos = 0.5; break;
      case 'FO_NEGATIVO': data.pontos = -0.3; break;
      case 'ELOGIO_COORDENACAO': data.abertoCoordenacao = true; data.categoriaAberto = 'ELOGIO'; break;
      case 'PUNICAO_COORDENACAO': data.abertoCoordenacao = true; data.categoriaAberto = 'PUNICAO'; break;
      case 'ELOGIO_CUSTOM':
        if (!customPontos || parseFloat(customPontos) <= 0) return { message: 'Pontos inválidos.', type: 'error' };
        data.pontos = parseFloat(customPontos);
        break;
      case 'PUNICAO_CUSTOM':
        if (!customPontos || parseFloat(customPontos) <= 0) return { message: 'Pontos inválidos.', type: 'error' };
        data.pontos = -parseFloat(customPontos);
        break;
    }

    await prisma.tipoDeAnotacao.create({ data });
    revalidatePath('/admin/qpe');
    return { message: `"${titulo}" foi adicionado com sucesso!`, type: 'success' };

  } catch (error: unknown) {
    return { message: 'Erro no servidor ou item já existente.', type: 'error' };
  }
}

export async function updateTipoDeAnotacao(prevState: CreateQPEState, formData: FormData): Promise<CreateQPEState> {
  const UpdateSchema = z.object({
    id: z.string(),
    titulo: z.string().min(3, 'O título é obrigatório.'),
    descricao: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
    
    pontos: z.string()
      .optional()
      .transform(val => (!val || val.trim() === '') ? null : parseFloat(val)),
      
    abertoCoordenacao: z.string()
      .optional()
      .transform(val => val === 'true'),
      
    categoriaAberto: z.string()
      .optional()
      .nullable()
      .transform(val => (!val || val.trim() === '') ? null : val),
      
    tipoRegisto: z.string().optional(),
  });

  const validatedFields = UpdateSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return { message: firstError || "Erro de validação.", type: 'error' };
  }

  const { id, titulo, descricao, pontos, abertoCoordenacao, categoriaAberto, tipoRegisto } = validatedFields.data;

  try {
    if (tipoRegisto === 'SUSPENSAO') {
      await prisma.tipoDeSuspensao.update({
        where: { id },
        data: { titulo, descricao },
      });
    } else {
      await prisma.tipoDeAnotacao.update({
        where: { id },
        data: {
          titulo,
          descricao,
          pontos,
          abertoCoordenacao,
          categoriaAberto,
        },
      });
    }
  }  catch (error: any) {
    console.error("🔴 ERRO AO ATUALIZAR QPE:", error); 
    
    if (error?.code === 'P2002') {
      return { 
        message: 'Já existe uma regra no QPE cadastrada com este exato título. Escolha um nome diferente.', 
        type: 'error' 
      };
    }

    return { message: 'Erro no servidor. Não foi possível atualizar o item.', type: 'error' };
  }

  revalidatePath('/admin/qpe');
  redirect('/admin/qpe');
}

export async function deleteItemQPE(formData: FormData) {
  const schema = z.object({
    id: z.string(),
    tipoRegisto: z.string(),
  });

  const validatedFields = schema.safeParse({
    id: formData.get('id'),
    tipoRegisto: formData.get('tipoRegisto'),
  });

  if (!validatedFields.success) return;

  const { id, tipoRegisto } = validatedFields.data;

  try {
    if (tipoRegisto === 'SUSPENSAO') {
      await prisma.tipoDeSuspensao.delete({ where: { id } });
    } else {
      await prisma.tipoDeAnotacao.delete({ where: { id } });
    }
    revalidatePath('/admin/qpe');
  } catch {
    console.error("Erro ao deletar item.");
  }
}