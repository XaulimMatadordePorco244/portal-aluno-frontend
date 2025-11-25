import { Metadata } from "next"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Download, FileText, Calendar } from "lucide-react"

import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CIFilters } from "./filters"

export const metadata: Metadata = {
  title: "Comunicações Internas",
  description: "Mural de Comunicações Internas da Instituição",
}


interface WhereCondition {
  assunto?: string;
  dataPublicacao?: {
    gte: Date;
    lte: Date;
  };
}

export default async function ComunicacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  const filterAssunto = typeof params.assunto === "string" ? params.assunto : undefined
  const filterData = typeof params.data === "string" ? params.data : undefined


  const whereCondition: WhereCondition = {}

  if (filterAssunto) {
    whereCondition.assunto = filterAssunto
  }

  if (filterData) {
    const [year, month] = filterData.split("-")
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

    whereCondition.dataPublicacao = {
      gte: startDate,
      lte: endDate,
    }
  }

  const [comunicacoes, assuntosRaw] = await Promise.all([
    prisma.comunicacaoInterna.findMany({
      where: whereCondition,
      orderBy: {
        numeroSequencial: "desc",
      },
      include: {
        autor: { select: { nome: true } },
      }
    }),
    prisma.comunicacaoInterna.findMany({
      distinct: ["assunto"],
      select: { assunto: true },
      orderBy: { assunto: "asc" },
    }),
  ])

  const assuntosDisponiveis = assuntosRaw.map((i) => i.assunto)

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Comunicações Internas</h1>
          <p className="text-muted-foreground">
            Acesse todos os comunicados internos da instituição.
          </p>
        </div>
      </div>

      <CIFilters assuntosDisponiveis={assuntosDisponiveis} />

      {comunicacoes.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Nenhuma C.I. encontrada</h3>
          <p className="text-muted-foreground">Tente ajustar os filtros de busca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comunicacoes.map((ci) => (
            <Card key={ci.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <Badge variant="outline" className="mb-2">
                    {ci.assunto}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    Nº {String(ci.numeroSequencial).padStart(3, '0')}/{ci.anoReferencia}
                  </span>
                </div>
                <CardTitle className="text-xl line-clamp-2 leading-tight">
                  {ci.titulo}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  {format(ci.dataPublicacao, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex grow">
                {ci.resumo ? (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {ci.resumo}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Sem descrição disponível.
                  </p>
                )}
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button className="w-full" variant="outline" asChild>
                  <a href={ci.arquivoUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar PDF
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}