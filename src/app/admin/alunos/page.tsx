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
import { AlunoFiltros } from "./aluno-filtros";
import { FotoHover } from "@/components/ui/foto-hover";
import { NomeFormatado } from '@/components/ui/nome-formatado'

// Importe o novo componente criado
import { FiltroCargo } from "./filtro-cargo"; 

type PageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function AdminAlunosPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const sort = searchParams.sort || 'nome';
  
  const statusFilter = searchParams.status ? (searchParams.status as StatusUsuario | 'TODOS') : 'ATIVO';
  const turmaFilter = searchParams.turmaId || 'todas';
  const anoFilter = searchParams.ano || 'todos';
  const cargoFilter = searchParams.cargoId || 'todos'; 

  let orderByClause: Prisma.UsuarioOrderByWithRelationInput | Prisma.UsuarioOrderByWithRelationInput[] = { nome: 'asc' };
  if (sort === 'numero') orderByClause = { perfilAluno: { numero: 'asc' } };
  else if (sort === 'antiguidade') orderByClause = [
    { perfilAluno: { cargo: { precedencia: 'asc' } } },
    { perfilAluno: { dataUltimaPromocao: 'asc' } },
    { perfilAluno: { notaDesempatePromocao: 'desc' } },
    { dataNascimento: 'asc' }
  ];

  const [turmas, cargos] = await Promise.all([
    prisma.turma.findMany({ orderBy: { ano: 'desc' } }),
    prisma.cargo.findMany({ orderBy: { precedencia: 'asc' } })
  ]);

  const anoAtual = new Date().getFullYear();
  const anosDisponiveis = Array.from({ length: anoAtual - 2015 + 1 }, (_, i) => anoAtual - i);

  let anoFilterClause: Prisma.UsuarioWhereInput = {};

  if (anoFilter !== 'todos') {
    const anoNum = parseInt(anoFilter);
    anoFilterClause = {
      OR: [
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
        {
          perfilAluno: {
            turma: { ano: anoNum }
          }
        },
        {
          status: 'ATIVO',
          perfilAluno: {
            turma: { ano: { lte: anoNum } }
          }
        }
      ]
    };
  }

   const perfilAlunoWhere: Prisma.PerfilAlunoWhereInput = {};
  if (turmaFilter !== 'todas') perfilAlunoWhere.turmaId = turmaFilter;
  if (cargoFilter !== 'todos') perfilAlunoWhere.cargoId = cargoFilter;

  const perfilAlunoClause = Object.keys(perfilAlunoWhere).length > 0 ? perfilAlunoWhere : { isNot: null };

  const baseStatsWhere: Prisma.UsuarioWhereInput = {
    perfilAluno: perfilAlunoClause,
    ...anoFilterClause
  };

  const whereClause: Prisma.UsuarioWhereInput = {
    status: statusFilter === 'TODOS' ? undefined : (statusFilter as StatusUsuario),
    ...baseStatsWhere
  };

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

  const totalAlunos = await prisma.usuario.count({ where: baseStatsWhere });
  const totalAtivos = await prisma.usuario.count({ where: { ...baseStatsWhere, status: 'ATIVO' } });
  const totalInativos = await prisma.usuario.count({ where: { ...baseStatsWhere, status: 'INATIVO' } });

  const buildUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    Object.entries(newParams).forEach(([key, value]) => params.set(key, value));
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Alunos</h1>
          <p className="text-muted-foreground">Administre o efetivo, turmas e retenção.</p>
        </div>
        <Link href="/admin/alunos/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Cadastrar Aluno</Button>
        </Link>
      </div>

      <AlunoFiltros turmas={turmas} anosDisponiveis={anosDisponiveis} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listado</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alunos.length}</div>
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

            <div className="flex flex-wrap gap-2 text-sm bg-muted/50 p-1 rounded-md items-center">
              <FiltroCargo cargos={cargos} cargoAtual={cargoFilter} />
              
              <div className="w-px h-6 bg-border mx-1"></div> 

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
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead className="w-16 text-center">Foto</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Nº</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunos.map((aluno, index) => {
                  const isInativo = aluno.status === 'INATIVO';
                  return (
                    <TableRow key={aluno.id} className={isInativo ? 'opacity-60 bg-muted/30' : ''}>
                      <TableCell className="text-center text-xs text-muted-foreground font-medium">
                        {index + 1}
                      </TableCell>

                      <TableCell className="text-center align-middle">
                        <FotoHover
                          src={aluno.fotoUrl}
                          alt={aluno.nome}
                        />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isInativo && (
                            <span title="Inativo/Desligado">
                              <ShieldAlert className="w-4 h-4 text-destructive" />
                            </span>
                          )}
                          <Link
                            href={`/admin/alunos/${aluno.perfilAluno?.id}`}
                            className="hover:underline"
                          >
                            <NomeFormatado
                              nomeCompleto={aluno.nome}
                              nomeDeGuerra={aluno.nomeDeGuerra}
                            />
                          </Link>
                        </div>
                      </TableCell>
                    
                      <TableCell className="font-mono">{aluno.perfilAluno?.turma?.nome || 'Sem Turma'}</TableCell>
                      <TableCell className="font-mono">{aluno.perfilAluno?.numero || 'N/A'}</TableCell>
                      <TableCell className="font-mono">{aluno.cpf}</TableCell>
                      <TableCell className="font-mono">{aluno.perfilAluno?.cargo?.nome || 'Sem Cargo'}</TableCell>
                   
                      
                      <TableCell className="text-right">
                        <AlunoActions aluno={aluno} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {alunos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
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