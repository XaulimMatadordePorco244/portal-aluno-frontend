import prisma from "@/lib/prisma";
import { EscalaForm } from "./escala-form";
import { getCurrentUser } from "@/lib/auth";
import { Scale } from "lucide-react";



async function getFormData() {

  const [alunos, admins] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: 'ALUNO',
        status: 'ATIVO',
      },
      orderBy: {
        nomeDeGuerra: 'asc'
      }
    }),
    prisma.user.findMany({
        where: {
            role: 'ADMIN',
        },
        orderBy: {
            nome: 'asc'
        }
    })
  ]);
  return { alunos, admins };
}

export default async function NovaEscalaPage() {
  const { alunos, admins } = await getFormData();
  const currentUser = await getCurrentUser();

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Scale className="w-8 h-8 text-foreground" />
          <h1 className="text-3xl font-bold text-foreground">Criar Nova Escala</h1>
        </div>
      </div>
      
  
      <EscalaForm 
        alunos={alunos} 
        admins={admins}
        elaboradorPadrao={currentUser?.nome ?? ''} 
      />
    </>
  );
}