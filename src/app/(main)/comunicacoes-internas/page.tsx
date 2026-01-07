import { Metadata } from "next"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Download, FileText, Calendar, User} from "lucide-react"

import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { CIFilters } from "./filters"
import { Separator } from "@/components/ui/separator"

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

  if (filterData && /^\d{4}-\d{2}$/.test(filterData)) {
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
      orderBy: { numeroSequencial: "desc" },
      include: { autor: { select: { nome: true } } }
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
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-lg bg-muted/10">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Nenhuma C.I. encontrada</h3>
          <p className="text-sm text-muted-foreground">
            Não há registros para os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comunicacoes.map((ci) => (
            <Card key={ci.id} className="flex flex-col h-full hover:shadow-lg transition-all duration-200 border-muted overflow-hidden">
              <CardHeader className="pb-3 space-y-3">

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(ci.dataPublicacao, "d 'de' MMMM, yyyy", { locale: ptBR })}
                  </span>

                  <span className="font-mono font-medium bg-muted/50 border px-2 py-1 rounded flex items-center gap-1">
                   <span> C.I Nº </span>
                    {String(ci.numeroSequencial).padStart(3, '0')}/{ci.anoReferencia}
                  </span>
                </div>


                <div className="text-sm text-muted-foreground leading-relaxed wrap-break-word">
                  <span className="font-semibold text-foreground/80 mr-1">Assunto:</span>
                  {ci.assunto}
                </div>

                <CardTitle className="text-lg leading-snug wrap-break-word hyphens-auto text-primary">
                  {ci.titulo}
                </CardTitle>

              </CardHeader>

              <CardContent className="grow">
                {ci.resumo ? (
                  <p className="text-sm text-muted-foreground line-clamp-3 wrap-break-word">
                    {ci.resumo}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/50 italic">
                    Sem descrição disponível.
                  </p>
                )}
              </CardContent>

              <div className="px-6 pb-2">
                {ci.autor && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <User className="h-3 w-3 shrink-0" />
                    <span className="truncate" title={ci.autor.nome}>
                      Por: {ci.autor.nome}
                    </span>
                  </div>
                )}
                <Separator className="mb-4" />
              </div>

              <CardFooter className="pt-0">
                <Button className="w-full gap-2" variant="outline" asChild>
                  <a href={ci.arquivoUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 shrink-0" />
                    Baixar Documento
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