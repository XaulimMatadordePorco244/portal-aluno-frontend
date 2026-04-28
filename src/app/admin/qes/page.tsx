import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QESForm from './qes-form'; 
import { QESListTable } from './qes-list-table'; 

async function getQESList() {
  return await prisma.qES.findMany({
    orderBy: { createdAt: 'desc' },
    include: { autor: true },
  });
}

export default async function AdminQESPage() {
  const qesList = await getQESList();

  return (
    <div className="container mx-auto space-y-8 ">
      <Card>
        <CardHeader>
          <CardTitle>Enviar Novo QES</CardTitle>
          <CardDescription>
            Faça o upload do Quadro de Estudo Semanal em formato PDF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QESForm /> 
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>QES Publicados</CardTitle>
        </CardHeader>
        <CardContent>
          <QESListTable data={qesList} />
        </CardContent>
      </Card>
    </div>
  );
}