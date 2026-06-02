import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  PlusCircle,
  MoreHorizontal,
  Edit2,
  UserCheck,
  Filter,
  Clock,
  History,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Prisma, CargoHistoryStatus } from "@prisma/client";
import { DeleteAnotacaoButton } from "@/app/admin/anotacoes/delete-button";
import SearchAnotacoes from "./SearchAnotacoes";

type AnotacaoWithRelations = Prisma.AnotacaoGetPayload<{
  include: {
    aluno: {
      include: {
        usuario: true;
      };
    };
    tipo: true;
    autor: {
      include: {
        perfilAluno: {
          include: {
            cargo: true;
          };
        };
      };
    };
    quemAnotou: {
      include: {
        perfilAluno: {
          include: {
            cargo: true;
          };
        };
      };
    };
  };
}>;

type SearchParams = {
  page?: string;
  limit?: string; // NOVO: parâmetro para limite de itens
  q?: string;
  tipo?: string;
  responsavel?: string;
  sentido?: string;
};

type WhereCondition = {
  blocoCargo?: {
    status: CargoHistoryStatus;
  };
  AND?: Array<{
    aluno?: {
      usuario?: {
        nomeDeGuerra?: {
          contains: string;
        };
      };
    };
    pontos?: { gt?: number; lt?: number };
  }>;
};

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AnotacoesDashboardPage({
  searchParams,
}: PageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const params = await searchParams;
  const q = params.q || "";
  const sentido = params.sentido || "";
  const page = Number(params.page) || 1;
  
  // NOVO: Pega o limite da URL, garante que é válido ou usa 15 como padrão
  const limitParam = Number(params.limit);
  const opcoesDePagina = [10, 15, 25, 50];
  const pageSize = opcoesDePagina.includes(limitParam) ? limitParam : 15;

  const whereCondition: WhereCondition = {
    blocoCargo: {
      status: "ATIVO",
    },
    AND: [],
  };

  if (q) {
    whereCondition.AND?.push({
      aluno: {
        usuario: {
          nomeDeGuerra: {
            contains: q,
          },
        },
      },
    });
  }

  if (sentido === "pos") {
    whereCondition.AND?.push({
      pontos: { gt: 0 },
    });
  }

  if (sentido === "neg") {
    whereCondition.AND?.push({
      pontos: { lt: 0 },
    });
  }

  const [anotacoes, totalCount] = await Promise.all([
    prisma.anotacao.findMany({
      where: whereCondition as Prisma.AnotacaoWhereInput,
      include: {
        aluno: {
          include: {
            usuario: true,
          },
        },
        tipo: true,
        autor: {
          include: {
            perfilAluno: {
              include: {
                cargo: true,
              },
            },
          },
        },
        quemAnotou: {
          include: {
            perfilAluno: {
              include: {
                cargo: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize, // Usa o limite escolhido pelo usuário
    }),
    prisma.anotacao.count({
      where: whereCondition as Prisma.AnotacaoWhereInput,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatarResponsavel = (anot: AnotacaoWithRelations) => {
    if (anot.quemAnotouNome) return anot.quemAnotouNome;
    const u = anot.quemAnotou || anot.autor;
    const cargo = u?.perfilAluno?.cargo?.abreviacao;
    const nomeGuerra = u?.nomeDeGuerra;

    if (cargo && nomeGuerra) {
      return `${cargo} GM ${nomeGuerra}`;
    }
    if (cargo && u?.nome) {
      return `${cargo} ${u.nome}`;
    }
    return u?.nome || "Sistema";
  };

  // ATUALIZADO: Construtores de URL agora suportam o limit
  const buildPageUrl = (newPage: number, newLimit: number = pageSize) => {
    const urlParams = new URLSearchParams();
    urlParams.set("page", newPage.toString());
    urlParams.set("limit", newLimit.toString());
    if (q) urlParams.set("q", q);
    if (sentido) urlParams.set("sentido", sentido);
    return `/admin/anotacoes?${urlParams.toString()}`;
  };

  const buildFilterUrl = (newSentido?: string) => {
    const urlParams = new URLSearchParams();
    if (q) urlParams.set("q", q); 
    if (newSentido) urlParams.set("sentido", newSentido);
    urlParams.set("limit", pageSize.toString()); // Preserva o limite ao filtrar
    return `/admin/anotacoes?${urlParams.toString()}`;
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-medium tracking-tight text-foreground">
              Gestão de Anotações
            </h1>
            <p className="text-sm text-muted-foreground/80">
              {totalCount} registros encontrados.
            </p>
          </div>
          <Link href="/admin/anotacoes/new">
            <Button size="sm" className="gap-2 h-10 px-5 cursor-pointer ">
              <PlusCircle className="h-4 w-4" /> Nova Anotação
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <SearchAnotacoes defaultValue={q} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-muted-foreground/20 cursor-pointer"
              >
                <Filter className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Filtros Rápidos
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={buildFilterUrl("pos")} className="w-full cursor-pointer">
                  Apenas Positivas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={buildFilterUrl("neg")} className="w-full cursor-pointer">
                  Apenas Negativas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/anotacoes" className="w-full cursor-pointer">
                  Limpar Filtros
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border/40">
                <TableHead className="w-[70px] text-muted-foreground font-medium text-xs text-center uppercase">
                  Nº
                </TableHead>
                <TableHead className="w-[180px] text-muted-foreground font-medium text-xs uppercase">
                  Aluno
                </TableHead>
                <TableHead className="text-muted-foreground font-medium text-xs uppercase">
                  Tipo de Anotação
                </TableHead>
                <TableHead className="w-[100px] text-center text-muted-foreground font-medium text-xs uppercase">
                  Pontos
                </TableHead>
                <TableHead className="w-[220px] text-muted-foreground font-medium text-xs uppercase">
                  Lançado por
                </TableHead>
                <TableHead className="w-[130px] text-muted-foreground font-medium text-xs uppercase">
                  Lançado em
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anotacoes.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-muted/20 border-b border-border/40 transition-colors"
                >
                  <TableCell className="text-center text-sm text-muted-foreground/70 font-mono">
                    {item.aluno?.numero || "—"}
                  </TableCell>

                  <TableCell>
                    <span className="text-sm font-medium text-foreground uppercase tracking-tight">
                      {item.aluno?.usuario.nomeDeGuerra}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger className="text-left cursor-default">
                        <span className="text-sm text-primary/90 font-medium hover:underline decoration-primary/30">
                          {item.tipo?.titulo}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="min-w-[280px] max-w-md p-4 bg-popover border-border/60 shadow-xl"
                      >
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1.5 border-b border-border/40 pb-2">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">
                              Descrição detalhada
                            </span>
                            <p className="text-sm leading-relaxed text-foreground/90 font-normal wrap-break-word">
                              {item.detalhes ||
                                "Nenhuma descrição informada."}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 gap-2.5 text-[11px] pt-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground uppercase">
                                Fato ocorrido em:
                              </span>
                              <span className="text-foreground font-medium">
                                {new Date(item.data).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <UserCheck className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-muted-foreground uppercase">
                                  Responsável pela anotação:
                                </span>
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
                    <span
                      className={`text-sm font-semibold ${
                        item.pontos < 0
                          ? "text-destructive/80"
                          : "text-green-600/80"
                      }`}
                    >
                      {item.pontos > 0 ? `+${item.pontos}` : item.pontos}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground/80">
                    <span className="truncate block max-w-[200px]">
                      {item.autor?.nome}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground/90">
                    {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground/60 font-bold tracking-tighter">
                          Ações de Admin
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/alunos/${item.aluno?.id}/anotacoes`}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <History className="h-4 w-4 opacity-70" />{" "}
                            Histórico Completo
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/anotacoes/${item.id}/edit`}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4 opacity-70" /> Editar
                            Registro
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DeleteAnotacaoButton id={item.id} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* RODAPÉ E PAGINAÇÃO */}
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 bg-muted/10">
            
            {/* SELETOR E TEXTO DE PÁGINA */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-normal">
              <span>
                Página {page} de {totalPages || 1}
              </span>

              <div className="h-4 w-px bg-border"></div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs font-medium border-muted-foreground/20 cursor-pointer text-muted-foreground"
                  >
                    {pageSize} por página
                    <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-32">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Listar por página</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {opcoesDePagina.map(size => (
                    <DropdownMenuItem key={size} asChild>
                      {/* Ao trocar o limit, a gente sempre reseta a página para 1 */}
                      <Link href={buildPageUrl(1, size)} className="cursor-pointer flex justify-between">
                        <span>{size} itens</span>
                        {pageSize === size && <UserCheck className="h-3 w-3 text-primary" />}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* BOTÕES ANTERIOR E PRÓXIMA */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-medium border-muted-foreground/20 cursor-pointer"
                disabled={page <= 1}
                asChild={page > 1}
              >
                {page > 1 ? (
                  <Link href={buildPageUrl(page - 1)}>Anterior</Link>
                ) : (
                  <span>Anterior</span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-medium border-muted-foreground/20 cursor-pointer"
                disabled={page >= totalPages}
                asChild={page < totalPages}
              >
                {page < totalPages ? (
                  <Link href={buildPageUrl(page + 1)}>Próxima</Link>
                ) : (
                  <span>Próxima</span>
                )}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </TooltipProvider>
  );
}