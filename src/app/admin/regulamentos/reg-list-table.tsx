"use client"

import { useState } from "react"
import { FileText, Trash2, Edit, Download, FolderOpen } from "lucide-react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/Button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // Opcional, para UX melhor
import { deleteRegulamento } from "./actions"
import { RegEditSheet } from "./reg-edit-sheet"

export function RegListTable({ data }: { data: any[] }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedReg, setSelectedReg] = useState<any>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    const handleDelete = async () => {
        if (!selectedReg) return
        const result = await deleteRegulamento(selectedReg.id, selectedReg.arquivoUrl)
        if (result.success) {
            toast.success("Regulamento removido com sucesso")
            setIsDeleteDialogOpen(false)
        } else {
            toast.error("Erro ao remover regulamento")
        }
    }

    return (
        <>
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-full">Título do Documento</TableHead>
                            <TableHead className="text-right min-w-[150px]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <FolderOpen className="h-10 w-10 opacity-20" />
                                        <p>Nenhum regulamento encontrado.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((reg) => (
                                <TableRow key={reg.id} className="hover:bg-muted/40 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium text-foreground">{reg.titulo}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 hover:bg-muted hover:text-foreground"
                                                            onClick={() => window.open(reg.arquivoUrl, '_blank')}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            <span className="sr-only">Baixar</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Baixar PDF</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 hover:bg-muted hover:text-foreground"
                                                onClick={() => { setSelectedReg(reg); setIsEditOpen(true) }}
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Editar</span>
                                            </Button>

                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                                                onClick={() => { setSelectedReg(reg); setIsDeleteDialogOpen(true) }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Excluir</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente o regulamento 
                            <strong> {selectedReg?.titulo}</strong> e seu arquivo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Confirmar Exclusão
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {selectedReg && (
                <RegEditSheet 
                    open={isEditOpen} 
                    onOpenChange={setIsEditOpen} 
                    data={selectedReg} 
                />
            )}
        </>
    )
}