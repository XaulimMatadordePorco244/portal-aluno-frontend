import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSearch, Eye } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Parte, StatusParte } from "@prisma/client";
import { redirect } from "next/navigation";
import { PartesFilters } from "./Filters"; 
import { Button } from "@/components/ui/Button";

type SearchParams = {
    search?: string;
    status?: StatusParte;
};

async function getPartes(searchParams: SearchParams) {
    const { search, status } = searchParams;

    const whereClause: any = {};

    if (status) {
        whereClause.status = status;
    }

    if (search) {
        whereClause.OR = [
            { assunto: { contains: search, mode: 'insensitive' } },
            { autor: { nome: { contains: search, mode: 'insensitive' } } },
            { autor: { nomeDeGuerra: { contains: search, mode: 'insensitive' } } },
        ];
    }
    
    const partes = await prisma.parte.findMany({
        where: whereClause,
        include: { autor: true },
        orderBy: { createdAt: 'desc' }
    });
    return partes;
}



export default async function AdminPartesPage({ searchParams }: { searchParams: SearchParams }) {
    const user = await getCurrentUser();
    if (user?.role !== 'ADMIN') {
        redirect('/');
    }

    const partes = await getPartes(searchParams);

    return (
        <div className="container mx-auto py-10 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <FileSearch className="w-8 h-8 text-foreground" />
                    <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Partes</h1>
                </div>
            </div>
            
      
            <PartesFilters />

            <div className="border rounded-lg overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[250px] font-semibold">Aluno</TableHead>
                                <TableHead className="font-semibold">Assunto</TableHead>
                                <TableHead className="w-[150px] font-semibold">Status</TableHead>
                                <TableHead className="w-[200px] font-semibold">Data de Criação</TableHead>
                                <TableHead className="text-right w-[120px] font-semibold">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partes.map((parte) => (
                                <TableRow key={parte.id}>
                                    <TableCell className="font-medium">
                                        {parte.autor.nomeDeGuerra || parte.autor.nome}
                                    </TableCell>
                                    <TableCell>{parte.assunto}</TableCell>
                                    <TableCell>
                                        <Badge variant={parte.status === 'ENVIADA' ? 'default' : parte.status === 'RASCUNHO' ? 'outline' : 'secondary'}>
                                            {parte.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(parte.createdAt).toLocaleString('pt-BR')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/partes/${parte.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="mr-2 h-4 w-4" />
                                                Ver / Analisar
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {partes.length === 0 && (
                    <div className="text-center p-10 text-muted-foreground">
                        Nenhuma parte encontrada com os filtros atuais.
                    </div>
                )}
            </div>
        </div>
    );
}