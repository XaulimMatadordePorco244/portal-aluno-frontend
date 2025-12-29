import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient"; 

export default async function ProfilePage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect('/login');
  }

  const userId = sessionUser.userId as string; 


  const userFull = await prisma.usuario.findUnique({
    where: { id: userId }, 
    include: {
      perfilAluno: {
        include: {
          cargo: true,
          companhia: true
        }
      }
    }
  });

  if (!userFull) {
    return <div className="p-8 text-center">Erro ao carregar perfil. Usuário não encontrado no banco.</div>;
  }

  return <ProfileClient user={userFull} />;
}