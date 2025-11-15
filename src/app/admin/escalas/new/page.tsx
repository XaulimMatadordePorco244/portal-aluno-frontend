import prisma from "@/lib/prisma";
import { EscalaForm } from "./escala-form";
import { getCurrentUser } from "@/lib/auth";
import { Scale } from "lucide-react";


async function getFormData() {
  
  const [alunos, admins, funcoes] = await Promise.all([
   
    prisma.usuario.findMany({
      where: {
        role: 'ALUNO',
        status: 'ATIVO',
      },
      include: {
        funcao: true,
      },
      orderBy: {
        nomeDeGuerra: 'asc'
      }
    }),

    prisma.usuario.findMany({
        where: {
            role: 'ADMIN',
        },
        include: {
            funcao: true, 
        },
        orderBy: {
            nome: 'asc'
        }
    }),

    prisma.funcao.findMany({
        orderBy: {
            nome: 'asc'
        }
    })
  ]);
  return { alunos, admins, funcoes };
}

export default async function NovaEscalaPage() {
  const { alunos, admins, funcoes } = await getFormData();
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
        funcoes={funcoes}
        elaboradorPadrao={currentUser?.nome ?? ''} 
      />
    </>
  );
}