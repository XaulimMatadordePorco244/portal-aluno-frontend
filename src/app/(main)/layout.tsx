// src/app/(main)/layout.tsx

import { Header } from "@/components/header"; // Vamos criar este componente a seguir

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-100 p-6">
        {children}
      </main>
    </div>
  );
}