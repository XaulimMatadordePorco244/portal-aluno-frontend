import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter } from 'lucide-react';
import { AdminAlunosTable } from '@/components/cargos/AdminAlunosCargosTable'; 
import { Prisma } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Gerenciar Cargos',
  description: 'Administração de alunos',
};

export default async function AdminAlunosCargosPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const user = await getCurrentUserWithRelations();
  
  if (!user || !canAccessAdminArea(user)) {
    redirect('/dashboard');
  }

  const search = searchParams?.search as string || '';
  const companhiaId = searchParams?.companhia as string;
  const cargoId = searchParams?.cargo as string;
  const status = searchParams?.status as string;

  const where: Prisma.PerfilAlunoWhereInput = {
    usuario: {
      role: 'ALUNO',
      status: 'ATIVO'
    }
  };

  if (search) {
    where.OR = [
      { usuario: { nome: { contains: search } } },
      { numero: { contains: search } },
      { nomeDeGuerra: { contains: search } },
    ];
  }

  if (companhiaId && companhiaId !== 'all') {
    where.companhiaId = companhiaId;
  }
  
  if (cargoId) {
    if (cargoId !== 'all' && cargoId !== 'null') {
      where.cargoId = cargoId;
    } else if (cargoId === 'null') {
      where.cargoId = null;
    }
  }

  if (status === 'fora-de-data') {
    where.foraDeData = true;
  } else if (status === 'sem-cargo') {
    where.cargoId = null;
  } else if (status === 'com-cargo') {
    where.cargoId = { not: null };
  }

  const alunos = await prisma.perfilAluno.findMany({
    where,
    include: {
      usuario: { 
        select: { 
          id: true, 
          nome: true, 
          cpf: true, 
          status: true 
        } 
      },
      cargo: { 
        select: { 
          id: true, 
          nome: true, 
          abreviacao: true 
        } 
      }, 
      funcao: { 
        select: { 
          id: true, 
          nome: true 
        } 
      },
      companhia: { 
        select: { 
          id: true, 
          nome: true, 
          abreviacao: true 
        } 
      },
      historicoCargos: {
        select: { dataInicio: true },
        orderBy: { dataInicio: 'desc' },
        take: 1
      },
    },
    orderBy: { usuario: { nome: 'asc' } },
  });

  const [companhias, cargos] = await Promise.all([
    prisma.companhia.findMany({ orderBy: { nome: 'asc' } }),
    prisma.cargo.findMany({ orderBy: { precedencia: 'asc' } }),
  ]);


  interface AlunoData {
    id: string;
    nome: string;
    perfilAluno: {
      id: string;
      numero?: string;
      nomeDeGuerra?: string;
      conceitoAtual?: string;
      foraDeData: boolean;
      cargo?: {
        id: string;
        nome: string;
        abreviacao: string; 
      };
      companhia?: {
        id: string;
        nome: string;
        abreviacao?: string;
      };
      historicoCargos: Array<{ dataInicio: Date }>;
    };
  }

  const alunosData: AlunoData[] = alunos.map(aluno => ({
    id: aluno.usuario.id,
    nome: aluno.usuario.nome,
    perfilAluno: {
      id: aluno.id,
      numero: aluno.numero || undefined,
      nomeDeGuerra: aluno.nomeDeGuerra || undefined,
      conceitoAtual: aluno.conceitoAtual 
        ? Number(aluno.conceitoAtual).toFixed(2)
        : undefined,
      foraDeData: aluno.foraDeData,
      cargo: aluno.cargo ? {
        id: aluno.cargo.id,
        nome: aluno.cargo.nome,
        abreviacao: aluno.cargo.abreviacao || '' 
      } : undefined,
      companhia: aluno.companhia ? {
        id: aluno.companhia.id,
        nome: aluno.companhia.nome,
        abreviacao: aluno.companhia.abreviacao || undefined
      } : undefined,
      historicoCargos: aluno.historicoCargos,
    }
  }));

  const companhiasFormatadas = companhias.map(companhia => ({
    ...companhia,
    abreviacao: companhia.abreviacao || '' 
  }));

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cargos e Promoções</h1>
          <p className="text-muted-foreground text-sm">Gerencie o efetivo de alunos</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome, número ou nome de guerra..." 
            defaultValue={search}
            className="pl-8"
            name="search"
          />
        </div>
        <Button variant="secondary" className="sm:w-auto">
          <Filter className="h-4 w-4 mr-2" /> Filtrar
        </Button>
      </div>

      <AdminAlunosTable 
        data={alunosData} 
        companhias={companhiasFormatadas}
        cargos={cargos}
      />
    </div>
  );
}