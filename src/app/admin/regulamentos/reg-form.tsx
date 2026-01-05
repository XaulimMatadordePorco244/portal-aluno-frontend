"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Loader2, UploadCloud, FileText } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"

const formSchema = z.object({
    titulo: z.string().min(3, "Mínimo 3 caracteres"),
    arquivo: z.custom<FileList>()
        .refine((files) => files?.length === 1, "Arquivo obrigatório.")
        .refine((files) => files?.[0]?.type === "application/pdf", "Apenas PDF.")
        .refine((files) => files?.[0]?.size <= 10 * 1024 * 1024, "Máx 10MB."),
})

export function RegForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { titulo: "" },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("titulo", values.titulo)
            formData.append("arquivo", values.arquivo[0])

            const response = await fetch("/api/admin/regulamentos", {
                method: "POST",
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                if (response.status === 413) throw new Error("Arquivo muito grande (Máx 10MB).")
                throw new Error(result.error || "Erro ao enviar")
            }

            toast.success("Regulamento publicado!")
            form.reset()
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
            if(fileInput) fileInput.value = ""
            
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="mb-8 border border-border shadow-sm">
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-start">
                        <FormField
                            control={form.control}
                            name="titulo"
                            render={({ field }) => (
                                <FormItem className="flex-1 w-full">
                                    <FormLabel>Título do Regulamento</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Ex: Código de Ética e Conduta" className="pl-9" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="arquivo"
                            render={({ field }) => (
                                <FormItem className="w-full md:w-auto md:min-w-[250px]">
                                    <FormLabel>Arquivo PDF</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="file" 
                                            accept=".pdf" 
                                            className="cursor-pointer file:text-primary file:font-medium"
                                            onChange={(e) => field.onChange(e.target.files)} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="mt-8 w-full md:w-auto" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                            Publicar
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}