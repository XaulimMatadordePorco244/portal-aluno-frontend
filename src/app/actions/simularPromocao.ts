'use server'

import { simularPromocao } from "@/lib/promo-engine";

export async function runSimulacao(regras: any) {

  
  try {
    const report = await simularPromocao("ANTIGUIDADE", regras);
    return { success: true, report };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Falha na simulação" };
  }
}