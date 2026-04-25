import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { InstrutorForm } from '../../instrutor-form'

export const metadata = { title: 'Editar Instrutor' }

export default async function EditarInstrutorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const instrutor = await prisma.instrutor.findUnique({
    where: { id },
    include: {
      alunos: { select: { id: true } }
    }
  })

  if (!instrutor) notFound()

  const alunos = await prisma.perfilAluno.findMany({
    where: { status: 'ATIVO' },
    include: { usuario: { select: { nome: true, nomeDeGuerra: true } } },
    orderBy: { usuario: { nome: 'asc' } }
  });

  const alunosMapeados = alunos.map(a => ({
    id: a.id,
    nome: a.usuario.nomeDeGuerra || a.usuario.nome,
    numero: a.numero
  }));

  const initialData = {
    id: instrutor.id,
    nome: instrutor.nome,
    alunosIds: instrutor.alunos.map(a => a.id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Instrutor</h1>
        <p className="text-muted-foreground">Altere os dados do instrutor e os seus alunos vinculados.</p>
      </div>
      <div className="border rounded-lg bg-card p-6 shadow-sm">
        <InstrutorForm initialData={initialData} alunosDisponiveis={alunosMapeados} />
      </div>
    </div>
  )
}