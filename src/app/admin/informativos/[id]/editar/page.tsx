import  prisma  from "@/lib/prisma"
import { getCurrentUserWithRelations, canAccessAdminArea } from "@/lib/auth"
import { redirect } from "next/navigation"
import { InformativoForm } from "../../novo/informativo-form" 

export default async function EditarInformativoPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserWithRelations()
  if (!user || !canAccessAdminArea(user)) redirect("/")


  const { id } = await params

  const informativo = await prisma.informativo.findUnique({
    where: { id }
  })

  if (!informativo) {
    return <div>Informativo não encontrado</div>
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Editar Informativo</h1>
      </div>
      
      <InformativoForm initialData={informativo} />
    </div>
  )
}