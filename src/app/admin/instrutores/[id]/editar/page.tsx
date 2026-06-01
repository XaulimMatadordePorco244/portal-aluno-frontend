import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { InstrutorForm } from '../../instrutor-form'
import { ORDEM_ANTIGUIDADE } from '@/lib/regras' 

export const metadata = { title: 'Editar Instrutor' }

export default async function EditarInstrutorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const instrutor = await prisma.instrutor.findUnique({
    where: { id },
    include: {
      alunos: { select: { alunoId: true } } 
    }
  })

  if (!instrutor) notFound()

  const alunos = await prisma.perfilAluno.findMany({
    where: { 
      status: 'ATIVO',
      usuario: { status: 'ATIVO' }
    },
    select: {
      id: true,
      numero: true,
      usuario: { select: { nome: true, nomeDeGuerra: true } },
      cargo: { select: { abreviacao: true } }
    },
    orderBy: ORDEM_ANTIGUIDADE
  });

  const alunosMapeados = alunos.map(a => ({
    id: a.id,
    nome: a.usuario.nomeDeGuerra || a.usuario.nome,
    numero: a.numero,
    cargoAbreviacao: a.cargo?.abreviacao || null
  }));

  const initialData = {
    id: instrutor.id,
    nome: instrutor.nome,
    // Mapeia extraindo o 'alunoId' dos registros da tabela pivô
    alunosIds: instrutor.alunos.map(pivot => pivot.alunoId) 
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Instrutor</h1>
        <p className="text-muted-foreground">Altere os dados do instrutor.</p>
      </div>
      <div className="border rounded-lg bg-card p-6 shadow-sm">
        <InstrutorForm initialData={initialData} alunosDisponiveis={alunosMapeados} />
      </div>
    </div>
  )
}