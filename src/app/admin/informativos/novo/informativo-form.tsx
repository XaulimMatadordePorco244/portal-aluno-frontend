"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Loader2, Save, ArrowLeft } from "lucide-react" 
import Link from "next/link"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { createInformativo, updateInformativo } from "../actions"


const formSchema = z.object({
  titulo: z.string().min(3).max(100),
  descricao: z.string().optional(),
  file: z.any().optional(), 
})


interface InformativoFormProps {
  initialData?: {
    id: string
    titulo: string
    descricao: string | null
    nomeArquivo: string | null
  } | null
}

export function InformativoForm({ initialData }: InformativoFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: initialData?.titulo || "",
      descricao: initialData?.descricao || "",
    },
  })

  const fileRef = form.register("file")

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("titulo", values.titulo)
      if (values.descricao) formData.append("descricao", values.descricao)
      if (values.file?.[0]) formData.append("file", values.file[0])

      let result;

      if (initialData) {
        
        result = await updateInformativo(initialData.id, formData)
      } else {

        result = await createInformativo(formData)
      }

      if (result.error) {
        toast.error("Erro ao atualizar: " + result.error)
      } else {
        toast.success(initialData ? "Atualizado com sucesso." : "Criado com sucesso.")
        
        if (!initialData) form.reset() 
        router.refresh()
        router.push("/admin/informativos") 
      }
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{initialData ? "Editar Informativo" : "Novo Informativo"}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/informativos"><ArrowLeft className="mr-2 h-4 w-4"/> Voltar</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl><Input {...field} disabled={isPending} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl><Textarea className="min-h-[100px]" {...field} disabled={isPending} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arquivo Anexo</FormLabel>
                  {initialData?.nomeArquivo && (
                    <div className="text-sm text-blue-600 mb-2 flex items-center">
                      Arquivo atual: {initialData.nomeArquivo}
                    </div>
                  )}
                  <FormControl>
                    <Input 
                      type="file" 
                      {...fileRef} 
                      disabled={isPending}
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormDescription>
                    {initialData ? "Envie um arquivo apenas se quiser substituir o atual." : "Opcional (PDF/Imagem)."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {initialData ? "Salvar Alterações" : "Publicar"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}