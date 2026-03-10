import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import prisma from '@/lib/prisma'

import { EditarVagasDialog } from './editar-vagas-dialog'
import { VisualizarAlunosDialog } from './visualizar-alunos'

export default async function QuadroVagasPage() {
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
      <TableRow key={categoria}>
        <TableCell className="font-medium uppercase">{categoria}</TableCell>
        <TableCell className="text-center">{limite}</TableCell>
        <TableCell className="text-center font-bold text-primary">{uso}</TableCell>
        <TableCell className="text-center">
          {isCheio ? (
            <Badge variant="destructive">QUADRO CHEIO</Badge>
          ) : (
            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
              {livres} LIVRES
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
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quadro de Vagas - Antiguidade</h1>
          <p className="text-muted-foreground">Controle de limites para promoções por critério de antiguidade.</p>
        </div>

        <EditarVagasDialog vagasAtuais={vagasDefinidas} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-red-600 text-white rounded-t-lg">
            <CardTitle className="text-lg">OFICIAIS (Total: {vagasDefinidas.superiores + vagasDefinidas.intermediarios + vagasDefinidas.subalternos})</CardTitle>
            <CardDescription className="text-red-100">Postos baseados na Classe</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-center">Vagas</TableHead>
                  <TableHead className="text-center">Ocupadas</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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

        <Card>
          <CardHeader className="bg-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-lg">PRAÇAS (Total: {vagasDefinidas.subtenentes + vagasDefinidas.sargentos + vagasDefinidas.cabos + vagasDefinidas.soldados})</CardTitle>
            <CardDescription className="text-blue-100">Graduações baseadas no Cargo</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-center">Vagas</TableHead>
                  <TableHead className="text-center">Ocupadas</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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