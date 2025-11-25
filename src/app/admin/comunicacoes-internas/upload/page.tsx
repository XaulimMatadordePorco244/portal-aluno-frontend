import { Metadata } from "next"
import { redirect } from "next/navigation"
import { CIForm } from "./ci-form"
import { getCurrentUserWithRelations, canAccessAdminArea } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Nova Comunicação Interna - Admin",
  description: "Upload e registro de comunicações internas",
}

export default async function UploadCIPage() {
  const user = await getCurrentUserWithRelations()

  if (!user) {
    redirect("/auth/login?callbackUrl=/admin/comunicacao-interna/upload")
  }

  const isAuthorized = canAccessAdminArea(user) && user.status === "ATIVO"

  if (!isAuthorized) {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Nova Comunicação Interna
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Olá, <strong>{user.nome}</strong>. Preencha os dados abaixo para gerar uma nova CI.
          O sistema irá calcular o número sequencial automaticamente.
        </p>
      </div>

      <CIForm autorId={user.id} />
    </div>
  )
}
