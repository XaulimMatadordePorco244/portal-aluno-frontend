import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  BookOpen,
  Eye,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth';
import CargoList from '@/components/cargos/CargoList';
import CargoForm from '@/components/cargos/CargoForm';

export const metadata: Metadata = {
  title: 'Gerenciamento de Cargos',
  description: 'Gerencie os cargos disponíveis no sistema',
};

interface CargoData {
  id: string;
  nome: string;
  abreviacao: string;
  codigo?: number;
  categoria: 'FORMACAO' | 'QUADRO';
  tipo: 'POSTO' | 'GRADUACAO' | 'CURSO';
  precedencia: number;
  classe?: 'SUPERIOR' | 'INTERMEDIARIO' | 'SUBALTERNO';
  divisaUrl?: string;
  alunosCount: number;
  historicoCount: number;
  createdAt: Date;
}

export default async function ConfiguracaoCargosPage() {
  const user = await getCurrentUserWithRelations();
  
  if (!user || !canAccessAdminArea(user)) {
    redirect('/dashboard');
  }

  const cargos = await prisma.cargo.findMany({
    include: {
      _count: {
        select: {
          alunos: true,
          historicoCargos: true
        }
      }
    },
    orderBy: { precedencia: 'asc' }
  });

  const totalCargos = cargos.length;
  const cargosComAlunos = cargos.filter(c => c._count.alunos > 0).length;
  
  const statsPorTipo = cargos.reduce((acc, curr) => {
    acc[curr.tipo] = (acc[curr.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statsPorCategoria = cargos.reduce((acc, curr) => {
    acc[curr.categoria] = (acc[curr.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tableData: CargoData[] = cargos.map(cargo => ({
    id: cargo.id,
    nome: cargo.nome,
    abreviacao: cargo.abreviacao,
    codigo: cargo.codigo || undefined,
    categoria: cargo.categoria,
    tipo: cargo.tipo,
    precedencia: cargo.precedencia,
    classe: cargo.classe || undefined,
    divisaUrl: cargo.divisaUrl || undefined,
    alunosCount: cargo._count.alunos,
    historicoCount: cargo._count.historicoCargos,
    createdAt: new Date()
  }));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gerenciamento de Cargos
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure a hierarquia, precedência e divisas do sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/alunos/cargos">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Gerenciar Alunos
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Cargos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCargos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCargos > 0 ? Math.round((cargosComAlunos / totalCargos) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {cargosComAlunos} cargos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Postos (Oficiais)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsPorTipo['POSTO'] || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Graduações (Praças)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsPorTipo['GRADUACAO'] || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/40 border rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">Sobre a Precedência</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A precedência define a ordem hierárquica. O número <strong>1</strong> representa o cargo mais alto. 
            Números maiores indicam subordinação. Utilize a coluna de Ações para editar.
          </p>
        </div>
      </div>

      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista" className="gap-2">
            <Eye className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="adicionar" className="gap-2">
            <div className="flex items-center gap-2">
                Adicionar Novo
            </div>
          </TabsTrigger>
          <TabsTrigger value="estatisticas" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          <CargoList cargos={tableData} />
        </TabsContent>

        <TabsContent value="adicionar">
          <Card>
             <CardHeader>
               <CardTitle>Novo Cargo</CardTitle>
             </CardHeader>
             <CardContent>
                <CargoForm cargosExistentes={tableData} />
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estatisticas">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(statsPorTipo).map(([tipo, count]) => (
                    <div key={tipo} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <span className="font-medium text-sm capitalize">{tipo.toLowerCase()}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(statsPorCategoria).map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <span className="font-medium text-sm capitalize">{cat.toLowerCase()}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}