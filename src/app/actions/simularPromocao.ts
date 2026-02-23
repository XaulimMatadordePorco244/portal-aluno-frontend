'use server'

import { simularPromocao, RegraComRequisitos } from "@/lib/promo-engine";

export async function runSimulacao(regras: RegraComRequisitos[]) {
  try {
    const report = await simularPromocao("ANTIGUIDADE", regras);
    return { success: true, report };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Falha na simulação" };
  }
}