import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSearch, Eye } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { StatusParte } from "@prisma/client";
import { redirect } from "next/navigation";


async function getPartesParaAnalise() {
   
    const partes = await prisma.parte.findMany({
        where: {
            status: 'ENVIADA',
        },
        include: {
            autor: true, 
        },
        orderBy: {
            dataEnvio: 'asc', 
        }
    });
    return partes;
}

export default async function AdminPartesPage() {
    
    const user = await getCurrentUser();
    if (user?.role !== 'ADMIN') {
        redirect('/'); 
    }

    const partesParaAnalise = await getPartesParaAnalise();

    return (
        <div className="container mx-auto py-10 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <FileSearch className="w-8 h-8 text-foreground" />
                    <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Partes</h1>
                </div>
              
            </div>

            <div className="border rounded-lg overflow-hidden">
                 <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-foreground">Partes Aguardando Análise</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {partesParaAnalise.length} parte(s) pendente(s) de análise.
                    </p>
                </div>

                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[250px] font-semibold">Aluno</TableHead>
                                <TableHead className="font-semibold">Assunto</TableHead>
                                <TableHead className="w-[200px] font-semibold">Data de Envio</TableHead>
                                <TableHead className="text-right w-[120px] font-semibold">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partesParaAnalise.map((parte) => (
                                <TableRow key={parte.id}>
                                    <TableCell className="font-medium">
                                        {parte.autor.nomeDeGuerra || parte.autor.nome}
                                    </TableCell>
                                    <TableCell>{parte.assunto}</TableCell>
                                    <TableCell>
                                        {parte.dataEnvio 
                                            ? new Date(parte.dataEnvio).toLocaleString('pt-BR') 
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/partes/${parte.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="mr-2 h-4 w-4" />
                                                Analisar
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {partesParaAnalise.length === 0 && (
                    <div className="text-center p-10 text-muted-foreground">
                        Nenhuma parte aguardando análise no momento.
                    </div>
                )}
            </div>
        </div>
    );
}