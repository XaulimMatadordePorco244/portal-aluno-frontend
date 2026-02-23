import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { getCurrentUserWithRelations } from '@/lib/auth'
import { FrequenciaDashboard } from '@/components/frequencia/frequencia-dashboard' 

export const metadata: Metadata = { title: 'Minha Frequência' }

export default async function AlunoFrequenciaPage() {
  const user = await getCurrentUserWithRelations()
  if (!user?.perfilAluno) return <div>Acesso restrito</div>

  const frequencias = await prisma.frequencia.findMany({
    where: { alunoId: user.perfilAluno.id },
    orderBy: { data: 'desc' } 
  })

  const eventos = await prisma.gmEventoCalendario.findMany()

  const itensDashboard = [
    ...frequencias.map(f => ({
      tipoOrigem: 'FREQUENCIA' as const,
      id: f.id,
      data: f.data,
      status: f.status,
      tipoAula: f.tipo,
      observacao: f.observacao 
    })),
    ...eventos.map(e => ({
      tipoOrigem: 'INSTITUCIONAL' as const,
      id: e.id,
      data: e.data,
      titulo: e.titulo,
      tipoEvento: e.tipo,
      descricao: e.descricao
    }))
  ]

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-2 ">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Painel de Frequência</h1>
           <p className="text-muted-foreground">Histórico pessoal e calendário de atividades da Guarda Mirim.</p>
        </div>
      </div>

      <FrequenciaDashboard itens={itensDashboard} />
    </div>
  )
}