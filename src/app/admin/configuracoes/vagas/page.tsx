import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import prisma from '@/lib/prisma'

import { EditarVagasDialog } from './editar-vagas-dialog'

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
    include: { cargo: true }
  })

  const ocupadas = {
    superiores: 0, intermediarios: 0, subalternos: 0,
    subtenentes: 0, sargentos: 0, cabos: 0, soldados: 0
  }

  alunosAntiguidade.forEach(aluno => {
    const cargo = aluno.cargo
    if (!cargo) return

    if (cargo.classe === 'SUPERIOR') ocupadas.superiores++
    else if (cargo.classe === 'INTERMEDIARIO') ocupadas.intermediarios++
    else if (cargo.classe === 'SUBALTERNO') ocupadas.subalternos++
    
    else if (cargo.abreviacao === 'ST') ocupadas.subtenentes++
    else if (['1º SGT', '2º SGT', '3º SGT'].includes(cargo.abreviacao)) ocupadas.sargentos++
    else if (cargo.abreviacao === 'CB') ocupadas.cabos++
    else if (['SD', 'SD 1C', 'SD 2C'].includes(cargo.abreviacao)) ocupadas.soldados++ 
  })

  const renderRow = (categoria: string, limite: number, uso: number) => {
    const livres = limite - uso
    const isCheio = livres <= 0

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
      </TableRow>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quadro de Vagas - Antiguidade</h1>
          <p className="text-muted-foreground">Controle de limites para promoções por critério de antiguidade.</p>
        </div>
        
        <EditarVagasDialog vagasAtuais={vagasDefinidas} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderRow('Superiores', vagasDefinidas.superiores, ocupadas.superiores)}
                {renderRow('Intermediários', vagasDefinidas.intermediarios, ocupadas.intermediarios)}
                {renderRow('Subalternos', vagasDefinidas.subalternos, ocupadas.subalternos)}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderRow('Subtenentes', vagasDefinidas.subtenentes, ocupadas.subtenentes)}
                {renderRow('Sargentos', vagasDefinidas.sargentos, ocupadas.sargentos)}
                {renderRow('Cabos', vagasDefinidas.cabos, ocupadas.cabos)}
                {renderRow('Soldados', vagasDefinidas.soldados, ocupadas.soldados)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}