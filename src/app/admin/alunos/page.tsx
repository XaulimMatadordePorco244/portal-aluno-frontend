import Link from "next/link";
import prisma from "@/lib/prisma";
import { Prisma, StatusUsuario } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, UserCheck, UserMinus, ShieldAlert, ArrowDownAZ, Hash, Medal } from "lucide-react";
import { AlunoActions } from "./aluno-actions";
import { Badge } from "@/components/ui/badge";
import { AlunoFiltros } from "./aluno-filtros";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function AdminAlunosPage(props: PageProps) {
  const searchParams = await props.searchParams;

  // Parâmetros da URL
  const sort = searchParams.sort || 'nome';
  const statusFilter = (searchParams.status as StatusUsuario | 'TODOS') || 'TODOS';
  const turmaFilter = searchParams.turmaId || 'todas';
  const anoFilter = searchParams.ano || 'todos';

  // 1. LÓGICA DE ORDENAÇÃO
  let orderByClause: Prisma.UsuarioOrderByWithRelationInput | Prisma.UsuarioOrderByWithRelationInput[] = { nome: 'asc' };
  if (sort === 'numero') orderByClause = { perfilAluno: { numero: 'asc' } };
  else if (sort === 'antiguidade') orderByClause = [
    { perfilAluno: { cargo: { precedencia: 'asc' } } },
    { perfilAluno: { dataUltimaPromocao: 'asc' } },
    { perfilAluno: { notaDesempatePromocao: 'desc' } },
    { dataNascimento: 'asc' }
  ];

  // 2. BUSCA DE DADOS PARA OS DROPDOWNS (Filtros)
  const turmas = await prisma.turma.findMany({ orderBy: { ano: 'desc' } });

  // Gera uma lista de anos desde 2015 até o ano atual para o filtro de "Ano Letivo"
  const anoAtual = new Date().getFullYear();
  const anosDisponiveis = Array.from({ length: anoAtual - 2015 + 1 }, (_, i) => anoAtual - i);

  // 3. LÓGICA DE FILTRAGEM (Where)
  // Se o usuário selecionou um ano específico, filtramos quem estava ativo naquele ano através do Histórico
// 3. LÓGICA DE FILTRAGEM (Where)
  let anoFilterClause: Prisma.UsuarioWhereInput = {};
  
  if (anoFilter !== 'todos') {
    const anoNum = parseInt(anoFilter);
    anoFilterClause = {
      OR: [
        // Regra 1: Tem histórico de cargo ativo no ano selecionado
        {
          perfilAluno: {
            historicoCargos: {
              some: {
                dataInicio: { lte: new Date(`${anoNum}-12-31T23:59:59.999Z`) },
                OR: [
                  { dataFim: { gte: new Date(`${anoNum}-01-01T00:00:00.000Z`) } },
                  { dataFim: null }
                ]
              }
            }
          }
        },
        // Regra 2: A Turma dele é exatamente do ano selecionado
        {
          perfilAluno: {
            turma: { ano: anoNum }
          }
        },
        // Regra 3: Ingressou antes do ano selecionado e AINDA ESTÁ ATIVO (nunca foi desligado)
        {
          status: 'ATIVO',
          perfilAluno: {
            turma: { ano: { lte: anoNum } }
          }
        }
      ]
    };
  }

  const whereClause: Prisma.UsuarioWhereInput = {
    role: 'ALUNO',
    status: statusFilter === 'TODOS' ? undefined : (statusFilter as StatusUsuario),
    perfilAluno: {
      ...(turmaFilter !== 'todas' ? { turmaId: turmaFilter } : {}),
    },
    ...anoFilterClause // <--- Aplicamos o filtro de ano na raiz da query
  };

  // 4. BUSCA DOS ALUNOS
  const alunos = await prisma.usuario.findMany({
    where: whereClause,
    include: {
      perfilAluno: {
        include: {
          cargo: true,
          turma: true,
        },
      },
    },
    orderBy: orderByClause,
  });

  // 5. ESTATÍSTICAS (Baseadas nos filtros aplicados)
 const baseStatsWhere: Prisma.UsuarioWhereInput = {
    role: 'ALUNO',
    perfilAluno: {
      ...(turmaFilter !== 'todas' ? { turmaId: turmaFilter } : {}),
    },
    ...anoFilterClause 
  };

  const totalAlunos = await prisma.usuario.count({ where: baseStatsWhere });
  const totalAtivos = await prisma.usuario.count({ where: { ...baseStatsWhere, status: 'ATIVO' } });
  const totalInativos = await prisma.usuario.count({ where: { ...baseStatsWhere, status: 'INATIVO' } });

  // Helpers para manter os outros parâmetros da URL ao clicar num botão
  const buildUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    Object.entries(newParams).forEach(([key, value]) => params.set(key, value));
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Alunos</h1>
          <p className="text-muted-foreground">Administre o efetivo, turmas e retenção.</p>
        </div>
        <Link href="/admin/alunos/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Cadastrar Aluno</Button>
        </Link>
      </div>

    {/* BARRA DE FILTROS (Dropdowns Automáticos) */}
      <AlunoFiltros turmas={turmas} anosDisponiveis={anosDisponiveis} />

      {/* CARDS DE ESTATÍSTICAS DINÂMICAS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listado</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlunos}</div>
            <p className="text-xs text-muted-foreground">Baseado nos filtros acima</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Efetivo Ativo</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalAtivos}</div>
            <p className="text-xs text-muted-foreground">Atualmente na instituição</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Desligados / Evasão</CardTitle>
            <UserMinus className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalInativos}</div>
            <p className="text-xs text-muted-foreground">
              {totalAlunos > 0 ? `${Math.round((totalInativos / totalAlunos) * 100)}% de evasão/saída` : '0%'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <CardTitle>Listagem do Efetivo</CardTitle>

            {/* BOTÕES DE ORDENAÇÃO (Restaurados!) */}
            <div className="flex gap-2 text-sm bg-muted/50 p-1 rounded-md">
              <Link href={buildUrl({ sort: 'nome' })}>
                <Button variant={sort === 'nome' ? 'default' : 'ghost'} size="sm" className="h-8">
                  <ArrowDownAZ className="mr-2 h-4 w-4" /> Nome
                </Button>
              </Link>
              <Link href={buildUrl({ sort: 'numero' })}>
                <Button variant={sort === 'numero' ? 'default' : 'ghost'} size="sm" className="h-8">
                  <Hash className="mr-2 h-4 w-4" /> Número
                </Button>
              </Link>
              <Link href={buildUrl({ sort: 'antiguidade' })}>
                <Button variant={sort === 'antiguidade' ? 'default' : 'ghost'} size="sm" className="h-8">
                  <Medal className="mr-2 h-4 w-4" /> Antiguidade
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Nº</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunos.map((aluno) => {
                  const isInativo = aluno.status === 'INATIVO';
                  return (
                    <TableRow key={aluno.id} className={isInativo ? 'opacity-60 bg-muted/30' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isInativo && (
                            <span title="Inativo/Desligado">
                              <ShieldAlert className="w-4 h-4 text-destructive" />
                            </span>
                          )}                          <Link href={`/admin/alunos/${aluno.perfilAluno?.id}`} className="hover:underline font-semibold text-primary">
                            {aluno.nome}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{aluno.perfilAluno?.turma?.nome || 'Sem Turma'}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">{aluno.perfilAluno?.numero || 'N/A'}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{aluno.cpf}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-xs font-semibold uppercase ring-1 ring-inset ring-secondary">
                          {aluno.perfilAluno?.cargo?.nome || 'Sem Cargo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlunoActions aluno={aluno} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {alunos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Nenhum aluno encontrado para os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}