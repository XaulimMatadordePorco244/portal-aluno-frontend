import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import QESForm from './qes-form'; 

async function getQESList() {
  return await prisma.qES.findMany({
    orderBy: { createdAt: 'desc' },
    include: { autor: true },
  });
}

export default async function AdminQESPage() {
  const qesList = await getQESList();

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-7xl">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Data de Publicação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qesList.map((qes) => (
                <TableRow key={qes.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500"/>
                    {qes.titulo}
                  </TableCell>
                  <TableCell>
                    {new Date(qes.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={qes.arquivoUrl} target="_blank">
                        <Download className="h-4 w-4 mr-2"/>
                        Baixar
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
               {qesList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Nenhum QES publicado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}