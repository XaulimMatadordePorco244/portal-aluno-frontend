"use client"

import { useState } from "react" 
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Loader2, UploadCloud } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/Button" 
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"


const MAX_FILE_SIZE = 10 * 1024 * 1024;

const formSchema = z.object({
    titulo: z.string().min(3, "Mínimo 3 caracteres").max(100),
    assunto: z.string().min(2, "Assunto obrigatório"),
    resumo: z.string().optional(),
    file: z.custom<FileList>()
        .refine((files) => files?.length === 1, "Arquivo obrigatório.")
        .refine((files) => files?.[0]?.type === "application/pdf", "Apenas PDF.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, "Máx 10MB."),
})

export function CIForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            titulo: "",
            assunto: "",
            resumo: "",
        },
    })

    const fileRef = form.register("file")

 async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        
        try {
            const formData = new FormData()
            formData.append("titulo", values.titulo)
            formData.append("assunto", values.assunto)
            formData.append("resumo", values.resumo || "")
            formData.append("file", values.file[0])

            const response = await fetch("/api/comunicacoes-internas", {
                method: "POST",
                body: formData,
            })

            let result;
            try {
                result = await response.json()
            } catch (err) {
                if (response.status === 413) {
                     throw new Error("O arquivo é muito grande. O limite máximo é 10MB.")
                }
                throw new Error(`Erro inesperado do servidor (${response.status})`)
            }

            if (!response.ok) {
                throw new Error(result.error || "Erro ao criar comunicação")
            }

            toast.success("Comunicação publicada com sucesso!")
            
            router.refresh()
            router.push("/admin/comunicacoes-internas") 

        } catch (error: any) {
            console.error(error)
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        
                        <FormField
                            control={form.control}
                            name="titulo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título da CI</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Novo procedimento de acesso" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="assunto"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assunto / Departamento</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: RH, Segurança do Trabalho..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="resumo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Resumo (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Uma breve descrição sobre o conteúdo do documento..." 
                                            className="resize-none h-24"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="file"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Arquivo PDF</FormLabel>
                                    <FormControl>
                                        <div className="grid w-full items-center gap-1.5">
                                            <Input
                                                type="file"
                                                accept=".pdf"
                                                {...fileRef}
                                                onChange={(e) => field.onChange(e.target.files)}
                                                className="cursor-pointer file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-2 file:text-sm hover:file:bg-primary/90"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Máximo 10MB. O nome do arquivo será gerado automaticamente.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processando Upload...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Publicar Comunicação
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}