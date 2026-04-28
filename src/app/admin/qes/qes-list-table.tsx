"use client"

import { useState } from "react"
import { Download, FileText, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog"

import { deleteQES, deleteManyQES } from "./actions"

interface QES {
  id: string
  titulo: string
  arquivoUrl: string
  createdAt: Date
}

interface QESListTableProps {
  data: QES[]
}

export function QESListTable({ data }: QESListTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  
  const [itemToDelete, setItemToDelete] = useState<QES | null>(null)

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(data.map(qes => qes.id))
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
      .filter(qes => selectedIds.includes(qes.id))
      .map(qes => ({ id: qes.id, fileUrl: qes.arquivoUrl }))

    try {
      const result = await deleteManyQES(itemsToDelete)
      if (result?.success) {
        toast.success("Itens excluídos com sucesso!")
        setSelectedIds([])
      } else {
        toast.error(result?.error || "Erro ao excluir itens.")
      }
    } catch {
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    
    setIsDeletingId(itemToDelete.id)
    try {
      const result = await deleteQES(itemToDelete.id, itemToDelete.arquivoUrl)
      if (result?.success) {
        toast.success("QES removido com sucesso")
        setSelectedIds(prev => prev.filter(id => id !== itemToDelete.id))
      } else {
        toast.error(result?.error || "Erro ao excluir QES")
      }
    } catch {
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setIsDeletingId(null)
      setItemToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="bg-muted/50 p-2 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <span className="text-sm font-medium ml-2">
            {selectedIds.length} selecionado(s)
          </span>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
          >
            {isBulkDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Excluir Selecionados
          </Button>
        </div>
      )}

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={selectedIds.length === data.length && data.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Data de Publicação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Nenhum QES publicado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((qes) => (
                <TableRow key={qes.id} className={selectedIds.includes(qes.id) ? "bg-muted/30" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(qes.id)}
                      onCheckedChange={() => toggleSelectOne(qes.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500 shrink-0"/>
                        {qes.titulo}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(qes.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={qes.arquivoUrl} target="_blank">
                          <Download className="h-4 w-4 mr-2"/>
                          Baixar
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setItemToDelete(qes)}
                        disabled={isDeletingId === qes.id}
                      >
                        {isDeletingId === qes.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá permanentemente o <strong>{itemToDelete?.titulo}</strong> e removerá o arquivo PDF do servidor.
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
    </div>
  )
}