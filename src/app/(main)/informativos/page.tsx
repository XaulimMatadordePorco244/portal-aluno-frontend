import { Metadata } from "next"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { FileText, Calendar, Pencil, Bell } from "lucide-react"

import  prisma  from "@/lib/prisma"
import { getCurrentUserWithRelations, canAccessAdminArea } from "@/lib/auth"


import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Informativos e Avisos",
  description: "Mural de avisos gerais da instituição.",
}

export default async function InformativosPage() {

  const user = await getCurrentUserWithRelations()
  const isAdmin = user && canAccessAdminArea(user)

 
  const informativos = await prisma.informativo.findMany({
    orderBy: { dataPublicacao: 'desc' },
    include: {
      autor: { select: { nome: true } } 
    }
  })

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Bell className="h-8 w-8" /> Mural de Informativos
          </h1>
          <p className="text-muted-foreground mt-1">
            Fique por dentro das últimas notícias e avisos gerais.
          </p>
        </div>
      </div>


      {informativos.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/10">
          <Bell className="mx-auto h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">Nenhum aviso publicado</h3>
          <p className="text-muted-foreground">O mural de avisos está vazio no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {informativos.map((info) => (
            <Card key={info.id} className="flex flex-col h-full relative group hover:shadow-md transition-all border-l-4 border-l-primary/40">
              
              
              {isAdmin && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button variant="secondary" size="icon" className="h-8 w-8 shadow-sm" asChild title="Editar este informativo">
                    <Link href={`/admin/informativos/${info.id}/editar`}>
                      <Pencil className="h-4 w-4 text-foreground" />
                    </Link>
                  </Button>
                </div>
              )}

              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="font-normal">
                    <Calendar className="mr-1 h-3 w-3" />
                    {format(info.dataPublicacao, "d 'de' MMM, yyyy", { locale: ptBR })}
                  </Badge>
                </div>
                <CardTitle className="text-xl leading-tight">
                  {info.titulo}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="grow">
                {info.descricao ? (
                  <div className="text-sm text-muted-foreground whitespace-pre-line">
                    {info.descricao}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Sem descrição.</p>
                )}
              </CardContent>

                        {info.arquivoUrl && (
                <CardFooter className="pt-0 mt-4">
                  <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                    <a href={info.arquivoUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4" />
                      {info.nomeArquivo || "Visualizar Anexo"}
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}