import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, FileText, Eye } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Badge, badgeVariants } from "@/components/ui/badge"; 
import { StatusParte } from "@prisma/client";
import { VariantProps } from "class-variance-authority";


type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

async function getMinhasPartes() {
    const user = await getCurrentUser();
    if (!user?.userId) {
        return [];
    }

    const partes = await prisma.parte.findMany({
        where: {
            autorId: user.userId,
        },
        orderBy: {
            createdAt: 'desc',
        }
    });
    return partes;
}


const getStatusVariant = (status: StatusParte): { variant: BadgeVariant, text: string } => {
    switch (status) {
        case 'RASCUNHO':
            return { variant: 'outline', text: 'Rascunho' };
        case 'ENVIADA':
            return { variant: 'default', text: 'Enviada' };
        case 'ANALISADA':
            return { variant: 'secondary', text: 'Analisada' };
                case 'APROVADO':
            return { variant: 'success', text: 'Aprovado' }; 
        case 'REPROVADO':
            return { variant: 'destructive', text: 'Reprovado' };
        default:
            return { variant: 'outline', text: 'Desconhecido' };
    }
};

export default async function MinhasPartesPage() {
    const minhasPartes = await getMinhasPartes();

    return (
        <div className="container mx-auto py-10 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-foreground" />
                    <h1 className="text-3xl font-bold text-foreground">Minhas Partes</h1>
                </div>
                
                <Link href="/partes/nova">
                    <Button size="lg">
                        <PlusCircle className="mr-2 h-5 w-5 " />
                        Criar Nova Parte
                    </Button>
                </Link>
            </div>

            <div className="border rounded-lg overflow-hidden bg-card">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-foreground">Histórico de Partes</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Aqui estão todas as partes que você já registrou no sistema.
                    </p>
                </div>
                
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px] font-semibold">Nº do Documento</TableHead>
                                <TableHead className="w-[200px] font-semibold">Assunto</TableHead>
                                <TableHead className="w-[150px] font-semibold">Data de Criação</TableHead>
                                <TableHead className="w-[150px] font-semibold">Status</TableHead> 
                                <TableHead className="text-right w-[120px] font-semibold">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {minhasPartes.map((parte) => {
                                const statusInfo = getStatusVariant(parte.status);
                                return (
                                    <TableRow key={parte.id}>
                                        <TableCell className="font-mono">{parte.numeroDocumento || '-'}</TableCell>
                                        <TableCell className="font-medium">{parte.assunto}</TableCell>
                                        <TableCell>{new Date(parte.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                                        <TableCell>
                                                                                        <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/partes/${parte.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Visualizar
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                {minhasPartes.length === 0 && (
                    <div className="text-center p-10 text-muted-foreground">
                        Você ainda não criou nenhuma parte.
                    </div>
                )}
            </div>
        </div>
    );
}