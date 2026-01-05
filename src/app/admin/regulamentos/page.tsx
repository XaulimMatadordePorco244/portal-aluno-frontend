import { Metadata } from "next"
import { getRegulamentos } from "./actions"
import { RegForm } from "./reg-form"
import { RegListTable } from "./reg-list-table"
import { canAccessAdminArea, getCurrentUserWithRelations } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Gerenciar Regulamentos",
}

export default async function RegulamentosPage() {
  const user = await getCurrentUserWithRelations()
  if (!user || !canAccessAdminArea(user)) redirect("/")

  const { data } = await getRegulamentos()

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Regulamentos</h1>
        <p className="text-muted-foreground">Gerencie os documentos normativos da instituição.</p>
      </div>
      
      <RegForm />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Documentos Publicados</h2>
        <RegListTable data={data} />
      </div>
    </div>
  )
}