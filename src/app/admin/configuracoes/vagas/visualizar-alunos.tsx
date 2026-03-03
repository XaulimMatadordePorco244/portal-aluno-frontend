'use client'

import React from 'react'
import Image from 'next/image'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye } from 'lucide-react'

interface Aluno {
  id: string
  numero: number | null
  nomeDeGuerra: string | null
  cargo?: { abreviacao: string } | null
  companhia?: { abreviacao: string | null } | null
  usuario: {
    nome: string
    fotoUrl: string | null
  }
}

interface Props {
  titulo: string
  alunos: Aluno[]
}

export function VisualizarAlunosDialog({ titulo, alunos }: Props) {
  const alunosOrdenados = [...alunos].sort((a, b) => 
    (a.numero || 9999) - (b.numero || 9999)
  )

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Ver {titulo}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-6 overflow-hidden">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-2xl">Ocupantes - {titulo}</SheetTitle>
        </SheetHeader>

        <div className="border rounded-md flex-1 overflow-y-auto bg-card shadow-inner">
          <Table>
            <TableHeader className="bg-muted/80 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
              <TableRow>
                <TableHead className="w-20 text-center">Nº</TableHead>
                <TableHead>Identificação</TableHead>
                <TableHead className="w-32 text-center">CIA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alunosOrdenados.length > 0 ? (
                alunosOrdenados.map((aluno) => (
                  <TableRow key={aluno.id} className="hover:bg-muted/30">
                    
                    <TableCell className="text-center font-bold text-muted-foreground text-base">
                      {aluno.numero ? String(aluno.numero).padStart(3, '0') : '-'}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-4">
                        
                        <HoverCard openDelay={100} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <Avatar className="h-12 w-12 border-2 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                              <AvatarImage src={aluno.usuario.fotoUrl || undefined} />
                              <AvatarFallback>{aluno.usuario.nome.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                          </HoverCardTrigger>
                          
                          {aluno.usuario.fotoUrl && (
                            <HoverCardContent side="left" align="center" className="w-64 p-2 shadow-2xl border-primary border-2 bg-muted/50 backdrop-blur-md">
                              <div className="relative w-full aspect-3/4 rounded-sm overflow-hidden">
                                <Image
                                  src={aluno.usuario.fotoUrl}
                                  alt={`Foto de ${aluno.usuario.nome}`}
                                  fill
                                  sizes="256px"
                                  className="object-cover"
                                />
                              </div>
                            </HoverCardContent>
                          )}
                        </HoverCard>

                        <div className="flex flex-col">
                          <span className="font-bold text-base flex items-center gap-2">
                            {aluno.cargo?.abreviacao || 'AL'} GM {aluno.nomeDeGuerra || aluno.usuario.nome.split(' ')[0]}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={aluno.usuario.nome}>
                            {aluno.usuario.nome}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-sm px-2 py-0.5">
                        {aluno.companhia?.abreviacao || '-'}
                      </Badge>
                    </TableCell>

                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-48 text-center text-muted-foreground text-lg">
                    Nenhum aluno ocupando vaga.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </SheetContent>
    </Sheet>
  )
}