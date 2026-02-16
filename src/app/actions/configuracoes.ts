'use server'

import  prisma  from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CampoRequisito, OperadorLogico, Prisma } from "@prisma/client";

export interface RegraDinamicaInput {
  cargoOrigemId: string;
  cargoDestinoId: string;
  requisitos: {
    campo: CampoRequisito;
    operador: OperadorLogico;
    valor: string;
  }[];
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
              cargoDestinoId: regra.cargoDestinoId
            }
          },
          create: {
            modalidade,
            cargoOrigemId: regra.cargoOrigemId,
            cargoDestinoId: regra.cargoDestinoId,
          },
          update: {} 
        });

        await tx.requisitoPromocao.deleteMany({
          where: { regraId: regraSalva.id }
        });

        if (regra.requisitos.length > 0) {
          await tx.requisitoPromocao.createMany({
            data: regra.requisitos.map(req => ({
              regraId: regraSalva.id,
              campo: req.campo,
              operador: req.operador,
              valor: req.valor,
              obrigatorio: true
            }))
          });
        }
      }
    });

    revalidatePath('/admin/configuracoes/regras');
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar regras dinâmicas:", error);
    return { success: false, error: "Falha ao persistir configurações." };
  }
}