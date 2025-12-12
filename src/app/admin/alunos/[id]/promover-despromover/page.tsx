import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/scroll-area';
import PromocaoDespromocaoForm from '@/components/cargos/PromocaoDespromocaoForm';
import prisma from '@/lib/prisma';
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth';
import { 
  User, 
  Star, 
  Users, 
  Hash, 
  ArrowUp, 
  ArrowDown, 
  History, 
  Info, 
  Award, 
  CalendarDays,
  CheckCircle,
  XCircle,
  Briefcase,
  Tag as TagIcon
} from 'lucide-react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  const aluno = await prisma.perfilAluno.findUnique({
    where: { id },
    include: { usuario: true, cargo: true }
  });

  return {
    title: `Promover/Despromover - ${aluno?.usuario.nome || 'Aluno'}`,
    description: `Realize promoções ou despromoções de cargo para ${aluno?.usuario.nome || 'este aluno'}`,
  };
}

export default async function PromoverAlunoPage({ params }: PageProps) {
  const { id } = await params;
  
  const user = await getCurrentUserWithRelations();
  

  if (!user || !canAccessAdminArea(user)) {
    redirect('/dashboard');
  }

  const aluno = await prisma.perfilAluno.findUnique({
    where: { id },
    include: {
      usuario: true,
      cargo: true,
      funcao: true,
      companhia: true,
      historicoCargos: {
        where: { status: 'ATIVO' },
        take: 1
      }
    }
  });

  if (!aluno) {
    notFound();
  }

  const cargos = await prisma.cargo.findMany({
    orderBy: { precedencia: 'asc' }
  });


  const historicoRecente = await prisma.cargoHistory.findMany({
    where: { alunoId: id },
    orderBy: { dataInicio: 'desc' },
    take: 3,
    include: {
      cargo: true,
      logs: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { nome: true }
          }
        }
      }
    }
  });


  const totalTransicoes = await prisma.cargoHistory.count({
    where: { alunoId: id, status: { not: 'REVERTIDO' } }
  });

  const cargoAtual = aluno.cargo;
  const ultimaTransicao = historicoRecente[0];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="bg-green-100 p-2 rounded-lg">
                <ArrowUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="bg-red-100 p-2 rounded-lg">
                <ArrowDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Promover/Despromover Aluno
              </h1>
              <p className="text-muted-foreground">
                Gerencie a evolução de carreira de {aluno.usuario.nome}
              </p>
            </div>
          </div>
        </div>
        
        <Button variant="outline" asChild>
          <Link href={`/admin/alunos/${id}/cargos`} className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Ver Histórico
            <Badge variant="secondary" className="ml-2">
              {totalTransicoes}
            </Badge>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Informações do Aluno</CardTitle>
                    <CardDescription>
                      Dados completos do aluno para referência
                    </CardDescription>
                  </div>
                </div>
                {aluno.nomeDeGuerra && (
                  <Badge variant="outline" className="gap-1">
                    <TagIcon className="h-3 w-3" />
                    &quot;{aluno.nomeDeGuerra}&quot;
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <p className="font-medium text-lg">{aluno.usuario.nome}</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Número</Label>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="font-mono">
                      {aluno.numero || 'N/I'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Companhia</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{aluno.companhia?.nome || 'Não atribuída'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Cargo Atual</Label>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{cargoAtual?.nome || 'Não definido'}</span>
                    {cargoAtual?.abreviacao && (
                      <Badge variant="secondary">{cargoAtual.abreviacao}</Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Conceito Atual</Label>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <Badge 
                      variant="outline" 
                      className={`
                        font-mono text-base px-3 py-1
                        ${parseFloat(aluno.conceitoAtual || '7.0') >= 7.0 
                          ? 'border-green-200 bg-green-50 text-green-700' 
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                        }
                      `}
                    >
                      {aluno.conceitoAtual || '7.0'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Função</Label>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{aluno.funcao?.nome || 'Não definida'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <PromocaoDespromocaoForm
            aluno={{
              id: aluno.id,
              usuario: { nome: aluno.usuario.nome },
              cargo: cargoAtual ? {
                id: cargoAtual.id,
                nome: cargoAtual.nome,
                precedencia: cargoAtual.precedencia
              } : undefined,
              conceitoAtual: aluno.conceitoAtual || '7.0'
            }}
            cargos={cargos}
            adminId={user.id}
            adminNome={user.nome}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Informações Importantes</CardTitle>
                  <CardDescription>
                    Aspectos a considerar antes da transição
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTitle className="text-amber-800 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Conceito Resetado
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                  Ao realizar uma transição, o conceito do aluno será automaticamente redefinido para 7.0.
                </AlertDescription>
              </Alert>
              
              <Alert className="bg-blue-50 border-blue-200">
                <AlertTitle className="text-blue-800 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Auditoria
                </AlertTitle>
                <AlertDescription className="text-blue-700">
                  Todas as ações são registradas em logs com data, hora, responsável e motivo.
                </AlertDescription>
              </Alert>
              
              <Alert className="bg-blue-50 border-blue-200">
                <AlertTitle className="text-blue-800 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Anotações
                </AlertTitle>
                <AlertDescription className="text-blue-700">
                  As anotações permanecem vinculadas ao período em que foram feitas e não são transferidas.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <History className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Histórico Recente</CardTitle>
                    <CardDescription>Últimas transições do aluno</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">{historicoRecente.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {historicoRecente.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Sem histórico</AlertTitle>
                  <AlertDescription>
                    Este aluno ainda não possui transições registradas.
                  </AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {historicoRecente.map((item, index) => (
                      <div key={item.id}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.cargo?.nome || item.cargoNomeSnapshot}</span>
                              <Badge 
                                variant={
                                  item.status === 'ATIVO' ? 'default' :
                                  item.status === 'FECHADO' ? 'secondary' : 'destructive'
                                }
                                className={
                                  item.status === 'ATIVO' ? 'bg-green-500' : ''
                                }
                              >
                                {item.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            <span>
                              {new Date(item.dataInicio).toLocaleDateString('pt-BR')}
                              {item.dataFim && (
                                <> → {new Date(item.dataFim).toLocaleDateString('pt-BR')}</>
                              )}
                            </span>
                          </div>
                          
                          {item.motivo && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              <Info className="h-3 w-3 inline mr-1" />
                              {item.motivo}
                            </p>
                          )}
                          
                          {item.logs[0] && (
                            <p className="text-xs text-muted-foreground">
                              Por: {item.logs[0].admin.nome}
                            </p>
                          )}
                        </div>
                        {index < historicoRecente.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              
              {historicoRecente.length > 0 && (
                <div className="mt-4 text-center">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/alunos/${id}/cargos`} className="flex items-center gap-1">
                      Ver histórico completo
                      <History className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{totalTransicoes}</span>
                      </div>
                      <div className="absolute -top-2 -right-2">
                        <History className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium">Transições</p>
                  <p className="text-xs text-muted-foreground">Total realizadas</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      {cargoAtual ? (
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                          <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-medium">Cargo Atual</p>
                  <p className="text-xs text-muted-foreground">
                    {cargoAtual ? 'Definido' : 'Não definido'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-medium text-muted-foreground">{children}</p>
  );
}