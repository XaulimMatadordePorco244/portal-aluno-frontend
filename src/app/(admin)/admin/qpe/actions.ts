"use server";

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { CodigoAnotacao } from '@prisma/client';
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
  
  const data: {
    titulo: string;
    descricao: string;
    codigo: CodigoAnotacao | null;
    pontos: number | null;
    abertoCoordenacao: boolean;
  } = { titulo, descricao, codigo: null, pontos: null, abertoCoordenacao: false };

  switch (selectionType) {
    case 'FO_POSITIVO':
      data.codigo = CodigoAnotacao.FO_POSITIVO;
      data.pontos = 0.5;
      break;
    case 'FO_NEGATIVO':
      data.codigo = CodigoAnotacao.FO_NEGATIVO;
      data.pontos = -0.3;
      break;
    case 'ELOGIO_COORDENACAO':
      data.abertoCoordenacao = true;
      data.pontos = null;
      data.codigo = CodigoAnotacao.FO_POSITIVO;
      break;
    case 'PUNICAO_COORDENACAO':
      data.abertoCoordenacao = true;
      data.pontos = null;
      data.codigo = CodigoAnotacao.FO_NEGATIVO;
      break;
    case 'ELOGIO_CUSTOM':
      if (!customPontos || parseFloat(customPontos) <= 0) {
        return { message: 'Para Elogio Manual, os pontos devem ser um número positivo.', type: 'error' };
      }
      data.pontos = parseFloat(customPontos);
      data.codigo = CodigoAnotacao.FO_POSITIVO;
      break;
    case 'PUNICAO_CUSTOM':
      if (!customPontos || parseFloat(customPontos) <= 0) {
        return { message: 'Para Punição Manual, os pontos devem ser um número positivo.', type: 'error' };
      }
      data.pontos = -parseFloat(customPontos);
      data.codigo = CodigoAnotacao.FO_NEGATIVO;
      break;
  }

  try {
    await prisma.tipoDeAnotacao.create({ data });
    revalidatePath('/admin/qpe');
    return { message: `"${titulo}" foi adicionado com sucesso!`, type: 'success' };
  } catch (error: unknown) {

    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: unknown }).code === 'P2002') {
      return { message: 'Já existe um item com este título.', type: 'error' };
    }
    return { message: 'Erro no servidor.', type: 'error' };
  }
}

export async function updateTipoDeAnotacao(prevState: CreateQPEState, formData: FormData): Promise<CreateQPEState> {
  const UpdateSchema = z.object({
    id: z.string(),
    titulo: z.string().min(3, 'O título é obrigatório.'),
    descricao: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
    pontos: z.string().optional().transform(val => (val !== '' && val !== undefined) ? parseFloat(val) : null),
  });

  const validatedFields = UpdateSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return { message: firstError || "Erro de validação.", type: 'error' };
  }

  const { id, titulo, descricao, pontos } = validatedFields.data;

  try {
    await prisma.tipoDeAnotacao.update({
      where: { id },
      data: {
        titulo,
        descricao,
        pontos,
      },
    });
  } catch {
    return { message: 'Erro no servidor. Não foi possível atualizar o item.', type: 'error' };
  }

  revalidatePath('/admin/qpe');
  redirect('/admin/qpe');
}

export async function deleteTipoDeAnotacao(formData: FormData) {
  const schema = z.object({
    id: z.string(),
  });
  
  const validatedFields = schema.safeParse({
    id: formData.get('id'),
  });

  if (!validatedFields.success) {
    return;
  }
  
  const { id } = validatedFields.data;

  try {
    await prisma.tipoDeAnotacao.delete({
      where: { id },
    });
    revalidatePath('/admin/qpe');
  } catch {
    console.error("Erro ao deletar item do QPE.");
  }
}