"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Loader2, UploadCloud, FileText } from "lucide-react"


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
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"


import { createComunicacaoInterna } from "../actions"


const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["application/pdf"];

const formSchema = z.object({
    titulo: z
        .string()
        .min(3, "O título deve ter pelo menos 3 caracteres")
        .max(100, "O título deve ter no máximo 100 caracteres"),
    assunto: z
        .string()
        .min(2, "O assunto é obrigatório (ex: RH, Operacional)"),
    resumo: z
        .string()
        .max(255, "O resumo não pode passar de 255 caracteres")
        .optional(),
    file: z
        .custom<FileList>()
        .refine((files) => files instanceof FileList && files.length > 0, "O arquivo PDF é obrigatório.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, "O arquivo deve ter no máximo 10MB.")
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            "Apenas arquivos no formato .pdf são permitidos."
        ),
})

interface CIFormProps {
    autorId: string
}

export function CIForm({ autorId }: CIFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            titulo: "",
            assunto: "",
            resumo: "",
        },
    })


    const fileRef = form.register("file")

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            try {
                const formData = new FormData()
                formData.append("titulo", values.titulo)
                formData.append("assunto", values.assunto)
                formData.append("resumo", values.resumo || "")
                formData.append("file", values.file[0])


                const result = await createComunicacaoInterna(formData, autorId)

                if (result.error) {
                    toast.error("Erro ao publicar", {
                        description: result.error,
                    })

                    return
                }


                toast.success("Sucesso!", {
                    description: "Comunicação Interna criada e arquivo salvo.",
                })


                form.reset()

                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
                if (fileInput) fileInput.value = ""


                router.refresh()

            } catch (error) {
                toast.error("Erro inesperado", {
                    description: "Ocorreu um erro ao tentar enviar o formulário.",
                })

            }
        })
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <FormField
                                control={form.control}
                                name="titulo"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 md:col-span-1">
                                        <FormLabel>Título da CI <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Escala de Carnaval" {...field} disabled={isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <FormField
                                control={form.control}
                                name="assunto"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 md:col-span-1">
                                        <FormLabel>Assunto <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: RH, Operacional..." {...field} disabled={isPending} />
                                        </FormControl>
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
                                    <FormLabel>Resumo (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Breve descrição para aparecer no dashboard..."
                                            className="resize-none h-20"
                                            {...field}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Texto curto exibido no card de visualização rápida.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={form.control}
                            name="file"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Arquivo PDF <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <div className="flex flex-col gap-2">
                                            <Input
                                                type="file"
                                                accept=".pdf"
                                                disabled={isPending}
                                                {...fileRef}
                                                onChange={(event) => {
                                                    field.onChange(event.target.files ?? undefined);
                                                }}
                                                className="cursor-pointer file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-2 file:text-sm hover:file:bg-primary/90"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Máximo 10MB. O nome do arquivo será gerado automaticamente pelo sistema.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? (
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