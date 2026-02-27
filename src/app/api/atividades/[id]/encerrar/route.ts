import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  try {
    const { id } = await params;

    await prisma.atividadeAluno.updateMany({
      where: {
        atividadeId: id,
        status: {
          in: ['PENDENTE', 'VISUALIZADO'] 
        }
      },
      data: {
        status: 'NAO_REALIZADO'
      }
    });

    await prisma.atividade.update({
      where: { id },
      data: { prazoEncerrado: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao encerrar atividade" }, { status: 500 });
  }
}