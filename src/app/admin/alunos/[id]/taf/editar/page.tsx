import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import prisma from '@/lib/prisma'
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth'

import TafForm from '../novo/taf-form' 

export const metadata: Metadata = {
  title: 'Editar TAF',
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ id?: string }> 
}

export default async function EditarTafPage({ params, searchParams }: PageProps) {
  const { id: alunoId } = await params
  const { id: tafId } = await searchParams
  
  if (!tafId) return notFound()

  const user = await getCurrentUserWithRelations()

  if (!user || !canAccessAdminArea(user)) {
    redirect('/dashboard')
  }

  const aluno = await prisma.perfilAluno.findUnique({
    where: { id: alunoId },
    include: {
      usuario: true 
    }
  })

  if (!aluno) return notFound()

  const taf = await prisma.tafDesempenho.findUnique({
    where: { id: tafId }
  })

  if (!taf) return notFound()

  let generoTaf: 'MASCULINO' | 'FEMININO' = 'MASCULINO' 
  const sexoBanco = aluno.usuario.genero 
  
  if (String(sexoBanco).toUpperCase().startsWith('F')) {
    generoTaf = 'FEMININO'
  }

  return (
    <div >
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/taf`}>
                <ArrowLeft className="h-5 w-5" />
            </Link>
        </Button>
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Avaliação Física (TAF)</h1>
            <p className="text-muted-foreground">
                Atualização de resultados para <span className="text-foreground font-medium">{aluno.usuario.nomeDeGuerra || aluno.usuario.nome}</span>
            </p>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm p-6">
        <TafForm 
            alunoId={aluno.id}
            nomeAluno={aluno.usuario.nomeDeGuerra || aluno.usuario.nome}
            genero={generoTaf} 
            initialData={{
              id: taf.id,
              bimestre: taf.bimestre,
              abdominalQtd: taf.abdominalQtd,
              apoioTipo: taf.apoioTipo as 'BARRA' | 'FLEXAO',
              apoioValor: taf.apoioValor,
              corridaTempo: taf.corridaTempo,
              observacoes: taf.observacoes
            }}
        />
      </div>
    </div>
  )
}