import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import NovaTransicaoForm from '@/components/admin/promocoes/NovaTransicaoForm';
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

export const metadata: Metadata = {
  title: 'Nova Transição em Massa',
  description: 'Promover ou despromover alunos em lote.',
};

export default async function NovaPromocaoPage() {
  const user = await getCurrentUserWithRelations();

  if (!user || !canAccessAdminArea(user)) {
    redirect('/dashboard');
  }

  // 1. Buscar dados do banco (Raw Data)
  const alunosDb = await prisma.perfilAluno.findMany({
    where: {
      usuario: {
        status: 'ATIVO',
        role: 'ALUNO'
      }
    },
    select: {
      id: true,
      nomeDeGuerra: true, // Adicionado para o destaque em negrito
      conceitoAtual: true, // Adicionado para o modal de confirmação
      usuario: {
        select: { nome: true }
      },
      cargo: {
        select: {
          id: true,
          nome: true,
          abreviacao: true,
          precedencia: true,
          tipo: true // <--- CORREÇÃO: Adicionado o campo 'tipo' aqui
        }
      }
    },
    orderBy: {
      usuario: { nome: 'asc' }
    }
  });

  const cargosDb = await prisma.cargo.findMany({
    orderBy: { precedencia: 'asc' },
    select: {
      id: true,
      nome: true,
      precedencia: true,
      tipo: true
    }
  });

  // 2. Transformação de Dados (Adapter Pattern)
  const alunos = alunosDb.map(aluno => ({
    id: aluno.id,
    usuario: { nome: aluno.usuario.nome },
    nomeDeGuerra: aluno.nomeDeGuerra,
    conceitoAtual: aluno.conceitoAtual,
    
    // Se cargo existir, mapeamos incluindo o TIPO convertido para string
    cargo: aluno.cargo ? {
      id: aluno.cargo.id,
      nome: aluno.cargo.nome,
      abreviacao: aluno.cargo.abreviacao ?? '', 
      precedencia: aluno.cargo.precedencia,
      tipo: aluno.cargo.tipo.toString() // <--- Conversão do Enum para String
    } : undefined 
  }));

  const cargos = cargosDb.map(cargo => ({
    ...cargo,
    tipo: cargo.tipo.toString() 
  }));

  return (
    <div className="container mx-auto py-8 space-y-6">

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nova Transição em Massa</h1>
        <p className="text-muted-foreground">
          Selecione o tipo de movimentação e os alunos envolvidos. 
          O sistema calculará automaticamente o próximo posto ou graduação de carreira.
        </p>
      </div>

      <div className="max-w-4xl">
        <NovaTransicaoForm 
          alunos={alunos} 
          cargos={cargos} 
        />
      </div>
    </div>
  );
}