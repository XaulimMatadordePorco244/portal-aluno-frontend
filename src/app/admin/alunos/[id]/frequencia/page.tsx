import React from 'react'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function FrequenciaAlunoPage(props: PageProps) {
  const params = await props.params;

  const aluno = await prisma.perfilAluno.findFirst({
    where: { 
      OR: [
        { id: params.id },
        { usuarioId: params.id }
      ]
    },
    include: {
      usuario: true,
      cargo: true,
      companhia: true,
    }
  })

  if (!aluno) {
    notFound()
  }

  const frequencias = await prisma.frequencia.findMany({
    where: { alunoId: aluno.id },
    orderBy: {
      data: 'desc' 
    }
  })

  const totalRegistros = frequencias.length
  const presentes = frequencias.filter(f => f.status === 'PRESENTE').length
  const faltas = frequencias.filter(f => f.status === 'FALTA').length
  const justificadas = frequencias.filter(f => f.status === 'JUSTIFICADA').length

  const porcentagemPresenca = totalRegistros > 0 
    ? Math.round(((presentes + justificadas) / totalRegistros) * 100)
    : 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENTE':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 shadow-sm"><CheckCircle2 className="w-3 h-3 mr-1"/> Presente</Badge>
      case 'FALTA':
        return <Badge variant="destructive" className="shadow-sm"><XCircle className="w-3 h-3 mr-1"/> Falta</Badge>
      case 'JUSTIFICADA':
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 border-amber-500/30 shadow-sm"><AlertCircle className="w-3 h-3 mr-1"/> Justificada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Frequência Detalhada</h1>
        <p className="text-muted-foreground uppercase">
          {aluno.numero ? `${aluno.numero} - ` : ''} 
          {aluno.cargo?.abreviacao || 'AL'} GM {aluno.usuario.nomeDeGuerra || aluno.usuario.nome}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Presença Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${porcentagemPresenca < 75 ? 'text-red-500' : 'text-emerald-500'}`}>
              {porcentagemPresenca}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Mínimo exigido: 75%</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRegistros}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600/80">Faltas Injustificadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{faltas}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600/80">Faltas Justificadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{justificadas}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            Histórico de Chamadas
          </CardTitle>
          <CardDescription>Lista completa de comparecimento do aluno em ordem cronológica.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[140px] pl-6">Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="w-[150px] text-center">Status</TableHead>
                <TableHead className="pr-6">Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {frequencias.length > 0 ? (
                frequencias.map((freq) => (
                  <TableRow key={freq.id} className="hover:bg-muted/30">
                    
                    <TableCell className="font-medium pl-6">
                      {new Date(freq.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-semibold bg-background">
                        {freq.tipo}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {getStatusBadge(freq.status)}
                    </TableCell>
                    
                    <TableCell className="text-muted-foreground text-sm max-w-[250px] truncate pr-6" title={freq.observacao || ''}>
                      {freq.observacao || '-'}
                    </TableCell>
                    
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                    Nenhum registro de frequência encontrado para este aluno.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}