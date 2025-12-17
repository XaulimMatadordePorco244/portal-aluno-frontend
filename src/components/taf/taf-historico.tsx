import Link from 'next/link'
import { Plus, Trophy, Timer, Dumbbell, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import prisma from '@/lib/prisma'

const formatarTempo = (segundos: number) => {
  const min = Math.floor(segundos / 60)
  const sec = segundos % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export default async function TafHistorico({ alunoId }: { alunoId: string }) {
  const tafs = await prisma.tafDesempenho.findMany({
    where: { alunoId },
    orderBy: [
      { anoLetivo: 'desc' },
      { bimestre: 'asc' }
    ]
  })

  const tafsPorAno: Record<number, typeof tafs> = {}
  
  tafs.forEach(taf => {
    if (!tafsPorAno[taf.anoLetivo]) {
      tafsPorAno[taf.anoLetivo] = []
    }
    tafsPorAno[taf.anoLetivo].push(taf)
  })

  const anos = Object.keys(tafsPorAno).map(Number).sort((a, b) => b - a)

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Histórico de Aptidão Física (TAF)
        </h2>
        <Button size="sm" asChild>
          <Link href={`/admin/alunos/${alunoId}/taf/novo`}>
            <Plus className="mr-2 h-4 w-4" /> Novo TAF
          </Link>
        </Button>
      </div>

      {anos.length === 0 && (
        <div className="text-center py-10 border rounded-lg bg-muted/20 text-muted-foreground">
            Nenhum TAF registrado para este aluno.
        </div>
      )}

      {anos.map(ano => (
        <div key={ano} className="border rounded-xl overflow-hidden shadow-sm bg-card">
          <div className="bg-muted/40 px-6 py-3 border-b flex items-center gap-2">
            <span className="font-bold text-lg">Ano {ano}</span>
            <Badge variant="outline" className="font-mono text-xs">
                {tafsPorAno[ano].length} avaliações
            </Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px]">Bimestre</TableHead>
                <TableHead className="text-center">
                    <div className="flex flex-col items-center gap-1">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">Abdominal</span>
                    </div>
                </TableHead>
                <TableHead className="text-center">
                    <div className="flex flex-col items-center gap-1">
                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">Apoio</span>
                    </div>
                </TableHead>
                <TableHead className="text-center">
                    <div className="flex flex-col items-center gap-1">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">Corrida</span>
                    </div>
                </TableHead>
                <TableHead className="text-center bg-muted/20 w-[120px]">
                    Média Final
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tafsPorAno[ano].map((taf) => (
                <TableRow key={taf.id}>
                  <TableCell className="font-medium">
                    {taf.bimestre}º Bimestre
                    <div className="text-[10px] text-muted-foreground font-normal">
                        {new Date(taf.dataRealizacao).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="font-bold">{taf.abdominalQtd} <span className="text-[10px] font-normal text-muted-foreground">rep</span></div>
                    <div className={`text-xs ${taf.abdominalNota < 6 ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                        Nota {taf.abdominalNota.toFixed(1)}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="font-bold">
                        {taf.apoioValor} 
                        <span className="text-[10px] font-normal text-muted-foreground">
                            {taf.apoioTipo === 'BARRA' ? ' seg' : ' rep'}
                        </span>
                    </div>
                    <div className="text-[10px] uppercase text-muted-foreground mb-0.5">{taf.apoioTipo}</div>
                    <div className={`text-xs ${taf.apoioNota < 6 ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                        Nota {taf.apoioNota.toFixed(1)}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="font-bold">{formatarTempo(taf.corridaTempo)}</div>
                    <div className={`text-xs ${taf.corridaNota < 6 ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                        Nota {taf.corridaNota.toFixed(1)}
                    </div>
                  </TableCell>

                  <TableCell className="text-center bg-muted/10">
                    <div className={`text-xl font-bold ${taf.mediaFinal < 6 ? 'text-red-600' : 'text-blue-600'}`}>
                        {taf.mediaFinal.toFixed(1)}
                    </div>
                    {taf.mediaFinal >= 6 ? (
                         <Badge variant="default" className="text-[10px] h-5 bg-green-600 hover:bg-green-700">Aprovado</Badge>
                    ) : (
                         <Badge variant="destructive" className="text-[10px] h-5">Reprovado</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  )
}