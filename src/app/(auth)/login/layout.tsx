import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Portal do Aluno",
  description: "Login - Portal do Aluno Guarda Mirim de Naviraí-MS",
  icons: {
    icon: "/img/logo.png",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  );
}