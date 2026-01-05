"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Save, FileWarning } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation" 

import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription,
    SheetFooter 
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const editSchema = z.object({
    titulo: z.string().min(3, "Mínimo 3 caracteres"),
    assunto: z.string().min(2, "Assunto obrigatório"),
    resumo: z.string().optional(),
    file: z.custom<FileList>()
        .optional()
        .refine((files) => !files || files.length === 0 || files[0].type === "application/pdf", "Apenas arquivos PDF são aceitos.")
        .refine((files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE, "O arquivo deve ter no máximo 10MB."),
})

interface CIEditSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: any
}

export function CIEditSheet({ open, onOpenChange, data }: CIEditSheetProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof editSchema>>({
        resolver: zodResolver(editSchema),
        defaultValues: {
            titulo: data.titulo,
            assunto: data.assunto,
            resumo: data.resumo || "",
        },
    })

    const fileRef = form.register("file")

    async function onSubmit(values: z.infer<typeof editSchema>) {
        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.append("titulo", values.titulo)
            formData.append("assunto", values.assunto)
            formData.append("resumo", values.resumo || "")
            
            if (values.file && values.file.length > 0) {
                formData.append("file", values.file[0])
            }

            const response = await fetch(`/api/comunicacoes-internas/${data.id}`, {
                method: "PUT",
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Erro ao atualizar")
            }

            toast.success("Comunicação atualizada com sucesso!")
            
            router.refresh()
            onOpenChange(false)

        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl flex flex-col h-full">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-xl">Editar Comunicação</SheetTitle>
                    <SheetDescription>
                        Editando CI <span className="font-mono font-medium text-primary px-1 py-0.5 bg-primary/10 rounded">{String(data.numeroSequencial).padStart(3, '0')}/{data.anoReferencia}</span>
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    <Form {...form}>
                        <form id="edit-ci-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="titulo"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
                                            <FormLabel>Título</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="assunto"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
                                            <FormLabel>Assunto</FormLabel>
                                            <FormControl><Input {...field} placeholder="Ex: RH, Financeiro..." /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="resumo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Resumo <span className="text-muted-foreground text-xs font-normal">(Opcional)</span></FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                {...field} 
                                                className="resize-none min-h-[100px]" 
                                                placeholder="Breve descrição do conteúdo..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-4 dark:bg-amber-950/20 dark:border-amber-900/50">
                                <FormField
                                    control={form.control}
                                    name="file"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600 dark:text-amber-500 shrink-0 mt-0.5">
                                                    <FileWarning className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <FormLabel className="text-base font-medium text-amber-900 dark:text-amber-400">
                                                        Substituir Arquivo PDF
                                                    </FormLabel>
                                                    <p className="text-sm text-muted-foreground leading-snug">
                                                        Selecione um arquivo <strong>apenas se desejar substituir</strong> o atual. O arquivo antigo será excluído permanentemente.
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <FormControl>
                                                <Input 
                                                    type="file" 
                                                    accept=".pdf" 
                                                    className="bg-background mt-2"
                                                    {...fileRef}
                                                    onChange={(e) => field.onChange(e.target.files)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </form>
                    </Form>
                </div>

                <SheetFooter className="pt-4 border-t mt-auto sm:justify-between sm:space-x-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
                        Cancelar
                    </Button>
                    <Button type="submit" form="edit-ci-form" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4"/>}
                        Salvar Alterações
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}