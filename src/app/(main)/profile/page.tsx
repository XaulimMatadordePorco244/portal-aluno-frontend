// src/app/(main)/profile/page.tsx
import { getFullCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient"; // Importa nosso novo componente de UI

export default async function ProfilePage() {
  const user = await getFullCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <ProfileClient user={user} />;
}