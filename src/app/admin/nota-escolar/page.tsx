import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { FileEdit } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BoletimFiltros from './boletim-filtros';

export const metadata: Metadata = {
  title: 'Admin - Monitoramento Escolar',
};

const NotaBadge = ({ nota }: { nota: number | null | undefined }) => {
  if (nota === null || nota === undefined) {
    return <span className="text-muted-foreground text-xs">-</span>;
  }
  const colorClass = nota < 6
    ? "text-red-600 font-bold bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded"
    : "text-blue-600 dark:text-blue-400 font-medium";

  return <span className={colorClass}>{nota.toFixed(1)}</span>;
};

export default async function NotasEscolaresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cia?: string; ano?: string }>;
}) {
  const user = await getCurrentUserWithRelations();
  if (!user || !canAccessAdminArea(user)) redirect('/dashboard');

  const params = await searchParams;
  const busca = params.q || '';
  const ciaFilter = params.cia && params.cia !== 'todas' ? params.cia : undefined;
  const anoAtual = parseInt(params.ano || new Date().getFullYear().toString());

  const companhias = await prisma.companhia.findMany({
    orderBy: { nome: 'asc' },
    select: { id: true, abreviacao: true }
  }).then(companhias => companhias.filter(c => c.abreviacao !== null) as { id: string; abreviacao: string }[]);

  const alunos = await prisma.perfilAluno.findMany({
    where: {
      companhiaId: ciaFilter,
      usuario: {
        status: 'ATIVO',
        nome: { contains: busca }
      },
    },
    include: {
      usuario: true,
      companhia: true,
      cargo: true,
      desempenhosEscolares: {
        where: { anoLetivo: anoAtual }
      }
    },
    orderBy: [
      { cargo: { precedencia: 'asc' } },
      { dataUltimaPromocao: 'asc' },
      { numero: 'asc' }
    ]
  });


  const dadosProcessados = alunos.map(aluno => {
    const boletim = aluno.desempenhosEscolares[0];

    return {
      usuario: aluno.usuario,
      companhia: aluno.companhia,
      cargo: aluno.cargo,
      boletim,
      id: aluno.id,
      nomeDeGuerra: aluno.usuario.nomeDeGuerra
    };
  });


  return (
    <div className="mx-auto space-y-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoramento Escolar</h1>
          <p className="text-muted-foreground">Acompanhamento de desempenho acadêmico - Ano {anoAtual}</p>
        </div>
      </div>

      <BoletimFiltros companhias={companhias} />

      <div className="border rounded-lg bg-card shadow-sm pb-2">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[300px]">Aluno</TableHead>
              <TableHead>Companhia</TableHead>
              <TableHead className="text-center w-16">1º Bim</TableHead>
              <TableHead className="text-center w-16">2º Bim</TableHead>
              <TableHead className="text-center w-16">3º Bim</TableHead>
              <TableHead className="text-center w-16">4º Bim</TableHead>
              <TableHead className="text-center w-20 bg-muted/30 font-bold">M. Final</TableHead>
              <TableHead className="text-center w-16">Faltas</TableHead>
              <TableHead className="text-center w-24">Situação</TableHead>
              <TableHead className="text-right w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dadosProcessados.map(({ usuario, companhia, cargo, boletim, id, nomeDeGuerra }) => (
              <TableRow key={id} className="hover:bg-muted/5">
                <TableCell>
                  <div className="flex items-center gap-3">

                    <div className="relative group/foto cursor-pointer">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={usuario.fotoUrl || undefined} />
                        <AvatarFallback>{usuario.nome.substring(0, 2)}</AvatarFallback>
                      </Avatar>

                      {usuario.fotoUrl && (
                        <div className="absolute left-12 top-1/2 -translate-y-1/2 z-50 hidden group-hover/foto:block">
                          <div className="relative w-32 h-44 md:w-48 md:h-64 rounded-md border-2 border-primary shadow-2xl bg-muted overflow-hidden">
                            <Image
                              src={usuario.fotoUrl}
                              alt={`Foto de ${usuario.nome}`}
                              fill
                              sizes="(max-width: 768px) 128px, 192px"
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="font-medium text-sm flex items-center gap-1.5">
                        {nomeDeGuerra ? `${cargo?.abreviacao || 'AL'} GM ${nomeDeGuerra}` : usuario.nome}
                      </span>
                      <span className="text-xs text-muted-foreground truncate ">{usuario.nome}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="outline" className="text-xs font-normal">
                    {companhia?.abreviacao || '-'}
                  </Badge>
                </TableCell>

                <TableCell className="text-center border-l"><NotaBadge nota={boletim?.mediaB1} /></TableCell>
                <TableCell className="text-center border-l"><NotaBadge nota={boletim?.mediaB2} /></TableCell>
                <TableCell className="text-center border-l"><NotaBadge nota={boletim?.mediaB3} /></TableCell>
                <TableCell className="text-center border-l"><NotaBadge nota={boletim?.mediaB4} /></TableCell>

                <TableCell className="text-center border-l bg-muted/10 font-bold text-base">
                  <NotaBadge nota={boletim?.mediaFinal} />
                </TableCell>

                <TableCell className="text-center text-muted-foreground text-sm">
                  {boletim?.totalFaltas || 0}
                </TableCell>

                <TableCell className="text-center">
                  {boletim ? (
                    <Badge className="text-[10px]" variant={
                      boletim.situacao === 'APROVADO' ? 'default' :
                        boletim.situacao === 'REPROVADO' ? 'destructive' : 'secondary'
                    }>
                      {boletim.situacao}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <Link href={`/admin/alunos/${id}/boletim`}>
                      <FileEdit className="h-4 w-4 text-primary" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {dadosProcessados.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  Nenhum aluno encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}