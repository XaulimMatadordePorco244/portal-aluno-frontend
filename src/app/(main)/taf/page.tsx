import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { 
  Trophy, 
  Calendar, 
  Dumbbell, 
  Activity, 
  Timer, 
  AlertCircle 
} from 'lucide-react'
import { Card, CardContent} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCurrentUserWithRelations } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Meu TAF | Guarda Mirim',
}

const formatarTempo = (segundos: number) => {
  const min = Math.floor(segundos / 60)
  const sec = segundos % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export default async function AlunoTafPage() {
  const user = await getCurrentUserWithRelations()

  if (!user || user.role !== 'ALUNO' || !user.perfilAluno) {
    redirect('/dashboard')
  }

  const tafs = await prisma.tafDesempenho.findMany({
    where: { alunoId: user.perfilAluno.id },
    orderBy: [
      { anoLetivo: 'desc' },
      { bimestre: 'desc' } 
    ]
  })

  const tafsPorAno: Record<number, typeof tafs> = {}
  tafs.forEach(taf => {
    if (!tafsPorAno[taf.anoLetivo]) tafsPorAno[taf.anoLetivo] = []
    tafsPorAno[taf.anoLetivo].push(taf)
  })

  const anos = Object.keys(tafsPorAno).map(Number).sort((a, b) => b - a)

  return (
    <div >
      <div className="flex items-center gap-3 mb-6 pl-2">
        
        <div>
            <h1 className="text-2xl font-bold">Meu Desempenho</h1>
            <p className="text-sm text-muted-foreground">Histórico de Testes Físicos</p>
        </div>
      </div>

      {anos.length === 0 ? (
        <Card className="border-dashed">
            <CardContent className="pt-6 flex flex-col items-center text-center text-muted-foreground">
                <Dumbbell className="w-10 h-10 mb-2 opacity-20" />
                <p>Nenhum TAF registrado ainda.</p>
            </CardContent>
        </Card>
      ) : (
        anos.map(ano => (
          <div key={ano} className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded w-fit">
                <Calendar className="w-4 h-4" /> Ano Letivo {ano}
            </div>

            {tafsPorAno[ano].map(taf => (
              <Card key={taf.id} className="overflow-hidden border shadow-sm">
                <div className="bg-muted/30 px-4 py-3 border-b flex justify-between items-center">
                    <span className="font-bold text-sm uppercase tracking-wide">
                        {taf.bimestre}º Bimestre
                    </span>
                    <Badge variant={taf.mediaFinal >= 6 ? 'default' : 'destructive'}>
                        Média: {taf.mediaFinal.toFixed(1)}
                    </Badge>
                </div>

                <CardContent className="p-4 grid gap-4">
                    <div className="grid grid-cols-3 gap-2 text-center divide-x">
                        
                        <div className="flex flex-col items-center px-1">
                            <Activity className="w-4 h-4 text-blue-500 mb-1" />
                            <span className="text-xs text-muted-foreground uppercase">Abd</span>
                            <span className="font-bold text-lg">{taf.abdominalQtd}</span>
                            <span className="text-[10px] text-muted-foreground">Nota {taf.abdominalNota.toFixed(1)}</span>
                        </div>

                        <div className="flex flex-col items-center px-1">
                            <Dumbbell className="w-4 h-4 text-purple-500 mb-1" />
                            <span className="text-xs text-muted-foreground uppercase">
                                {taf.apoioTipo === 'BARRA' ? 'Barra' : 'Flexão'}
                            </span>
                            <span className="font-bold text-lg">
                                {taf.apoioValor}
                                <span className="text-[10px] font-normal ml-0.5">
                                    {taf.apoioTipo === 'BARRA' ? 's' : 'x'}
                                </span>
                            </span>
                            <span className="text-[10px] text-muted-foreground">Nota {taf.apoioNota.toFixed(1)}</span>
                        </div>

                        <div className="flex flex-col items-center px-1">
                            <Timer className="w-4 h-4 text-orange-500 mb-1" />
                            <span className="text-xs text-muted-foreground uppercase">Corrida</span>
                            <span className="font-bold text-lg leading-tight pt-1">
                                {formatarTempo(taf.corridaTempo)}
                            </span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">Nota {taf.corridaNota.toFixed(1)}</span>
                        </div>
                    </div>

                    {taf.observacoes && (
                        <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded text-xs text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                            {taf.observacoes}
                        </div>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        ))
      )}
    </div>
  )
}