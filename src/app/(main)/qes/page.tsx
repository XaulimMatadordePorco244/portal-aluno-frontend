import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Download, FileText } from 'lucide-react';
import { getCurrentUserWithRelations } from '@/lib/auth';

async function getQESList() {
  return await prisma.qES.findMany({
    orderBy: { dataInicio: 'desc' }, 
  });
}

export default async function AlunoQESPage() {
  const qesList = await getQESList();
  const user = await getCurrentUserWithRelations();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Quadro de Estudo Semanal</h1>
        <p className="text-muted-foreground">
          {user?.nomeDeGuerra ? `Aspirante ${user.nomeDeGuerra}, ` : ''}
          aqui estão todos os QES publicados.
        </p>
      </div>

      {qesList.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {qesList.map((qes) => (
            <Card key={qes.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{qes.titulo}</CardTitle>
                    <CardDescription>
                      Período: {new Date(qes.dataInicio).toLocaleDateString('pt-BR')} a {new Date(qes.dataFim).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="grow flex items-end">
                <Button asChild className="w-full">
                  <Link href={qes.arquivoUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Visualizar PDF
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
          <p className="text-muted-foreground">Nenhum Quadro de Estudo Semanal foi publicado ainda.</p>
        </div>
      )}
    </div>
  );
}