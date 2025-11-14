import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditEscalaForm } from "./edit-escala-form";
import { getCurrentUser } from "@/lib/auth";
import { Scale } from "lucide-react";
import { Cargo, Funcao, Usuario, Escala, EscalaItem } from "@prisma/client";

export type UserComCargoEFuncao = Usuario & {
  funcao: Funcao | null;
  cargo: Cargo | null;
};


export type EscalaItemCompleto = EscalaItem & {
  aluno: Usuario;
  funcaoId: string | null; 
};

export type EscalaCompleta = Escala & {
  itens: EscalaItemCompleto[]; 
  criadoPor: Usuario;
};

async function getEscalaDetailsSimple(id: string): Promise<EscalaCompleta | null> {
  const escala = await prisma.escala.findUnique({
    where: { id },
    include: {
      itens: {
        include: {
          aluno: {
            include: {
              funcao: true
            }
          },
        },
        orderBy: {
          secao: 'asc',
        },
      },
      criadoPor: true,
    },
  });

  if (!escala) return null;

 
  return {
    ...escala,
    itens: escala.itens.map(item => ({
      ...item,
      funcaoId: item.aluno.funcao?.id || null
    }))
  };
}

async function getFormData() {
  const [alunos, admins, funcoes] = await Promise.all([
    prisma.usuario.findMany({
      where: { role: 'ALUNO', status: 'ATIVO' },
      include: {
        funcao: true,
        cargo: true
      },
      orderBy: {
        cargo: { precedencia: 'asc' }
      }
    }),
    prisma.usuario.findMany({
      where: { role: 'ADMIN' },
      include: {
        funcao: true,
        cargo: true
      },
      orderBy: {
        cargo: { precedencia: 'asc' }
      }
    }),
    prisma.funcao.findMany({
      orderBy: {
        nome: 'asc'
      }
    })
  ]);

  return {
    alunos: alunos as UserComCargoEFuncao[],
    admins: admins as UserComCargoEFuncao[],
    funcoes
  };
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DetalheEscalaPage({ params }: PageProps) {
  const { id } = await params;

  const [escala, formData] = await Promise.all([
    getEscalaDetailsSimple(id), 
    getFormData(),
    getCurrentUser()
  ]);

  if (!escala) {
    notFound();
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Scale className="w-8 h-8 text-foreground" />
          <h1 className="text-3xl font-bold text-foreground">Detalhes da Escala</h1>
        </div>
      </div>

      <EditEscalaForm
        escalaInicial={escala}
        alunos={formData.alunos}
        admins={formData.admins}
        funcoes={formData.funcoes}
      />
    </>
  );
}