'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { CampoRequisito, OperadorLogico } from '@prisma/client'

export interface RequisitoInput {
  campo: CampoRequisito;
  operador: OperadorLogico;
  valor: string;
}

export interface RegraDinamicaInput {
  cargoOrigemId: string;
  cargoDestinoId: string;
  requisitos: RequisitoInput[];
}

export async function saveRegrasDinamicas(modalidade: string, regras: RegraDinamicaInput[]) {
  try {
    await prisma.$transaction(async (tx) => {
      
      for (const regra of regras) {
        const regraSalva = await tx.regraPromocao.upsert({
          where: {
            modalidade_cargoOrigemId_cargoDestinoId: {
              modalidade: modalidade,
              cargoOrigemId: regra.cargoOrigemId,
              cargoDestinoId: regra.cargoDestinoId,
            }
          },
          update: {}, 
          create: {
            modalidade: modalidade,
            cargoOrigemId: regra.cargoOrigemId,
            cargoDestinoId: regra.cargoDestinoId,
          }
        });
        await tx.requisitoPromocao.deleteMany({
          where: { regraId: regraSalva.id }
        });

        if (regra.requisitos && regra.requisitos.length > 0) {
          await tx.requisitoPromocao.createMany({
            data: regra.requisitos.map((req) => ({
              regraId: regraSalva.id,
              campo: req.campo,
              operador: req.operador,
              valor: String(req.valor)
            }))
          });
        }
      }
      
    }, {
      maxWait: 5000,
      timeout: 15000 
    });

    revalidatePath(`/admin/configuracoes/regras/${modalidade.toLowerCase()}`);
    revalidatePath('/admin/configuracoes');

    return { success: true, message: 'Regras salvas com sucesso!' };

  } catch (error) {
    console.error("[ERRO_SALVAR_REGRAS]:", error);
    return { success: false, message: 'Erro interno ao salvar as regras.' };
  }
}