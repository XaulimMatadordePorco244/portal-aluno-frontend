import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search, Filter, GraduationCap, AlertTriangle, 
  TrendingUp, TrendingDown, FileEdit 
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin - Monitoramento Escolar',
};

const NotaBadge = ({ nota }: { nota: number | null | undefined }) => {
  if (nota === null || nota === undefined) {
    return <span className="text-muted-foreground text-xs">-</span>;
  }
  

  const colorClass = nota < 6 
    ? "text-red-600 font-bold bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded" 
    : "text-blue-600 dark:text-blue-400 font-medium";

  return <span className={colorClass}>{nota.toFixed(1)}</span>;
};

export default async function NotasEscolaresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cia?: string; ano?: string }>;
}) {
  const user = await getCurrentUserWithRelations();
  if (!user || !canAccessAdminArea(user)) redirect('/dashboard');

  const params = await searchParams;
  const busca = params.q || '';
  const anoAtual = parseInt(params.ano || new Date().getFullYear().toString());

  const alunos = await prisma.perfilAluno.findMany({
    where: {
      usuario: {
        status: 'ATIVO',
        nome: { contains: busca }
      },
    },
    include: {
      usuario: true,
      companhia: true,
      desempenhosEscolares: {
        where: { anoLetivo: anoAtual }
      }
    },
    orderBy: { usuario: { nome: 'asc' } }
  });

  let totalComVermelha = 0;
  let totalAprovados = 0;
  let somaMedias = 0;
  let countMedias = 0;

  const dadosProcessados = alunos.map(aluno => {
    const boletim = aluno.desempenhosEscolares[0]; 
    
    if (boletim) {
      if (boletim.qtdNotasVermelhas > 0) totalComVermelha++;
      if (boletim.situacao === 'APROVADO') totalAprovados++;
      if (boletim.mediaFinal) {
        somaMedias += boletim.mediaFinal;
        countMedias++;
      }
    }

    return { 
      usuario: aluno.usuario, 
      companhia: aluno.companhia, 
      boletim, 
      id: aluno.id, 
      nomeDeGuerra: aluno.nomeDeGuerra 
    };
  });

  const mediaGeral = countMedias > 0 ? (somaMedias / countMedias).toFixed(1) : '-';

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Monitoramento Escolar</h1>
            <p className="text-muted-foreground">Acompanhamento de desempenho acadêmico - Ano {anoAtual}</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filtrar Cia
            </Button>
            <Button variant="default">
                <GraduationCap className="mr-2 h-4 w-4" /> Gerar Relatório PDF
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Média Geral da Tropa</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{mediaGeral}</div>
                <p className="text-xs text-muted-foreground">Baseado nas médias finais lançadas.</p>
            </CardContent>
         </Card>
         
         <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Alunos em Risco</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">{totalComVermelha}</div>
                <p className="text-xs text-muted-foreground">Com notas vermelhas no boletim.</p>
            </CardContent>
         </Card>

         <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Aprovados (Antecipado)</CardTitle>
                <GraduationCap className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalAprovados}</div>
            </CardContent>
         </Card>

         <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Boletins Ativos</CardTitle>
                <FileEdit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{countMedias} / {alunos.length}</div>
                <p className="text-xs text-muted-foreground">Cadastros atualizados este ano.</p>
            </CardContent>
         </Card>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative w-full md:w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome de guerra ou matrícula..." className="pl-8" />
        </div>
      </div>

      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[300px]">Aluno</TableHead>
              <TableHead>Cia / Pelotão</TableHead>
              <TableHead className="text-center w-20">1º Bim</TableHead>
              <TableHead className="text-center w-20">2º Bim</TableHead>
              <TableHead className="text-center w-20">3º Bim</TableHead>
              <TableHead className="text-center w-20">4º Bim</TableHead>
              <TableHead className="text-center w-24 bg-muted/30 font-bold">Média Final</TableHead>
              <TableHead className="text-center">Faltas</TableHead>
              <TableHead className="text-center">Situação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dadosProcessados.map(({ usuario, companhia, boletim, id, nomeDeGuerra }) => (
              <TableRow key={id} className="hover:bg-muted/5">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={usuario.fotoUrl || undefined} />
                      <AvatarFallback>{usuario.nome.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{nomeDeGuerra || usuario.nome}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">{usuario.nome}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                   <Badge variant="outline" className="text-xs font-normal">
                      {companhia?.abreviacao || '-'}
                   </Badge>
                </TableCell>
                
                <TableCell className="text-center border-l"><NotaBadge nota={boletim?.mediaB1} /></TableCell>
                <TableCell className="text-center border-l"><NotaBadge nota={boletim?.mediaB2} /></TableCell>
                <TableCell className="text-center border-l"><NotaBadge nota={boletim?.mediaB3} /></TableCell>
                <TableCell className="text-center border-l"><NotaBadge nota={boletim?.mediaB4} /></TableCell>
                
                <TableCell className="text-center border-l bg-muted/10 font-bold text-base">
                    <NotaBadge nota={boletim?.mediaFinal} />
                </TableCell>

                <TableCell className="text-center text-muted-foreground text-sm">
                    {boletim?.totalFaltas || 0}
                </TableCell>

                <TableCell className="text-center">
                    {boletim ? (
                        <Badge variant={
                            boletim.situacao === 'APROVADO' ? 'default' : 
                            boletim.situacao === 'REPROVADO' ? 'destructive' : 'secondary'
                        }>
                            {boletim.situacao}
                        </Badge>
                    ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                    )}
                </TableCell>

                <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/alunos/${id}/boletim`}>
                            <FileEdit className="h-4 w-4 text-primary" />
                        </Link>
                    </Button>
                </TableCell>
              </TableRow>
            ))}
            
            {dadosProcessados.length === 0 && (
                <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                        Nenhum aluno encontrado ou cadastrado este ano.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}