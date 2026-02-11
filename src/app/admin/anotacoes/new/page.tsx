import prisma from "@/lib/prisma";
import AnotacaoForm from "@/components/admin/anotacoes/AnotacaoForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Prisma } from '@prisma/client';

type AlunoWithPerfilCompanhiaCargo = Prisma.UsuarioGetPayload<{
  include: {
    perfilAluno: {
      include: {
        companhia: true,
        cargo: true
      }
    }
  }
}>;

type UsuarioWithPerfilCargo = Prisma.UsuarioGetPayload<{
  include: {
    perfilAluno: {
      include: {
        companhia: true,
        cargo: true
      }
    }

  }
}>;

interface NewAnotacaoPageProps {
  searchParams: {
    alunoId?: string;
  };
}

export default async function NewAnotacaoPage({ searchParams }: NewAnotacaoPageProps) {
  const alunos = await prisma.usuario.findMany({
    where: { 
      status: 'ATIVO', 
      role: 'ALUNO' 
    },
    include: {
      perfilAluno: {
        include: {
          companhia: true,
          cargo: true
        }
      }
    },
    orderBy: {
      perfilAluno: {
        nomeDeGuerra: 'asc'
      }
    }
  });

  const usuarios = await prisma.usuario.findMany({
    where: { 
      status: 'ATIVO',
      role: { in: ['ADMIN', 'ALUNO'] }
    },
    include: {
      perfilAluno: {
        include: {
          cargo: true
        }
      }
    },
    orderBy: { nome: 'asc' }
  });

  const tiposDeAnotacao = await prisma.tipoDeAnotacao.findMany({
    orderBy: { titulo: 'asc' }
  });

  const alunosWithRelations = alunos as AlunoWithPerfilCompanhiaCargo[];
  const usuariosWithRelations = usuarios as UsuarioWithPerfilCargo[];

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Lançar Nova Anotação</CardTitle>
          <CardDescription>
            Selecione o aluno, o tipo de anotação e defina quem observou o fato.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnotacaoForm 
            alunos={alunosWithRelations}
            usuarios={usuariosWithRelations}
            tiposDeAnotacao={tiposDeAnotacao}
            preSelectedAlunoId={searchParams.alunoId} 
          />
        </CardContent>
      </Card>
    </div>
  );
}