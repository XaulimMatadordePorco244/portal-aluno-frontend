import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  try {
    const { id } = await params;
    const { novoPrazo } = await request.json();

    await prisma.atividade.update({
      where: { id },
      data: { 
        prazoEntrega: new Date(novoPrazo),
        prazoEncerrado: false 
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar prazo" }, { status: 500 });
  }
}