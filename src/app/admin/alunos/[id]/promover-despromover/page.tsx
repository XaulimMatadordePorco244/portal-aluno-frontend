import React from 'react'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/scroll-area'
import PromocaoDespromocaoForm from '@/components/cargos/PromocaoDespromocaoForm'
import prisma from '@/lib/prisma'
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth'
import {
  ArrowLeft,
  History,
  CalendarDays,
  ShieldAlert
} from 'lucide-react'

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
    title: `Gerenciar Cargo - ${aluno?.usuario.nome || 'Aluno'}`
  }
}

export default async function PromoverAlunoPage({ params }: PageProps) {
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

  const historicoRecente = await prisma.cargoHistory.findMany({
    where: { alunoId: id },
    orderBy: { dataInicio: 'desc' },
    take: 5,
    include: {
      cargo: true,
      logs: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { nome: true } } }
      }
    }
  })

  const cargoAtual = aluno.cargo

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Link href="/admin/alunos" className="hover:text-foreground transition-colors flex items-center gap-1 text-sm">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Movimentação de Pessoal
          </h1>
          <p className="text-muted-foreground">
            Ajuste de posto, graduação e companhia.
          </p>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/alunos/${id}/cargos`} className="gap-2">
            <History className="h-4 w-4" />
            Ver Histórico Completo
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-muted/30 rounded-lg p-6 border space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Identificação
              </span>
              <div>
                {highlightWarName(aluno.usuario.nome, aluno.nomeDeGuerra || undefined)}
              </div>
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
                <span className="text-sm font-medium">{cargoAtual?.nome || 'Sem Cargo'}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Conceito</span>
                <span className="text-sm font-medium">{aluno.conceitoAtual || '7.0'}</span>
              </div>
            </div>
          </div>

          <PromocaoDespromocaoForm
            aluno={{
              id: aluno.id,
              usuario: { nome: aluno.usuario.nome },
              cargo: cargoAtual ? {
                id: cargoAtual.id,
                nome: cargoAtual.nome,
                precedencia: cargoAtual.precedencia
              } : undefined,
              conceitoAtual: aluno.conceitoAtual || '7.0'
            }}
            cargos={cargos}
            adminId={user.id}
            adminNome={user.nome}
          />
        </div>

        <div className="space-y-6">
          <Card className="bg-transparent shadow-none border-dashed">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Regras de Transição
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3 text-sm text-muted-foreground">
              <p>• O conceito será redefinido para <strong>7.0</strong> automaticamente.</p>
              <p>• Todas as alterações geram logs de auditoria imutáveis.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-base">Últimas Alterações</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {historicoRecente.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Nenhum registro encontrado.
                </div>
              ) : (
                <ScrollArea className="h-[350px]">
                  <div className="divide-y">
                    {historicoRecente.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm">
                            {item.cargo?.nome || item.cargoNomeSnapshot}
                          </span>
                          <Badge variant="outline" className="text-[10px] font-normal h-5">
                            {item.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <CalendarDays className="h-3 w-3" />
                          <span>{new Date(item.dataInicio).toLocaleDateString('pt-BR')}</span>
                        </div>

                        {item.motivo && (
                          <p className="text-xs text-muted-foreground/80 italic line-clamp-2">
                            "{item.motivo}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
