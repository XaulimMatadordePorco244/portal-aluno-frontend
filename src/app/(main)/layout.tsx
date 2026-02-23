import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import React from "react";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Portal do Aluno - Guarda Mirim",
  description: "Portal do aluno Guarda Mirim de Naviraí-MS",
  icons: {
    icon: "/img/logo.png",
  },
};

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();
  let userForHeader = null;

  if (session?.userId) {
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

    if (user) {
      userForHeader = {
        nome: user.nome,
        role: user.role,
        nomeDeGuerra: user.perfilAluno?.nomeDeGuerra ?? null,
        cargo: user.perfilAluno?.cargo?.nome ?? null,
        funcao: user.perfilAluno?.funcao?.nome ?? null,
        fotoUrl: user.fotoUrl ?? null,
      };
    }
  }
return (
  <div className="flex flex-col min-h-screen">
    <Header user={userForHeader} />

    <main className="grow   py-8">
      <Container>
        {children}
      </Container>
    </main>
  </div>
);

}