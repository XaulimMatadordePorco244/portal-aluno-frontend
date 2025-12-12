import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  User, 
  Star, 
  Users, 
  Briefcase, 
  Hash,
  Info,
  CalendarDays,
  History
} from 'lucide-react';
import CargoHistoryContainer from '@/components/cargos/CargoHistoryContainer';
import prisma from '@/lib/prisma';
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  const aluno = await prisma.perfilAluno.findUnique({
    where: { id },
    include: { usuario: true, cargo: true, companhia: true }
  });

  return {
    title: `Histórico de Cargos - ${aluno?.usuario.nome || 'Aluno'}`,
    description: `Gerencie o histórico de cargos de ${aluno?.usuario.nome || 'este aluno'}`,
  };
}

export default async function AdminAlunoCargosPage({ params }: PageProps) {
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

  const historicoCompleto = await prisma.cargoHistory.findMany({
    where: { alunoId: id },
    orderBy: { dataInicio: 'desc' },
    include: {
      logs: {
        include: {
          admin: {
            select: {
              nome: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    }
  });

  const totalTransicoes = historicoCompleto.length;
  const totalPromocoes = historicoCompleto.filter(h => 
    h.status !== 'REVERTIDO'
  ).length - 1; 
  const cargoAtual = historicoCompleto.find(h => h.status === 'ATIVO');

  function CustomBreadcrumb({ alunoNome }: { alunoNome: string }) {
    return (
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/alunos">Alunos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/admin/alunos/${id}`}>
              {alunoNome}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Cargos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

      <CustomBreadcrumb alunoNome={aluno.usuario.nome} />

 
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Informações do Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">{aluno.usuario.nome}</h3>
                  {aluno.nomeDeGuerra && (
                    <Badge variant="outline" className="mt-1">
                      &quot;{aluno.nomeDeGuerra}&quot;
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Número:</span>
                  <span>{aluno.numero || 'Não informado'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Companhia:</span>
                  <span>{aluno.companhia?.nome || 'Não atribuída'}</span>
                </div>
              </div>
            </div>


            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cargo Atual</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Cargo:</span>
                  <span className={!aluno.cargo ? "text-muted-foreground" : ""}>
                    {aluno.cargo?.nome || 'Não definido'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Conceito:</span>
                  <Badge variant="secondary" className="font-mono">
                    {aluno.conceitoAtual || '7.0'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium">Função:</span>
                  <span>{aluno.funcao?.nome || 'Não definida'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Estatísticas</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total de Transições:</span>
                  <Badge variant="outline">{totalTransicoes}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Promoções/Despromoções:</span>
                  <Badge 
                    variant={totalPromocoes > 0 ? "default" : "outline"}
                    className={totalPromocoes > 0 ? "bg-green-500" : ""}
                  >
                    {totalPromocoes}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Cargo desde:</span>
                  <span>
                    {cargoAtual?.dataInicio 
                      ? new Date(cargoAtual.dataInicio).toLocaleDateString('pt-BR')
                      : 'Data não disponível'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

 
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Atenção Administrador</AlertTitle>
        <AlertDescription className="text-blue-700">
          <div className="space-y-2">
            <p>Ao realizar uma transição de cargo:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>O conceito do aluno será <strong>redefinido para 7.0</strong></li>
              <li>Um novo bloco de histórico será criado</li>
              <li>As anotações permanecem vinculadas ao período anterior</li>
              <li>Todas as ações são <strong>auditáveis</strong> através dos logs</li>
              <li>É possível <strong>reverter</strong> a última transição se necessário</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

  
      <CargoHistoryContainer
        alunoId={id}
        cargos={cargos}
        alunoNome={aluno.usuario.nome}
      />

      {historicoCompleto.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Logs Detalhados de Auditoria</CardTitle>
              <Badge variant="outline" className="text-muted-foreground">
                Apenas visível para administradores
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {historicoCompleto.map((historico) => {
                           const ultimoLog = historico.logs[0];
                  
                  return (
                    <div key={historico.id} className="space-y-2">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <History className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              Período: {new Date(historico.dataInicio).toLocaleDateString('pt-BR')}
                              {historico.dataFim && (
                                <> até {new Date(historico.dataFim).toLocaleDateString('pt-BR')}</>
                              )}
                            </span>
                          </div>
                          <Badge 
                            variant={
                              historico.status === 'ATIVO' ? 'default' :
                              historico.status === 'FECHADO' ? 'secondary' : 'destructive'
                            }
                            className={
                              historico.status === 'ATIVO' ? 'bg-green-500' :
                              historico.status === 'FECHADO' ? '' : ''
                            }
                          >
                            {historico.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="pl-7 space-y-1 text-sm text-muted-foreground">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <span className="font-medium">Cargo:</span>{' '}
                            {historico.cargoNomeSnapshot}
                          </div>
                          <div>
                            <span className="font-medium">Conceito:</span>{' '}
                            {historico.conceitoAtual.toFixed(1)}
                          </div>
                          <div>
                            <span className="font-medium">Admin:</span>{' '}
                            {ultimoLog?.admin?.nome || 'Sistema'}
                          </div>
                          <div>
                            <span className="font-medium">Motivo:</span>{' '}
                            {historico.motivo || ultimoLog?.motivo || 'Não especificado'}
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}