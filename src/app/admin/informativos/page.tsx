import { Metadata } from "next"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Plus, Pencil, Trash2, FileText } from "lucide-react"

import  prisma  from "@/lib/prisma"
import { getCurrentUserWithRelations, canAccessAdminArea } from "@/lib/auth"
import { redirect } from "next/navigation"

// UI
import { Button } from "@/components/ui/Button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


import { DeleteInformativoButton } from "./_componentes/delete-button"

export const metadata: Metadata = {
  title: "Gestão de Informativos",
}

export default async function AdminInformativosPage() {
  const user = await getCurrentUserWithRelations()
  if (!user || !canAccessAdminArea(user)) redirect("/")

  const informativos = await prisma.informativo.findMany({
    orderBy: { dataPublicacao: "desc" },
    include: { autor: { select: { nome: true } } }
  })

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Informativos</h1>
        <Button asChild>
          <Link href="/admin/informativos/novo">
            <Plus className="mr-2 h-4 w-4" /> Novo Informativo
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Publicado em</TableHead>
              <TableHead>Anexo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {informativos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  Nenhum informativo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              informativos.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.titulo}</TableCell>
                  <TableCell>
                    {format(item.dataPublicacao, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {item.arquivoUrl ? (
                      <a href={item.arquivoUrl} target="_blank" className="flex items-center text-blue-600 hover:underline">
                        <FileText className="h-4 w-4 mr-1" /> {item.nomeArquivo || "Arquivo"}
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                   
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/admin/informativos/${item.id}/editar`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                                   <DeleteInformativoButton id={item.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}