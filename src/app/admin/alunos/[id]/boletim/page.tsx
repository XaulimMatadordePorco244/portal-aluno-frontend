import React from 'react'
import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import BoletimForm from './boletim-form' 

export const metadata: Metadata = {
  title: 'Editar Boletim Escolar',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarBoletimPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUserWithRelations()
  
  if (!user || !canAccessAdminArea(user)) {
    redirect('/dashboard')
  }

  const aluno = await prisma.perfilAluno.findUnique({
    where: { id },
    include: {
      usuario: true,
      companhia: true,
    }
  })

  if (!aluno) {
    return notFound()
  }

  const anoAtual = new Date().getFullYear()
  
  const boletim = await prisma.desempenhoEscolar.findUnique({
    where: {
      alunoId_anoLetivo: {
        alunoId: id,
        anoLetivo: anoAtual
      }
    }
  })

  const dadosIniciais = boletim || {
    escola: aluno.escola,       
    serie: aluno.serieEscolar  
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      
      <div className="flex items-center gap-4 border-b pb-6">
        <Avatar className="h-16 w-16 border-2 border-primary/10">
          <AvatarImage src={aluno.usuario.fotoUrl || undefined} />
          <AvatarFallback className="text-lg">{aluno.usuario.nome.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{aluno.nomeDeGuerra || aluno.usuario.nome}</h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-muted-foreground text-sm">{aluno.usuario.nome}</span>
             <Badge variant="outline">{aluno.companhia?.abreviacao || 'Sem Cia'}</Badge>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-1">Lançamento de Notas Escolares</h2>
        <p className="text-sm text-muted-foreground mb-6">
            Preencha as médias bimestrais fornecidas pela escola. O sistema calculará a Média Final (MF) automaticamente.
        </p>

        <BoletimForm 
            alunoId={id} 
            anoAtual={anoAtual}
            dadosIniciais={dadosIniciais} 
        />
      </div>
    </div>
  )
}