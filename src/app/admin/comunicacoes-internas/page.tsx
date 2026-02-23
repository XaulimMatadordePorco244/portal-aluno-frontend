import { Metadata } from "next"
import { getComunicacoes } from "./actions"
import { CIListTable } from "./ci-list-table"
import { CIFilters } from "./ci-filters"
import { Button } from "@/components/ui/Button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Gerenciar Comunicações - Admin",
}

type Props = {
  searchParams: Promise<{
    q?: string
    from?: string
    to?: string
    page?: string
  }>
}

export default async function CIListPage(props: Props) {
  const searchParams = await props.searchParams

  const query = searchParams.q || ""
  const dateFrom = searchParams.from
  const dateTo = searchParams.to
  const currentPage = Number(searchParams.page) || 1

  const { data, total, totalPages } = await getComunicacoes(query, dateFrom, dateTo, currentPage)

  return (
    <div className="container mx-auto px-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Comunicações Internas</h1>
          <p className="text-muted-foreground">
            Gerencie as publicações. Total de registros: {total}
          </p>
        </div>
        <Link href="/admin/comunicacoes-internas/upload">
            <Button className="shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Nova CI
            </Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <CIFilters />
      </div>
      
      <CIListTable data={data} />
      
      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
           <span className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</span>
        </div>
      )}
    </div>
  )
}