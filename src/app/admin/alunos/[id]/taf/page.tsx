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
    <div className="space-y-6">
      

      <div className="bg-background">
         <TafHistorico alunoId={id} />
      </div>

    </div>
  )
}