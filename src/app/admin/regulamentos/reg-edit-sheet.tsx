"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const editSchema = z.object({
    titulo: z.string().min(3),
    arquivo: z.custom<FileList>().optional(),
})

type FormData = z.infer<typeof editSchema>

interface Regulamento {
    id: string
    titulo: string
}

interface RegEditSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: Regulamento
}

export function RegEditSheet({ open, onOpenChange, data }: RegEditSheetProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<FormData>({
        resolver: zodResolver(editSchema),
        defaultValues: { titulo: data.titulo },
    })

    async function onSubmit(values: FormData) {
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("titulo", values.titulo)
            if (values.arquivo && values.arquivo.length > 0) {
                formData.append("arquivo", values.arquivo[0])
            }

            const response = await fetch(`/api/admin/regulamentos/${data.id}`, {
                method: "PUT",
                body: formData,
            })

            if (!response.ok) throw new Error("Erro ao atualizar regulamento")

            toast.success("Regulamento atualizado com sucesso!")
            router.refresh()
            onOpenChange(false)
        } catch (error) {
            console.error("Erro ao atualizar:", error)
            toast.error("Erro ao atualizar regulamento")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader><SheetTitle>Editar Regulamento</SheetTitle></SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField
                            control={form.control}
                            name="titulo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="arquivo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Substituir Arquivo (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="file" 
                                            accept=".pdf" 
                                            onChange={(e) => field.onChange(e.target.files)}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <SheetFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Salvar
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}