import { Header } from "@/components/header";
import { getCurrentUserWithRelations } from "@/lib/auth";
import { Metadata } from "next";

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
  const user = await getCurrentUserWithRelations();

  const userForHeader = user ? {
    ...user,
    nomeDeGuerra: user.perfilAluno?.nomeDeGuerra ?? null,
    cargo: user.perfilAluno?.cargo?.nome ?? null
  } : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={userForHeader} />
      <main className="flex grow bg-background p-6">
        {children}
      </main>
    </div>
  );
}