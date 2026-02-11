import prisma from "@/lib/prisma";
import AnotacaoForm from "@/components/admin/anotacoes/AnotacaoForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { Prisma } from '@prisma/client';

interface EditAnotacaoPageProps {
  params: {
    id: string;
  };
}
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

export default async function EditAnotacaoPage({ params }: EditAnotacaoPageProps) {
  const anotacao = await prisma.anotacao.findUnique({
    where: { id: params.id },
  });

  if (!anotacao) {
    notFound();
  }

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
          <CardTitle>Editar Anotação</CardTitle>
          <CardDescription>
            Altere os dados da ocorrência abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnotacaoForm 
            alunos={alunosWithRelations} 
            usuarios={usuariosWithRelations}
            tiposDeAnotacao={tiposDeAnotacao}
            initialData={{
              id: anotacao.id,
              alunoId: anotacao.alunoId, 
              tipoId: anotacao.tipoId,
              data: anotacao.data,
              pontos: Number(anotacao.pontos),
              detalhes: anotacao.detalhes,
              quemAnotouId: anotacao.quemAnotouId,
              quemAnotouNome: anotacao.quemAnotouNome,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}