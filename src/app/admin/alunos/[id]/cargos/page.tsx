import React from 'react'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeft,
  History,
  CalendarDays,
  ShieldAlert,
  FileText
} from 'lucide-react'
import CargoHistoryContainer from '@/components/cargos/CargoHistoryContainer'
import prisma from '@/lib/prisma'
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

const highlightWarName = (fullName: string, warName?: string) => {
  if (!warName) return <span className="font-medium text-foreground">{fullName}</span>

  const escapedWarName = warName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedWarName})`, 'gi')
  const parts = fullName.split(regex)

  return (
    <span className="text-lg text-muted-foreground">
      {parts.map((part, index) =>
        part.toLowerCase() === warName.toLowerCase() ? (
          <strong key={index} className="font-bold text-foreground">{part}</strong>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const aluno = await prisma.perfilAluno.findUnique({
    where: { id },
    include: { usuario: true }
  })

  return {
    title: `Histórico - ${aluno?.usuario.nome || 'Aluno'}`
  }
}

export default async function AdminAlunoCargosPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUserWithRelations()

  if (!user || !canAccessAdminArea(user)) {
    redirect('/dashboard')
  }

  const aluno = await prisma.perfilAluno.findUnique({
    where: { id },
    include: {
      usuario: true,
      cargo: true,
      companhia: true,
      historicoCargos: {
        where: { status: 'ATIVO' },
        take: 1
      }
    }
  })

  if (!aluno) notFound()

  const cargos = await prisma.cargo.findMany({
    orderBy: { precedencia: 'asc' }
  })

  const historicoCompleto = await prisma.cargoHistory.findMany({
    where: { alunoId: id },
    orderBy: { dataInicio: 'desc' },
    include: {
      logs: {
        include: {
          admin: { select: { nome: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  const cargoAtual = historicoCompleto.find(h => h.status === 'ATIVO')

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col gap-4 border-b pb-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Link
            href={`/admin/alunos/${id}/promover`}
            className="hover:text-foreground transition-colors flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Movimentação
          </Link>
        </div>

        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Histórico de Cargos
            </h1>
            <p className="text-muted-foreground">
              Linha do tempo completa e auditoria de promoções.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/alunos/${id}`}>Ver Perfil</Link>
          </Button>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-6 border space-y-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Aluno
          </span>
          <div>{highlightWarName(aluno.usuario.nome, aluno.nomeDeGuerra || '')}</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Número</span>
            <span className="font-mono text-sm">{aluno.numero || '-'}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Companhia</span>
            <span className="text-sm font-medium">{aluno.companhia?.nome || '-'}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Cargo Atual</span>
            <span className="text-sm font-medium">{aluno.cargo?.nome || 'Sem Cargo'}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Cargo desde</span>
            <span className="text-sm font-medium">
              {cargoAtual?.dataInicio
                ? new Date(cargoAtual.dataInicio).toLocaleDateString('pt-BR')
                : '-'}
            </span>
          </div>
        </div>
      </div>

      <Card className="bg-transparent shadow-none border-dashed">
        <CardHeader className="p-4 flex flex-row items-center gap-3 space-y-0">
          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nota do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-sm text-muted-foreground space-y-1">
          <p>Ao editar o histórico, lembre-se que ações passadas afetam a consistência dos dados.</p>
          <p>Todas as alterações ficam registradas nos logs de auditoria abaixo.</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Linha do Tempo</h3>
        <CargoHistoryContainer
          alunoId={id}
          cargos={cargos}
          alunoNome={aluno.usuario.nome}
        />
      </div>

      {historicoCompleto.length > 0 && (
        <Card>
          <CardHeader className="border-b bg-muted/10">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Auditoria Detalhada</CardTitle>
            </div>
            <CardDescription>
              Registro técnico de todas as movimentações
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="divide-y">
                {historicoCompleto.map((historico) => {
                  const ultimoLog = historico.logs[0]

                  return (
                    <div
                      key={historico.id}
                      className="p-4 hover:bg-muted/30 transition-colors text-sm"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono font-normal">
                            {historico.status}
                          </Badge>
                          <span className="font-medium">
                            {new Date(historico.dataInicio).toLocaleDateString('pt-BR')}
                            {historico.dataFim &&
                              ` — ${new Date(historico.dataFim).toLocaleDateString('pt-BR')}`}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          ID: {historico.id.slice(0, 8)}...
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-muted-foreground">
                        <div>
                          <span className="text-xs block text-foreground/60">Cargo Gravado</span>
                          {historico.cargoNomeSnapshot}
                        </div>
                        <div>
                          <span className="text-xs block text-foreground/60">Conceito</span>
                          {historico.conceitoAtual.toFixed(1)}
                        </div>
                        <div>
                          <span className="text-xs block text-foreground/60">Responsável</span>
                          {ultimoLog?.admin?.nome || 'Sistema'}
                        </div>
                        <div>
                          <span className="text-xs block text-foreground/60">Motivo</span>
                          <span className="italic">
                            {historico.motivo || ultimoLog?.motivo || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
