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

interface DadosIniciaisBoletim {
  mediaB1?: number | null;
  mediaB2?: number | null;
  mediaB3?: number | null;
  mediaB4?: number | null;
  faltasB1?: number;
  faltasB2?: number;
  faltasB3?: number;
  faltasB4?: number;
  escola?: string | null;
  serie?: string | null;
  observacoes?: string | null;
  anoLetivo: number;
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
      escola: true,
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

  const dadosIniciais: DadosIniciaisBoletim = boletim
    ? {
      mediaB1: boletim.mediaB1,
      mediaB2: boletim.mediaB2,
      mediaB3: boletim.mediaB3,
      mediaB4: boletim.mediaB4,
      faltasB1: boletim.faltasB1,
      faltasB2: boletim.faltasB2,
      faltasB3: boletim.faltasB3,
      faltasB4: boletim.faltasB4,
      escola: boletim.escola,
      serie: boletim.serie,
      observacoes: boletim.observacoes,
      anoLetivo: boletim.anoLetivo,
    }
    : {
      escola: aluno.escola?.nome || null,
      serie: aluno.serieEscolar,
      anoLetivo: anoAtual,
      mediaB1: null,
      mediaB2: null,
      mediaB3: null,
      mediaB4: null,
      faltasB1: 0,
      faltasB2: 0,
      faltasB3: 0,
      faltasB4: 0,
      observacoes: '',
    }

  return (
    <div className="space-y-8">

      <div className="flex items-center gap-4 border-b pb-6">
        <Avatar className="h-16 w-16 border-2 border-primary/10">
          <AvatarImage src={aluno.usuario.fotoUrl || undefined} />
          <AvatarFallback className="text-lg">{aluno.usuario.nome.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{aluno.usuario.nomeDeGuerra || aluno.usuario.nome}</h1>
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
          alunoId={aluno.id}
          anoAtual={anoAtual}
          dadosIniciais={boletim || undefined}
          dadosEscolares={{
            escola: aluno.escola?.nome || null,
            serie: aluno.serieEscolar || null,
            turma: aluno.turmaEscolar || null
          }}
        />
      </div>
    </div>
  )
}