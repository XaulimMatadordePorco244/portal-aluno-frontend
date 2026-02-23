import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import React from "react";
import { Container } from "@/components/layout/Container";

export default async function ComandanteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();

  if (!session?.userId) {
    redirect("/login");
  }

  const user = await prisma.usuario.findUnique({
    where: { id: session.userId },
    include: {
      perfilAluno: {
        include: {
          cargo: true,
          funcao: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const nomeFuncao = user.perfilAluno?.funcao?.nome;
  const isComandante = nomeFuncao === "Comandante Geral" || nomeFuncao === "COMANDANTE GERAL";
  const isAdmin = user.role === "ADMIN";

  if (!isComandante && !isAdmin) {
    redirect("/dashboard");
  }

  const userForHeader = {
    nome: user.nome,
    role: user.role,
    nomeDeGuerra: user.perfilAluno?.nomeDeGuerra ?? null,
    cargo: user.perfilAluno?.cargo?.nome ?? null,
    funcao: user.perfilAluno?.funcao?.nome ?? null,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={userForHeader} />
      <main className="bg-background p-6">
        <Container>
          {children}
        </Container>
      </main>
    </div>
  );
}