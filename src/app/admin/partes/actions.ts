"use server";

import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StatusParte, ResultadoAnalise } from "@prisma/client"; 

export async function analisarParteAdmin(
  parteId: string, 
  resultado: ResultadoAnalise, 
  observacoes: string
) {
  const session = await getCurrentUser();
  
  if (!session || session.role !== 'ADMIN') {
      throw new Error("Não autorizado");
  }

  let novoStatus: StatusParte = "AGUARDANDO_COMANDANTE";
  if (resultado === "APROVADA") novoStatus = "DEFERIDO";
  if (resultado === "NEGADA" || resultado === "ARQUIVADA") novoStatus = "INDEFERIDO";
  if (resultado === "ENCAMINHADA") novoStatus = "ENCAMINHADO";

  const parteAtual = await prisma.parte.findUnique({ where: { id: parteId }});
  
  const acaoLog = parteAtual?.status === "AGUARDANDO_COMANDANTE" 
      ? "ANALISE_DIRETA_COORDENACAO" 
      : "ANALISE_COORDENACAO";       

  try {
    await prisma.$transaction([
      prisma.parte.update({
        where: { id: parteId },
        data: {
          status: novoStatus,
          analiseComando: observacoes,
          dataAnalise: new Date(),
          analisadoPorId: session.userId,
        },
      }),
      prisma.analise.create({
        data: {
          parteId: parteId,
          analistaId: session.userId,
          resultado: resultado,
          observacoes: observacoes,
        }
      }),
      prisma.logParte.create({
        data: {
          parteId: parteId,
          atorId: session.userId,
          acao: acaoLog,
          detalhes: `Decisão: ${resultado} - ${observacoes}`
        }
      })
    ]);

    revalidatePath("/admin/partes");
    revalidatePath(`/admin/partes/${parteId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao processar análise admin:", error);
    return { error: "Erro ao salvar a análise." };
  }
}