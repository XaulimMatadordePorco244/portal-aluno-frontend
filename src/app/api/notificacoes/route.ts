import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth"; 

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Não autorizado", { status: 401 });

    const notificacoes = await prisma.notificacao.findMany({
      where: {
        usuarioId: user.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json(notificacoes);
  } catch (error) {
    console.error("[NOTIFICACOES_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

export async function PATCH() {
  try {
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Não autorizado", { status: 401 });

    await prisma.notificacao.updateMany({
      where: {
        usuarioId: user.userId,
        lida: false,
      },
      data: {
        lida: true,
      }
    });

    return NextResponse.json({ message: "Notificações marcadas como lidas." });
  } catch (error) {
    console.error("[NOTIFICACOES_PATCH]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}