import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/auth";
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
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main className="flex-grow bg-background p-6">
        {children}
      </main>
    </div>
  );
}