'use server'

import prisma from '@/lib/prisma';
import { getCurrentUserWithRelations } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function saveRegrasPromocao(modalidade: string, regras: any[]) {
  const user = await getCurrentUserWithRelations();
  
  if (!user) {
    throw new Error("Não autorizado");
  }

  const operations = regras.map(regra => {
    return prisma.regraPromocao.upsert({
      where: {
             modalidade_cargoOrigemId_cargoDestinoId: {
          modalidade,
          cargoOrigemId: regra.cargoOrigemId,
          cargoDestinoId: regra.cargoDestinoId
        }
      },
      update: {
        minConceito: regra.minConceito,
        minMediaEscolar: regra.minMediaEscolar,
        minTaf: regra.minTaf
      },
      create: {
        modalidade,
        cargoOrigemId: regra.cargoOrigemId,
        cargoDestinoId: regra.cargoDestinoId,
        minConceito: regra.minConceito,
        minMediaEscolar: regra.minMediaEscolar,
        minTaf: regra.minTaf
      }
    });
  });

  await prisma.$transaction(operations);
  

  const slug = modalidade.toLowerCase().replace('_', '-');
  revalidatePath(`/admin/configuracoes/regras/${slug}`);
  
  return { success: true };
}