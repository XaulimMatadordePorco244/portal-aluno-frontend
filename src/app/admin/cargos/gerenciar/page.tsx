import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Award, 
  BookOpen,
  Eye,
  Filter,
  ArrowUpDown,
  Crown,
  GraduationCap,
  School,
  AlertCircle,
  Info,
  FileImage,
} from 'lucide-react';
import Link from 'next/link';
import  prisma  from '@/lib/prisma';
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth';
import CargoForm from '@/components/cargos/CargoForm';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Configuração de Cargos',
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

  const [totalCargos, cargosComAlunos, tiposDistribuicao, categoriasDistribuicao] = await Promise.all([
    prisma.cargo.count(),
    prisma.cargo.count({
      where: {
        alunos: {
          some: {}
        }
      }
    }),
    prisma.cargo.groupBy({
      by: ['tipo'],
      _count: {
        _all: true
      }
    }),
    prisma.cargo.groupBy({
      by: ['categoria'],
      _count: {
        _all: true
      }
    })
  ]);

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

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'FORMACAO': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'QUADRO': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case 'FORMACAO': return 'Formação';
      case 'QUADRO': return 'Quadro';
      default: return categoria;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'POSTO': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'GRADUACAO': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'CURSO': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'POSTO': return 'Posto';
      case 'GRADUACAO': return 'Graduação';
      case 'CURSO': return 'Curso';
      default: return tipo;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'POSTO': return <Crown className="h-4 w-4" />;
      case 'GRADUACAO': return <GraduationCap className="h-4 w-4" />;
      case 'CURSO': return <School className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getClasseColor = (classe?: string) => {
    switch (classe) {
      case 'SUPERIOR': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'INTERMEDIARIO': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'SUBALTERNO': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getClasseLabel = (classe?: string) => {
    switch (classe) {
      case 'SUPERIOR': return 'Superior';
      case 'INTERMEDIARIO': return 'Intermediário';
      case 'SUBALTERNO': return 'Subalterno';
      default: return classe;
    }
  };

  const getPrecedenciaColor = (precedencia: number) => {
    if (precedencia <= 10) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    if (precedencia <= 30) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="h-8 w-8 text-amber-500" />
            Configuração de Cargos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a hierarquia e configurações dos cargos disponíveis no sistema
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
            <p className="text-xs text-muted-foreground mt-1">
              Cargos cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cargos em Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cargosComAlunos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalCargos > 0 ? `${Math.round((cargosComAlunos / totalCargos) * 100)}% do total` : 'Sem uso'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Postos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {tiposDistribuicao.find(t => t.tipo === 'POSTO')?._count._all || 0}
              <Crown className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cargos de posto militar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Graduações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {tiposDistribuicao.find(t => t.tipo === 'GRADUACAO')?._count._all || 0}
              <GraduationCap className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cargos de graduação
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-amber-800 dark:text-amber-300 text-sm">
              Informação Importante
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 dark:text-amber-400 text-sm">
            A <strong>precedência</strong> define a hierarquia dos cargos. Valores mais baixos indicam cargos mais altos na hierarquia.
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-400">
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              <strong>Precedência 1</strong> = Cargo mais alto (ex: Comandante)
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              <strong>Precedência 100</strong> = Cargo mais baixo (ex: Recruta)
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              Não altere a precedência de cargos que já estão em uso sem necessidade
            </li>
          </ul>
        </CardContent>
      </Card>

      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista" className="gap-2">
            <Eye className="h-4 w-4" />
            Lista de Cargos
          </TabsTrigger>
          <TabsTrigger value="adicionar" className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Novo
          </TabsTrigger>
          <TabsTrigger value="estatisticas" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Lista de Cargos</CardTitle>
                  <CardDescription>
                    {tableData.length} cargos cadastrados no sistema
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cargo..."
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="postos">Postos</SelectItem>
                      <SelectItem value="graduacoes">Graduações</SelectItem>
                      <SelectItem value="cursos">Cursos</SelectItem>
                      <SelectItem value="formacao">Formação</SelectItem>
                      <SelectItem value="quadro">Quadro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">
                        <Button variant="ghost" className="p-0 h-auto font-semibold">
                          Cargo
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 h-auto font-semibold gap-1">
                          Hierarquia
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Tipo / Classe</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Divisa</TableHead>
                      <TableHead>Utilização</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum cargo cadastrado. Comece adicionando um novo cargo.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tableData.map((cargo) => (
                        <TableRow key={cargo.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{cargo.nome}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {cargo.abreviacao}
                                </Badge>
                                {cargo.codigo && (
                                  <span className="text-xs text-muted-foreground">
                                    Código: {cargo.codigo}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge className={getPrecedenciaColor(cargo.precedencia)}>
                                {cargo.precedencia}
                              </Badge>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                {getTipoIcon(cargo.tipo)}
                                <Badge className={getTipoColor(cargo.tipo)}>
                                  {getTipoLabel(cargo.tipo)}
                                </Badge>
                              </div>
                              {cargo.classe && (
                                <Badge className={getClasseColor(cargo.classe)} variant="outline">
                                  {getClasseLabel(cargo.classe)}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoriaColor(cargo.categoria)}>
                              {getCategoriaLabel(cargo.categoria)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {cargo.divisaUrl ? (
                              <div className="flex items-center gap-2">
                                <div className="relative w-10 h-10 rounded border overflow-hidden">
                                  <Image
                                    src={cargo.divisaUrl}
                                    alt={`Divisa ${cargo.nome}`}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                  />
                                </div>
                                <FileImage className="h-4 w-4 text-muted-foreground" />
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm flex items-center gap-2">
                                <FileImage className="h-4 w-4" />
                                Sem divisa
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span>{cargo.alunosCount} aluno(s)</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <BookOpen className="h-3 w-3" />
                                <span>{cargo.historicoCount} histórico(s)</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <CargoForm 
                                cargo={cargo}
                                cargosExistentes={tableData}
                                trigger={
                                  <Button variant="outline" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                }
                              />
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adicionar">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Cargo</CardTitle>
              <CardDescription>
                Preencha os dados para criar um novo cargo no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CargoForm 
                cargosExistentes={tableData}
              />
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
                  {tiposDistribuicao.map((tipo) => (
                    <div key={tipo.tipo} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getTipoColor(tipo.tipo).split(' ')[0]}`}>
                          {getTipoIcon(tipo.tipo)}
                        </div>
                        <div>
                          <span className="font-medium">{getTipoLabel(tipo.tipo)}</span>
                          <p className="text-sm text-muted-foreground">
                            {Math.round((tipo._count._all / totalCargos) * 100)}% do total
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-bold">{tipo._count._all}</span>
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
                  {categoriasDistribuicao.map((categoria) => (
                    <div key={categoria.categoria} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getCategoriaColor(categoria.categoria).split(' ')[0]}`}>
                          {categoria.categoria === 'FORMACAO' ? (
                            <School className="h-4 w-4" />
                          ) : (
                            <Award className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium">{getCategoriaLabel(categoria.categoria)}</span>
                          <p className="text-sm text-muted-foreground">
                            {Math.round((categoria._count._all / totalCargos) * 100)}% do total
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-bold">{categoria._count._all}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Cargos Mais Utilizados</CardTitle>
                <CardDescription>
                  Cargos com mais alunos atribuídos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...tableData]
                    .sort((a, b) => b.alunosCount - a.alunosCount)
                    .slice(0, 5)
                    .map((cargo) => (
                      <div key={cargo.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {cargo.divisaUrl ? (
                            <div className="relative w-10 h-10 rounded border overflow-hidden">
                              <Image
                                src={cargo.divisaUrl}
                                alt={`Divisa ${cargo.nome}`}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <span className="font-bold text-primary">{cargo.abreviacao.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium">{cargo.nome}</span>
                            <p className="text-sm text-muted-foreground">{cargo.abreviacao}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg">{cargo.alunosCount}</span>
                          <p className="text-sm text-muted-foreground">aluno(s)</p>
                        </div>
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