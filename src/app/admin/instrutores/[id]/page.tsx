import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { InstrutorForm } from '../instrutor-form'

export const metadata = { title: 'Editar Instrutor' }

export default async function EditarInstrutorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const instrutor = await prisma.instrutor.findUnique({
    where: { id }
  })

  if (!instrutor) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Instrutor</h1>
        <p className="text-muted-foreground">Altere os dados do instrutor.</p>
      </div>
      <div className="border rounded-lg bg-card p-6 shadow-sm">
        <InstrutorForm initialData={instrutor} />
      </div>
    </div>
  )
}