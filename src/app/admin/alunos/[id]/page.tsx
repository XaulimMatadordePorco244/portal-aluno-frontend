import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  ArrowLeft, Shield, User as UserIcon, Mail, 
   TrendingUp, MapPin, Phone, HeartPulse, 
  Users, Briefcase, FileText, 
  GraduationCap, Settings, AlertCircle
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface InfoRowProps {
  icon?: React.ElementType;
  label: string;
  value: React.ReactNode;
  className?: string;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const aluno = await prisma.perfilAluno.findUnique({
    where: { id },
    include: { usuario: true }
  });
  return { title: `Admin - ${aluno?.usuario.nome || 'Aluno'}` };
}

const InfoRow = ({ icon: Icon, label, value, className }: InfoRowProps) => (
  <div className={`flex flex-col space-y-1 ${className}`}>
    <span className="text-xs text-muted-foreground uppercase flex items-center gap-1.5 font-medium">
      {Icon && <Icon className="h-3 w-3" />} {label}
    </span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

const highlightWarName = (fullName: string, warName?: string) => {
    if (!warName) return <span className="font-semibold">{fullName}</span>;
    const regex = new RegExp(`(${warName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return (
      <span>
        {fullName.split(regex).map((part, i) => 
          part.toLowerCase() === warName.toLowerCase() 
            ? <strong key={i} className="font-bold text-foreground bg-yellow-500/10 px-1 rounded">{part}</strong> 
            : <span key={i} className="text-muted-foreground">{part}</span>
        )}
      </span>
    );
};

export default async function AdminAlunoPerfilPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUserWithRelations();
  
  if (!user || !canAccessAdminArea(user)) redirect('/dashboard');

  const aluno = await prisma.perfilAluno.findUnique({
    where: { id },
    include: {
      usuario: {
        include: {
          responsaveis: { include: { responsavel: true } }
        }
      },
      cargo: true,
      companhia: true,
      funcao: true,
    }
  });

  if (!aluno) notFound();

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const formatDoc = (value: string | null) => value || <span className="text-muted-foreground italic">Não informado</span>;
  const formatDate = (date: Date | null) => date ? new Date(date).toLocaleDateString('pt-BR') : '-';

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      
      {/* HEADER SUPERIOR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Link href="/admin/alunos" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar para Lista
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="gap-2 shadow-sm">
              <Settings className="h-4 w-4" /> Gerenciar Aluno
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Ações Administrativas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/alunos/${id}/promover`} className="cursor-pointer">
                <TrendingUp className="mr-2 h-4 w-4" /> Promover / Rebaixar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/alunos/${id}/boletim`} className="cursor-pointer">
                <GraduationCap className="mr-2 h-4 w-4" /> Boletim Escolar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/alunos/${id}/anotacoes/nova`} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" /> Criar Anotação
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* HERO CARD DE IDENTIDADE */}
      <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="h-28 w-28 border-4 border-background shadow-md">
          <AvatarImage src={aluno.usuario.fotoUrl || undefined} />
          <AvatarFallback className="text-3xl bg-muted text-muted-foreground">{getInitials(aluno.usuario.nome)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2 w-full">
          <div className="flex flex-wrap items-center gap-2">
            {aluno.cargo && <Badge className="uppercase font-bold tracking-wider">{aluno.cargo.nome}</Badge>}
            <Badge variant={aluno.usuario.status === 'ATIVO' ? 'outline' : 'destructive'} className="uppercase">
              {aluno.usuario.status}
            </Badge>
          </div>
          
          <h1 className="text-2xl md:text-3xl tracking-tight">
            {highlightWarName(aluno.usuario.nome, aluno.nomeDeGuerra || undefined)}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary/70" />
              <span className="truncate">{aluno.usuario.email || 'Sem e-mail'}</span>
            </div>
            {aluno.numero && (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary/70" />
                <span>Matrícula: <span className="font-mono text-foreground">{aluno.numero}</span></span>
              </div>
            )}
            <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary/70" />
                <span>{aluno.funcao?.nome || 'Sem Função'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SISTEMA DE ABAS */}
      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg overflow-x-auto flex-nowrap">
          <TabsTrigger value="geral" className="px-4 py-2">Visão Geral</TabsTrigger>
          <TabsTrigger value="pessoal" className="px-4 py-2">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="institucional" className="px-4 py-2">Institucional / Escolar</TabsTrigger>
          <TabsTrigger value="familia" className="px-4 py-2">Familiares ({aluno.usuario.responsaveis.length})</TabsTrigger>
        </TabsList>

        {/* ABA 1: VISÃO GERAL (Restaurada para o estilo original) */}
        <TabsContent value="geral" className="animate-in fade-in-50 space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resumo Militar */}
                <Card>
                    <CardHeader className="pb-3">
                         <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-base">Resumo Militar</CardTitle>
                         </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <InfoRow label="Companhia" value={aluno.companhia?.nome || '-'} />
                            <InfoRow label="Conceito" value={aluno.conceitoAtual || 'N/A'} />
                            <InfoRow label="Ano Ingresso" value={aluno.anoIngresso || '-'} />
                            <InfoRow label="Função" value={aluno.funcao?.nome || 'Nenhuma'} />
                        </div>
                    </CardContent>
                </Card>

                {/* Resumo Saúde */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <HeartPulse className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-base">Saúde e Aptidão</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex justify-between items-center border-b pb-3">
                            <span className="text-muted-foreground">Tipo Sanguíneo</span>
                            <Badge variant="outline" className="font-mono">
                                {aluno.tipagemSanguinea?.replace('_', ' ') || 'N/A'}
                            </Badge>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-2">Status Físico</span>
                            <div className="flex items-center gap-2">
                                {aluno.aptidaoFisicaStatus === 'VETADO' ? (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                )}
                                <span className="font-medium capitalize">
                                    {aluno.aptidaoFisicaStatus?.replace(/_/g, ' ') || 'Não avaliado'}
                                </span>
                            </div>
                            {aluno.aptidaoFisicaObs && (
                                <p className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                                    Obs: {aluno.aptidaoFisicaObs}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
             </div>
        </TabsContent>

        {/* ABA 2: DADOS PESSOAIS */}
        <TabsContent value="pessoal" className="animate-in fade-in-50">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2"><UserIcon className="h-5 w-5 text-primary"/> Dados Civis</CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoRow label="CPF" value={<span className="font-mono tracking-wider">{formatDoc(aluno.usuario.cpf)}</span>} />
                <InfoRow label="RG" value={<span className="font-mono tracking-wider">{formatDoc(aluno.usuario.rg)} <span className="text-muted-foreground text-xs">{aluno.usuario.rgEstadoEmissor}</span></span>} />
                <InfoRow label="Data Nasc." value={formatDate(aluno.usuario.dataNascimento)} />
                <InfoRow label="Gênero" value={aluno.usuario.genero || '-'} />
                <InfoRow label="Telefone" value={aluno.usuario.telefone || '-'} />
                <div className="col-span-1 md:col-span-3">
                    <InfoRow icon={MapPin} label="Endereço" value={aluno.endereco || 'Não informado'} />
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        {/* ABA 3: INSTITUCIONAL / ESCOLAR */}
        <TabsContent value="institucional" className="animate-in fade-in-50">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* INSTITUCIONAL */}
            <div className="md:col-span-5 space-y-6">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" /> Detalhes Institucionais
                    </CardTitle>
                    <CardDescription>Dados internos da Guarda Mirim.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <InfoRow label="Companhia" value={aluno.companhia?.nome || '-'} />
                        <InfoRow label="Ano Ingresso" value={aluno.anoIngresso} />
                        
                        <div className="col-span-2">
                           <Separator className="my-2"/>
                        </div>

                        <InfoRow label="Cargo Atual" value={
                            <Badge variant="outline" className="text-sm border-primary/30 bg-primary/5">
                                {aluno.cargo?.nome || 'Aluno'}
                            </Badge>
                        } />
                        <InfoRow label="Função" value={aluno.funcao?.nome || 'Sem função'} />
                        
                        <div className="col-span-2">
                           <Separator className="my-2"/>
                        </div>

                        <InfoRow label="Conceito Atual" value={
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">{aluno.conceitoAtual || 'N/A'}</span>
                            </div>
                        } />
                     </div>
                  </CardContent>
                </Card>
            </div>

            {/* ESCOLAR - DADOS REAIS */}
            <div className="md:col-span-7 space-y-6">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" /> Escolaridade & Cursos
                            </CardTitle>
                            <CardDescription>Dados cadastrados no perfil do aluno.</CardDescription>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Dados Reais do Banco (PerfilAluno) */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                        <InfoRow label="Escola Atual" value={aluno.escola || 'Não informada'} />
                        <InfoRow label="Série / Ano" value={aluno.serieEscolar || 'Não informado'} />
                    </div>

                    <Separator />

                    {/* Área reservada para Boletim (Placeholder) */}
                    <div className="py-4 text-center">
                        <div className="bg-muted/10 border border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                            <GraduationCap className="h-8 w-8 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground font-medium">Nenhum boletim registrado para este ano.</p>
                            <p className="text-xs text-muted-foreground">O acompanhamento de notas será exibido aqui quando disponível.</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Curso Externo (Real) */}
                    <div>
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Cursos Extras / Profissionalizantes</span>
                         </div>
                         {aluno.fazCursoExterno ? (
                             <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-100 dark:border-blue-900 text-sm">
                                <p className="font-medium text-blue-900 dark:text-blue-100">{aluno.cursoExternoDescricao}</p>
                             </div>
                         ) : (
                             <p className="text-sm text-muted-foreground italic">Nenhum curso externo registrado.</p>
                         )}
                    </div>

                  </CardContent>
                </Card>
            </div>
          </div>
        </TabsContent>

        {/* ABA 4: FAMILIARES */}
        <TabsContent value="familia" className="animate-in fade-in-50">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Responsáveis Vinculados
              </CardTitle>
              <CardDescription>Lista de responsáveis legais e contatos de emergência.</CardDescription>
            </CardHeader>
            <CardContent>
              {aluno.usuario.responsaveis.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {aluno.usuario.responsaveis.map((relacao) => (
                    <div key={relacao.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card hover:bg-muted/10 transition-colors shadow-sm">
                      <Avatar className="h-14 w-14 border-2 border-muted">
                        <AvatarImage src={relacao.responsavel.fotoUrl || undefined} />
                        <AvatarFallback>{getInitials(relacao.responsavel.nome)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm truncate">{relacao.responsavel.nome}</h4>
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold px-2 h-5">
                            {relacao.tipoParentesco || 'Responsável'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{relacao.responsavel.telefone || 'Sem telefone'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{relacao.responsavel.email || 'Sem e-mail'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col justify-center gap-2 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-3">
                         <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver Perfil do Responsável">
                            <UserIcon className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Nenhum responsável vinculado a este aluno.</p>
                  <Button variant="link" className="mt-2 text-primary">Adicionar Responsável (Em breve)</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}