import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import prisma from '@/lib/prisma'

import { VisualizarAlunosDialog } from '@/app/admin/vagas/visualizar-alunos' 

export default async function QuadroVagasAlunoPage() {
  const vagasDefinidas = await prisma.quadroVagasAntiguidade.findUnique({
    where: { id: "singleton" }
  }) || {
    superiores: 3, intermediarios: 3, subalternos: 9,
    subtenentes: 3, sargentos: 8, cabos: 4, soldados: 30
  }

  const alunosAntiguidade = await prisma.perfilAluno.findMany({
    where: {
      usuario: { status: 'ATIVO' },
      modalidadeUltimaPromocao: 'ANTIGUIDADE'
    },
    include: {
      cargo: true,
      companhia: true,
      usuario: { select: { nome: true, fotoUrl: true, nomeDeGuerra: true } }
    }
  })

  type AlunoComRelacoes = typeof alunosAntiguidade[number]

  const grupos: Record<string, AlunoComRelacoes[]> = {
    superiores: [], intermediarios: [], subalternos: [],
    subtenentes: [], sargentos: [], cabos: [], soldados: []
  }

  alunosAntiguidade.forEach(aluno => {
    const cargo = aluno.cargo
    if (!cargo) return

    if (cargo.classe === 'SUPERIOR') grupos.superiores.push(aluno)
    else if (cargo.classe === 'INTERMEDIARIO') grupos.intermediarios.push(aluno)
    else if (cargo.classe === 'SUBALTERNO') grupos.subalternos.push(aluno)

    else if (cargo.abreviacao === 'ST') grupos.subtenentes.push(aluno)
    else if (['1º SGT', '2º SGT', '3º SGT'].includes(cargo.abreviacao)) grupos.sargentos.push(aluno)
    else if (cargo.abreviacao === 'CB') grupos.cabos.push(aluno)
    else if (['SD', 'SD 1C', 'SD 2C'].includes(cargo.abreviacao)) grupos.soldados.push(aluno)
  })

  const renderRow = (categoria: string, chave: string, limite: number) => {
    const listaAlunos = grupos[chave]
    const uso = listaAlunos.length
    const livres = limite - uso
    const isCheio = livres <= 0

    const alunosFormatados = listaAlunos.map(aluno => ({
      ...aluno,
      numero: aluno.numero ? parseInt(aluno.numero, 10) : null
    }))

    return (
      <TableRow key={categoria} className="hover:bg-muted/30 transition-colors">
        <TableCell className="font-medium uppercase">{categoria}</TableCell>
        <TableCell className="text-center text-muted-foreground">{limite}</TableCell>
        <TableCell className="text-center font-bold text-primary">{uso}</TableCell>
        <TableCell className="text-center">
          {isCheio ? (
            <Badge variant="destructive" className="shadow-sm">QUADRO CHEIO</Badge>
          ) : (
            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white">
              {livres} LIVRE{livres > 1 ? 'S' : ''}
            </Badge>
          )}
        </TableCell>
        <TableCell className="text-right">
          <VisualizarAlunosDialog titulo={categoria} alunos={alunosFormatados} />
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      <div className="flex flex-col gap-1.5 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Quadro de Vagas</h1>
        <p className="text-muted-foreground">
          Acompanhe a disponibilidade de vagas e o efetivo atual para promoções por antiguidade.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-red-600/20 shadow-sm overflow-hidden">
          <CardHeader className="bg-red-600/90 text-white">
            <CardTitle className="text-lg flex items-center justify-between">
              Oficiais
              <span className="text-sm font-normal bg-red-700/50 px-2 py-0.5 rounded-md">
                Total: {vagasDefinidas.superiores + vagasDefinidas.intermediarios + vagasDefinidas.subalternos}
              </span>
            </CardTitle>
            <CardDescription className="text-red-100/80">
              Distribuição do efetivo nos postos
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[140px]">Categoria</TableHead>
                  <TableHead className="text-center">Vagas</TableHead>
                  <TableHead className="text-center">Ocupadas</TableHead>
                  <TableHead className="text-center w-[120px]">Status</TableHead>
                  <TableHead className="text-right">Ocupantes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderRow('Superiores', 'superiores', vagasDefinidas.superiores)}
                {renderRow('Intermediários', 'intermediarios', vagasDefinidas.intermediarios)}
                {renderRow('Subalternos', 'subalternos', vagasDefinidas.subalternos)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-blue-600/20 shadow-sm overflow-hidden">
          <CardHeader className="bg-blue-600/90 text-white">
            <CardTitle className="text-lg flex items-center justify-between">
              Praças
              <span className="text-sm font-normal bg-blue-700/50 px-2 py-0.5 rounded-md">
                Total: {vagasDefinidas.subtenentes + vagasDefinidas.sargentos + vagasDefinidas.cabos + vagasDefinidas.soldados}
              </span>
            </CardTitle>
            <CardDescription className="text-blue-100/80">
              Distribuição do efetivo nas graduações
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[140px]">Categoria</TableHead>
                  <TableHead className="text-center">Vagas</TableHead>
                  <TableHead className="text-center">Ocupadas</TableHead>
                  <TableHead className="text-center w-[120px]">Status</TableHead>
                  <TableHead className="text-right">Ocupantes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderRow('Subtenentes', 'subtenentes', vagasDefinidas.subtenentes)}
                {renderRow('Sargentos', 'sargentos', vagasDefinidas.sargentos)}
                {renderRow('Cabos', 'cabos', vagasDefinidas.cabos)}
                {renderRow('Soldados', 'soldados', vagasDefinidas.soldados)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}