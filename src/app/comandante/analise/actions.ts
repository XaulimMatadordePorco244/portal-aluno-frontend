"use server";

import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StatusParte, ResultadoAnalise } from "@prisma/client"; 

export async function processarAnalise(
  parteId: string, 
  decisao: "DEFERIDO" | "INDEFERIDO" | "ENCAMINHADO", 
  observacao: string
) {
  const session = await getCurrentUser();
  if (!session) throw new Error("Não autorizado");

  let novoStatus: StatusParte = "DEFERIDO";
  let resultadoAnalise: ResultadoAnalise = "APROVADA";

  if (decisao === "INDEFERIDO") {
    novoStatus = "INDEFERIDO";
    resultadoAnalise = "NEGADA";
  } else if (decisao === "ENCAMINHADO") {
    novoStatus = "AGUARDANDO_COORDENACAO"; 
    resultadoAnalise = "ENCAMINHADA";
  }

  try {
    await prisma.$transaction([
      prisma.parte.update({
        where: { id: parteId },
        data: {
          status: novoStatus,
          analiseComando: observacao,
          dataAnalise: new Date(),
          analisadoPorId: session.userId,
        },
      }),
      prisma.analise.create({
        data: {
          parteId: parteId,
          analistaId: session.userId,
          resultado: resultadoAnalise,
          observacoes: observacao,
        }
      }),
      prisma.logParte.create({
        data: {
          parteId: parteId,
          atorId: session.userId,
          acao: decisao === "ENCAMINHADO" ? "ENCAMINHOU_COORDENACAO" : `ANALISE_COMANDANTE_${decisao}`,
          detalhes: observacao
        }
      })
    ]);

    revalidatePath("/comandante");
    revalidatePath(`/comandante/analise/${parteId}`);
    return { success: true };
    
  } catch (error) {
    console.error("Erro ao processar análise do comandante:", error);
    return { error: "Erro ao salvar a decisão." };
  }
  
  
}