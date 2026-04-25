"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  MoreHorizontal, Trash2, Edit, Download, FileText, ChevronLeft, ChevronRight 
} from "lucide-react"
import { toast } from "sonner"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/Button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"

import { deleteComunicacao, deleteManyComunicacoes } from "./actions"
import { CIEditSheet } from "./ci-edit-sheet"

interface Autor {
  id?: string
  nome: string
}

interface ComunicacaoInterna {
  id: string
  titulo: string
  assunto: string
  numeroSequencial: number
  anoReferencia: number
  arquivoUrl: string
  createdAt: string | Date
  autor?: Autor
}

interface CIListTableProps {
  data: ComunicacaoInterna[]
  currentPage: number
  totalPages: number
  totalItems: number
}

const ITEMS_PER_PAGE = 10 

export function CIListTable({ data, currentPage, totalPages, totalItems }: CIListTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCI, setSelectedCI] = useState<ComunicacaoInterna | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const params = new URLSearchParams(searchParams)
      params.set('page', (currentPage + 1).toString())
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const params = new URLSearchParams(searchParams)
      params.set('page', (currentPage - 1).toString())
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + data.length

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(data.map(ci => ci.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Deseja excluir ${selectedIds.length} itens selecionados?`)) return

    setIsBulkDeleting(true)
    const itemsToDelete = data
      .filter(ci => selectedIds.includes(ci.id))
      .map(ci => ({ id: ci.id, fileUrl: ci.arquivoUrl }))

    try {
      const result = await deleteManyComunicacoes(itemsToDelete)

      if (result && typeof result === 'object' && 'success' in result && result.success) {
        toast.success("Itens excluídos com sucesso!")
        setSelectedIds([])
        
        if (data.length === itemsToDelete.length && currentPage > 1) {
          const params = new URLSearchParams(searchParams)
          params.set('page', (currentPage - 1).toString())
          router.push(`${pathname}?${params.toString()}`)
        } else {
          router.refresh()
        }
      } else if (result && typeof result === 'object' && 'error' in result && typeof result.error === 'string') {
        toast.error(result.error)
      } else {
        toast.error("Erro ao excluir itens.")
      }
    } catch {
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCI) return
    
    try {
      const result = await deleteComunicacao(selectedCI.id, selectedCI.arquivoUrl)
      
      if (result && typeof result === 'object') {
        if ('success' in result && result.success) {
          toast.success("CI removida com sucesso")
          setIsDeleteDialogOpen(false)
          
          if (data.length === 1 && currentPage > 1) {
            const params = new URLSearchParams(searchParams)
            params.set('page', (currentPage - 1).toString())
            router.push(`${pathname}?${params.toString()}`)
          } else {
            router.refresh() 
          }
        } else if ('error' in result && typeof result.error === 'string') {
          toast.error(result.error)
        } else {
          toast.error("Resposta inválida do servidor")
        }
      }
    } catch  {
      toast.error("Erro ao conectar com o servidor")
    }
  }

  const handleViewClick = (arquivoUrl: string) => {
    window.open(arquivoUrl, '_blank', 'noopener,noreferrer')
  }

  const handleEditClick = (ci: ComunicacaoInterna) => {
    setSelectedCI(ci)
    setIsEditOpen(true)
  }

  const handleDeleteClick = (ci: ComunicacaoInterna) => {
    setSelectedCI(ci)
    setIsDeleteDialogOpen(true)
  }

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString
      return format(date, "dd/MM/yyyy", { locale: ptBR })
    } catch {
      return "Data inválida"
    }
  }

  const formatCINumber = (numeroSequencial: number, anoReferencia: number) => {
    return `${String(numeroSequencial).padStart(3, '0')}/${anoReferencia}`
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="bg-muted/50 p-3 rounded-xl border border-border flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <span className="text-sm font-medium ml-2 text-foreground">
            {selectedIds.length} selecionado(s)
          </span>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Selecionados
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={selectedIds.length === data.length && data.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[100px]">CI Nº</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead className="w-[120px]">Data</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead className="text-right w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                     <div className="flex flex-col items-center justify-center gap-2">
                       <FileText className="h-8 w-8 opacity-20" />
                       <p>Nenhuma comunicação encontrada.</p>
                     </div>
                   </TableCell>
                 </TableRow>
              ) : (
                data.map((ci) => (
                  <TableRow 
                    key={ci.id} 
                    className={selectedIds.includes(ci.id) ? "bg-muted/30" : "hover:bg-muted/30"}
                  >
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.includes(ci.id)}
                        onCheckedChange={() => toggleSelectOne(ci.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono font-medium text-primary">
                      {formatCINumber(ci.numeroSequencial, ci.anoReferencia)}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{ci.titulo}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                        {ci.assunto}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(ci.createdAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {ci.autor?.nome || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem 
                            onClick={() => handleViewClick(ci.arquivoUrl)} 
                            className="cursor-pointer"
                          >
                            <Download className="mr-2 h-4 w-4 text-muted-foreground" /> 
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleEditClick(ci)} 
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4 text-muted-foreground" /> 
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                            onClick={() => handleDeleteClick(ci)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> 
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalItems > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium">{startIndex + 1}</span> a{" "}
              <span className="font-medium">{endIndex}</span> de{" "}
              <span className="font-medium">{totalItems}</span> resultados
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <div className="text-sm font-medium px-2">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá permanentemente a comunicação{" "}
              <strong>{selectedCI?.titulo}</strong> e removerá o arquivo PDF 
              associado do servidor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedCI && (
        <CIEditSheet 
          open={isEditOpen} 
          onOpenChange={setIsEditOpen} 
          data={selectedCI} 
        />
      )}
    </div>
  )
}