import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';

import { SearchAlunos } from '@/components/aluno/search-alunos';

export const metadata: Metadata = {
  title: 'Gerenciar Promoções',
  description: 'Área de análise e execução de promoções de alunos.',
};

export default async function AdminPromocoesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>; 
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || '';
  
  const [alunosForaDeData, alunosPorAntiguidade, historicoRecente] = await Promise.all([
    prisma.perfilAluno.findMany({
      where: { 
        foraDeData: true,
        usuario: { 
            status: 'ATIVO',
            nome: { contains: query } 
        }
      },
      include: {
        usuario: { select: { id: true, nome: true, fotoUrl: true } },
        cargo: { select: { nome: true, abreviacao: true, precedencia: true } },
        companhia: { select: { abreviacao: true } },
        historicoCargos: {
            orderBy: { dataInicio: 'desc' },
            take: 1,
            select: { dataInicio: true, conceitoAtual: true }
        }
      }
    }),

    prisma.perfilAluno.findMany({
      where: { 
        foraDeData: false,
        usuario: { 
            status: 'ATIVO',
            nome: { contains: query }
        },
        cargoId: { not: null }
      },
      orderBy: {
        historicoCargos: {
            _count: 'desc'
        }
      },
      take: 50, 
      include: {
        usuario: { select: { id: true, nome: true } },
        cargo: { select: { nome: true, abreviacao: true } },
        companhia: { select: { abreviacao: true } },
        historicoCargos: {
            orderBy: { dataInicio: 'desc' },
            take: 1,
            select: { dataInicio: true, conceitoAtual: true }
        }
      }
    }),

    prisma.cargoHistory.findMany({
      take: 20,
      orderBy: { dataInicio: 'desc' },
      include: {
        aluno: { include: { usuario: { select: { nome: true } } } },
        cargo: { select: { nome: true, abreviacao: true } }
      }
    })
  ]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Gerenciador de Promoções
          </h1>
          <p className="text-muted-foreground">
            Analise requisitos, tempo de interstício e execute as trocas de patente.
          </p>
        </div>
        <div className="flex items-center gap-2">
           
           <SearchAlunos />
           
        </div>
      </div>

      <Tabs defaultValue="prioridade" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="prioridade" className="relative">
            Prioridades
            {alunosForaDeData.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {alunosForaDeData.length}
                </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="geral">Quadro Geral</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="prioridade" className="mt-6">
            <Card className="border-amber-200 bg-amber-50/10 dark:border-amber-900">
                <CardHeader>
                    <CardTitle className="text-amber-600 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Aguardando Regularização
                    </CardTitle>
                    <CardDescription>
                        Alunos que já cumpriram o tempo mínimo de interstício no cargo atual.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {alunosForaDeData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                            <p>Nenhum aluno atrasado. O fluxo está em dia!</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Aluno</TableHead>
                                    <TableHead>Cargo Atual</TableHead>
                                    <TableHead>Comportamento</TableHead>
                                    <TableHead>Tempo no Cargo</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {alunosForaDeData.map((aluno) => {
                                    const ultimoCargo = aluno.historicoCargos[0];
                                    return (
                                        <TableRow key={aluno.id}>
                                            <TableCell>
                                                <div className="font-medium">{aluno.usuario.nome}</div>
                                                <div className="text-xs text-muted-foreground">{aluno.companhia?.abreviacao}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{aluno.cargo?.abreviacao}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`font-bold ${(ultimoCargo?.conceitoAtual || 0) < 7 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {ultimoCargo?.conceitoAtual?.toFixed(1) || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-amber-600 font-medium">
                                                {ultimoCargo?.dataInicio 
                                                    ? formatDistanceToNow(ultimoCargo.dataInicio, { locale: ptBR, addSuffix: false }) 
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/alunos/${aluno.usuario.id}?tab=cargos`}>
                                                        <Button size="sm">Promover Agora</Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="geral" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Antiguidade e Interstício</CardTitle>
                    <CardDescription>Lista geral de alunos para análise de tempo de serviço.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Aluno</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Data da Últ. Promoção</TableHead>
                                <TableHead>Tempo Decorrido</TableHead>
                                <TableHead className="text-right">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alunosPorAntiguidade.map((aluno) => {
                                const ultimoCargo = aluno.historicoCargos[0];
                                return (
                                    <TableRow key={aluno.id}>
                                        <TableCell>
                                            <span className="font-medium">{aluno.usuario.nome}</span>
                                        </TableCell>
                                        <TableCell>{aluno.cargo?.abreviacao}</TableCell>
                                        <TableCell>
                                            {ultimoCargo?.dataInicio 
                                                ? format(ultimoCargo.dataInicio, 'dd/MM/yyyy') 
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {ultimoCargo?.dataInicio 
                                                ? formatDistanceToNow(ultimoCargo.dataInicio, { locale: ptBR }) 
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/admin/alunos/${aluno.usuario.id}?tab=cargos`}>
                                                <Button variant="ghost" size="sm">Ver Perfil</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="historico" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Log de Movimentações</CardTitle>
                    <CardDescription>Últimas 20 alterações de patente realizadas no sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Aluno</TableHead>
                                <TableHead>Novo Cargo</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {historicoRecente.map((hist) => (
                                <TableRow key={hist.id}>
                                    <TableCell className="font-mono text-xs">
                                        {format(hist.dataInicio, "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell>{hist.aluno.usuario.nome}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{hist.cargo.abreviacao}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Promovido</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}