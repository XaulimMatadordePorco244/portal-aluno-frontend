// src/app/(main)/layout.tsx
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main className="flex-grow bg-gray-100 p-6">
        {children}
      </main>
    </div>
  );
}