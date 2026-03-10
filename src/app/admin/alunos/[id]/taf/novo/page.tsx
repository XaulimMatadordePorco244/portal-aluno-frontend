import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import prisma from '@/lib/prisma'
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth'
import TafForm from './taf-form' 

export const metadata: Metadata = {
  title: 'Lançar Novo TAF',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NovoTafPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUserWithRelations()

  if (!user || !canAccessAdminArea(user)) {
    redirect('/dashboard')
  }

  const aluno = await prisma.perfilAluno.findUnique({
    where: { id },
    include: {
      usuario: true 
    }
  })

  if (!aluno) {
    return notFound()
  }


  
  let generoTaf: 'MASCULINO' | 'FEMININO' = 'MASCULINO' 
  
  const sexoBanco = aluno.usuario.genero 
  
  if (String(sexoBanco).toUpperCase().startsWith('F')) {
    generoTaf = 'FEMININO'
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/alunos/${id}`}>
                <ArrowLeft className="h-5 w-5" />
            </Link>
        </Button>
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Avaliação Física (TAF)</h1>
            <p className="text-muted-foreground">
                Lançamento de resultados para <span className="text-foreground font-medium">{aluno.usuario.nomeDeGuerra || aluno.usuario.nome}</span>
            </p>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm p-6">
        <TafForm 
            alunoId={aluno.id}
            nomeAluno={aluno.usuario.nomeDeGuerra || aluno.usuario.nome}
            genero={generoTaf} 
        />
      </div>
    </div>
  )
}