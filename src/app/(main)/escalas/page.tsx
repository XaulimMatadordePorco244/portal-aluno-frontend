import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileDown, Scale } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type PageProps = {
  searchParams: Promise<{
    filtro?: 'minhas' | 'todas';
  }>;
};
async function getEscalasAluno(userId: string, filtro: 'minhas' | 'todas' = 'todas') {
  const whereClause: Prisma.EscalaWhereInput = {
    status: 'PUBLICADA',
  };

  if (filtro === 'minhas') {
    whereClause.itens = {
      some: {
        alunoId: userId,
      },
    };
  }

  const escalas = await prisma.escala.findMany({
    where: whereClause,
    orderBy: {
      dataEscala: 'desc',
    },
    include: {
      _count: {
        select: { itens: true },
      },
    },
  });

  return escalas;
}


export default async function AlunoEscalasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return <p className="text-center p-10">Você precisa estar logado para ver as escalas.</p>;
  }


  const userId = user.userId;
  const filtroAtual = params.filtro || 'todas';
  const escalas = await getEscalasAluno(userId, filtroAtual);

  return (
    <>
      <div className="w-9/10 mx-auto py-10">
        <div className="flex justify-between items-center mb-8 ">
          <div className="flex items-center gap-3">
            <Scale className="w-8 h-8 text-foreground" />
            <h1 className="text-3xl font-bold text-foreground">Escalas de Serviço</h1>
          </div>

          <div className="flex gap-2">
            <Link href="/escalas?filtro=todas">
              <Button variant={filtroAtual === 'todas' ? 'default' : 'outline'}>
                Todas as Escalas
              </Button>
            </Link>
            <Link href="/escalas?filtro=minhas">
              <Button variant={filtroAtual === 'minhas' ? 'default' : 'outline'}>
                Minhas Escalas
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {escalas.map(escala => {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const dataDaEscala = new Date(escala.dataEscala);
            const isConcluida = dataDaEscala < hoje;

            return (
              <Card key={escala.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="capitalize">
                        {escala.tipo.toLowerCase()}
                      </CardTitle>
                      <CardDescription>
                        {format(dataDaEscala, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </CardDescription>
                    </div>
                    <Badge variant={isConcluida ? 'secondary' : 'default'}>
                      {isConcluida ? 'Concluída' : 'Disponível'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {escala._count.itens} alunos escalados. Elaborado por: {escala.elaboradoPor}.
                  </p>

                  {escala.pdfUrl ? (
                    <a href={escala.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">
                        <FileDown className="mr-2 h-4 w-4" />
                        Visualizar / Baixar PDF
                      </Button>
                    </a>
                  ) : (
                    <Button variant="outline" disabled>
                      <FileDown className="mr-2 h-4 w-4" />
                      PDF Indisponível
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {escalas.length === 0 && (
            <div className="text-center p-20 bg-card rounded-lg border">
              <p className="text-muted-foreground">
                {filtroAtual === 'minhas'
                  ? "Você não está em nenhuma escala publicada no momento."
                  : "Nenhuma escala publicada foi encontrada."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}