import { Metadata } from 'next'
import Link from 'next/link'
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Eye, FileSpreadsheet, PlusCircle } from 'lucide-react'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Gestão de TAF',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TafDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams
  
  const anoAtual = new Date().getFullYear()
  const anoSelecionado = Number(params.ano) || anoAtual
  const bimestreSelecionado = Number(params.bimestre) || 1

  const alunos = await prisma.perfilAluno.findMany({
    where: { 
      usuario: { status: 'ATIVO' }
    }, 
    orderBy: { nomeDeGuerra: 'asc' },
    include: {
      usuario: true,
      tafs: {
        where: {
          anoLetivo: anoSelecionado,
          bimestre: bimestreSelecionado
        }
      }
    }
  })

  const totalAlunos = alunos.length
  const realizados = alunos.filter(a => a.tafs.length > 0).length
  const pendentes = totalAlunos - realizados
  const aprovados = alunos.filter(a => a.tafs.length > 0 && a.tafs[0].mediaFinal >= 6).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel TAF</h1>
            <p className="text-muted-foreground">Visão geral do condicionamento físico da tropa.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href="/admin/taf/tabela">
                    <Settings className="mr-2 h-4 w-4" /> Configurar Tabela
                </Link>
            </Button>
            
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-4 flex flex-wrap gap-4 items-end">
            <form className="flex gap-4 items-end w-full">
                <div className="space-y-2 w-32">
                    <span className="text-sm font-medium">Ano Letivo</span>
                    <div className="border rounded bg-background px-3 py-2 text-sm">{anoSelecionado}</div>
                </div>
                
                <div className="space-y-2 w-40">
                    <span className="text-sm font-medium">Bimestre</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map(b => (
                            <Button 
                                key={b} 
                                variant={bimestreSelecionado === b ? "default" : "outline"}
                                size="sm"
                                asChild
                            >
                                <Link href={`/admin/taf?ano=${anoSelecionado}&bimestre=${b}`}>
                                    {b}º
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Alunos</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{totalAlunos}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-600">Realizados</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{realizados}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-orange-600">Pendentes</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-orange-600">{pendentes}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-blue-600">Aprovados</CardTitle></CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                    {aprovados} 
                    <span className="text-xs text-muted-foreground ml-2 font-normal">
                        ({realizados > 0 ? ((aprovados/realizados)*100).toFixed(0) : 0}%)
                    </span>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="text-center">Abdominal</TableHead>
                    <TableHead className="text-center">Apoio</TableHead>
                    <TableHead className="text-center">Corrida</TableHead>
                    <TableHead className="text-center">Média Final</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {alunos.map(aluno => {
                    const taf = aluno.tafs[0] 
                    return (
                        <TableRow key={aluno.id}>
                            <TableCell>
                                <div className="font-medium">{aluno.nomeDeGuerra || 'Sem nome de guerra'}</div>
                                <div className="text-xs text-muted-foreground uppercase">{aluno.usuario?.genero || 'N/A'}</div>
                            </TableCell>
                            
                            <TableCell>
                                {taf ? (
                                    <Badge variant={taf.mediaFinal >= 6 ? "default" : "destructive"}>
                                        {taf.mediaFinal >= 6 ? "Aprovado" : "Reprovado"}
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-muted-foreground">Pendente</Badge>
                                )}
                            </TableCell>

                            <TableCell className="text-center text-sm">
                                {taf ? (
                                    <div className="flex flex-col">
                                        <span>{taf.abdominalQtd} rep</span>
                                        <span className="text-[10px] text-muted-foreground">Nota {taf.abdominalNota}</span>
                                    </div>
                                ) : '-'}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                                {taf ? (
                                    <div className="flex flex-col">
                                        <span>{taf.apoioValor} {taf.apoioTipo === 'BARRA' ? 's' : 'rep'}</span>
                                        <span className="text-[10px] text-muted-foreground">Nota {taf.apoioNota}</span>
                                    </div>
                                ) : '-'}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                                {taf ? (
                                    <div className="flex flex-col">
                                        <span>{Math.floor(taf.corridaTempo / 60)}:{String(taf.corridaTempo % 60).padStart(2, '0')}</span>
                                        <span className="text-[10px] text-muted-foreground">Nota {taf.corridaNota}</span>
                                    </div>
                                ) : '-'}
                            </TableCell>
                            <TableCell className="text-center">
                                {taf ? (
                                    <span className={`font-bold ${taf.mediaFinal >= 6 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {taf.mediaFinal.toFixed(1)}
                                    </span>
                                ) : '-'}
                            </TableCell>

                            <TableCell className="text-right">
                                {taf ? (
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/admin/alunos/${aluno.id}`}>
                                            <Eye className="w-4 h-4 mr-1" /> Ver
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/alunos/${aluno.id}/taf/novo`}>
                                            <PlusCircle className="w-4 h-4 mr-1" /> Lançar
                                        </Link>
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
      </div>
    </div>
  )
}