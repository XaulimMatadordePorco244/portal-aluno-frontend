import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  PlusCircle, 
  Search, 
  MoreHorizontal, 
  Edit2, 
  Trash, 
  UserCheck, 
  Filter,
  Clock,
  History
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/Input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default async function AnotacoesDashboardPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; tipo?: string; responsavel?: string; sentido?: string };
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect("/dashboard");

  const q = searchParams.q || "";
  const sentido = searchParams.sentido || ""; 
  const page = Number(searchParams.page) || 1;
  const pageSize = 15;

  const whereCondition: any = {
    blocoCargo: {
      is: { status: 'ATIVO' }
    },
    AND: [
      q ? {
        OR: [
          { aluno: { nomeDeGuerra: { contains: q } } },
          { detalhes: { contains: q } }
        ]
      } : {},
      sentido === "pos" ? { pontos: { gt: 0 } } : {},
      sentido === "neg" ? { pontos: { lt: 0 } } : {},
    ]
  };

  const [anotacoes, totalCount] = await Promise.all([
    prisma.anotacao.findMany({
      where: whereCondition,
      include: {
        aluno: { include: { usuario: true } },
        tipo: true,
        autor: true,
        quemAnotou: {
          include: {
            perfilAluno: {
              include: { cargo: true }
            }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.anotacao.count({ where: whereCondition }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatarResponsavel = (anot: any) => {
    if (anot.quemAnotouNome) return anot.quemAnotouNome;
    const u = anot.quemAnotou || anot.autor;
    const cargo = u?.perfilAluno?.cargo?.abreviacao;
    const nomeGuerra = u?.perfilAluno?.nomeDeGuerra;
    
    if (cargo) {
      return `${cargo} GM ${nomeGuerra || u.nome}`;
    }
    return u?.nome || "Sistema";
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-medium tracking-tight text-foreground">Gestão de Anotações</h1>
            <p className="text-sm text-muted-foreground/80">
              {totalCount} registros encontrados.
            </p>
          </div>
          <Link href="/admin/anotacoes/new">
            <Button size="sm" className="gap-2 h-10 px-5">
              <PlusCircle className="h-4 w-4" /> Nova Anotação
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <form className="relative flex-1 max-w-md flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input 
                name="q"
                defaultValue={q}
                placeholder="Pesquisar aluno..." 
                className="pl-9 h-10 border-muted-foreground/20 bg-background focus-visible:ring-1" 
              />
            </div>
            <Button type="submit" variant="secondary" className="h-10">Buscar</Button>
          </form>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 border-muted-foreground/20">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Filtros Rápidos</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="?sentido=pos" className="w-full">Apenas Positivas</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="?sentido=neg" className="w-full">Apenas Negativas</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/anotacoes" className="w-full">Limpar Filtros</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border/40">
                <TableHead className="w-[70px] text-muted-foreground font-medium text-xs text-center uppercase">Nº</TableHead>
                <TableHead className="w-[180px] text-muted-foreground font-medium text-xs uppercase">Aluno</TableHead>
                <TableHead className="text-muted-foreground font-medium text-xs uppercase">Tipo de Anotação</TableHead>
                <TableHead className="w-[100px] text-center text-muted-foreground font-medium text-xs uppercase">Pontos</TableHead>
                <TableHead className="w-[220px] text-muted-foreground font-medium text-xs uppercase">Lançado por</TableHead>
                <TableHead className="w-[130px] text-muted-foreground font-medium text-xs uppercase">Lançado em</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anotacoes.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-muted/20 border-b border-border/40 transition-colors">
                  <TableCell className="text-center text-sm text-muted-foreground/70 font-mono">
                    {item.aluno?.numero || "—"}
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm font-medium text-foreground uppercase tracking-tight">
                      {item.aluno?.nomeDeGuerra}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger className="text-left cursor-default">
                        <span className="text-sm text-primary/90 font-medium hover:underline decoration-primary/30">
                          {item.tipo?.titulo}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="min-w-[280px] max-w-md p-4 bg-popover border-border/60 shadow-xl">
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1.5 border-b border-border/40 pb-2">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Descrição detalhada</span>
                            <p className="text-sm leading-relaxed text-foreground/90 font-normal wrap-break-word">
                              {item.detalhes || "Nenhuma descrição informada."}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 gap-2.5 text-[11px] pt-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground uppercase">Fato ocorrido em:</span>
                              <span className="text-foreground font-medium">{new Date(item.data).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <UserCheck className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-muted-foreground uppercase">Responsável pela anotação:</span>
                                <span className="text-foreground font-semibold leading-tight">
                                  {formatarResponsavel(item)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className={`text-sm font-semibold ${
                      item.pontos < 0 ? 'text-destructive/80' : 'text-green-600/80'
                    }`}>
                      {item.pontos > 0 ? `+${item.pontos}` : item.pontos}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground/80">
                    <span className="truncate block max-w-[200px]">{item.autor?.nome}</span>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground/90">
                    {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground/60 font-bold tracking-tighter">Ações de Admin</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/alunos/${item.aluno?.id}/anotacoes`} className="cursor-pointer flex items-center gap-2">
                            <History className="h-4 w-4 opacity-70" /> Histórico Completo
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/anotacoes/${item.id}/edit`} className="cursor-pointer flex items-center gap-2">
                            <Edit2 className="h-4 w-4 opacity-70" /> Editar Registro
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/5 focus:text-destructive cursor-pointer flex items-center gap-2 font-medium">
                          <Trash className="h-4 w-4" /> Excluir Registro
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="px-6 py-4 flex items-center justify-between border-t border-border/40 bg-muted/10">
              <span className="text-xs text-muted-foreground font-normal">
                Página {page} de {totalPages || 1}
              </span>
              <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium border-muted-foreground/20" disabled={page <= 1} asChild={page > 1}>
                    {page > 1 ? <Link href={`?page=${page - 1}&q=${q}&sentido=${sentido}`}>Anterior</Link> : <span>Anterior</span>}
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium border-muted-foreground/20" disabled={page >= totalPages} asChild={page < totalPages}>
                    {page < totalPages ? <Link href={`?page=${page + 1}&q=${q}&sentido=${sentido}`}>Próxima</Link> : <span>Próxima</span>}
                  </Button>
              </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}