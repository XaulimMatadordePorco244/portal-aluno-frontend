"use server";

import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StatusParte } from "@prisma/client"; 

export async function processarAnalise(parteId: string, decisao: "DEFERIDO" | "INDEFERIDO", observacao: string) {
  const session = await getCurrentUser();

  if (!session) {
    throw new Error("Não autorizado");
  }

  const novoStatus: StatusParte = decisao === "DEFERIDO" ? "DEFERIDO" : "INDEFERIDO";

  try {
    await prisma.parte.update({
      where: { id: parteId },
      data: {
        status: novoStatus,
        analiseComando: observacao,
        dataAnalise: new Date(),
        analisadoPorId: session.userId,

      },
    });

    revalidatePath("/comandante");
    revalidatePath(`/comandante/analise/${parteId}`);
    
  } catch (error) {
    console.error("Erro ao processar análise:", error);
    return { error: "Erro ao salvar a decisão." };
  }
  
  redirect("/comandante/partes");
}