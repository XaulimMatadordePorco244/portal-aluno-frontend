import { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import prisma from '@/lib/prisma'
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth'

import TafHistorico from "@/components/taf/taf-historico";

export const metadata: Metadata = {
  title: 'Histórico TAF do Aluno',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AlunoTafPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUserWithRelations()

  if (!user || !canAccessAdminArea(user)) {
    redirect('/dashboard')
  }

  const aluno = await prisma.perfilAluno.findUnique({
    where: { id },
    select: {
      id: true,
      usuario: { select: { nome: true, nomeDeGuerra: true } }
    }
  })

  if (!aluno) return notFound()

  const nomeExibicao = aluno.usuario.nomeDeGuerra || aluno.usuario.nome

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href={`/admin/alunos/${id}`}>
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    Histórico de TAF
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <User className="h-4 w-4" />
                    <span className="font-medium text-foreground">{nomeExibicao}</span>
                </div>
            </div>
        </div>
        
        <Button asChild>
            <Link href={`/admin/alunos/${id}/taf/novo`}>
                Lançar Novo TAF
            </Link>
        </Button>
      </div>

      <div className="bg-background">
         <TafHistorico alunoId={id} />
      </div>

    </div>
  )
}