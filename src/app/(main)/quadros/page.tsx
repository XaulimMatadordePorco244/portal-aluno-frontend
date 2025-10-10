import prisma from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";

async function getCargosDoQuadro() {
    return await prisma.cargo.findMany({
        where: {
            categoria: 'QUADRO',
        },
        orderBy: {
            precedencia: 'asc'
        }
    });
}

export default async function HierarquiaPage() {
    const todosCargos = await getCargosDoQuadro();

    const oficiais = todosCargos.filter(c => c.tipo === 'POSTO');
    const pracas = todosCargos.filter(c => c.tipo === 'GRADUACAO');

    return (
        <div className="container mx-auto py-10 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Hierarquia e Divisas</h1>
                <p className="text-muted-foreground">Consulte a hierarquia, abreviações e divisas dos cargos da Guarda Mirim.</p>
            </div>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold flex items-center gap-3 mb-4">
                    Quadro de Oficiais (QOGM)
                </h2>

      
                <div className="relative w-full overflow-auto border rounded-lg ">
                    <Table className="bg-card">
                        <TableHeader className="bg-muted">
                            <TableRow>
                               <TableHead className="w-[300px] align-middle text-center border-r">Posto</TableHead>
                               <TableHead className="w-[280px] align-middle border-r text-center">Abreviação</TableHead>
                               <TableHead className="w-[250px] align-middle border-r text-center">Número</TableHead>
                               <TableHead className="align-middle text-center">Divisa</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {oficiais.map(cargo => (
                                <TableRow key={cargo.id}>
                                    <TableCell className="font-medium whitespace-nowrap border-r text-center">{cargo.nome}</TableCell>
                                    <TableCell className="border-r text-center">{cargo.abreviacao}</TableCell>
                                    <TableCell className="border-r text-center">
                                        {cargo.codigo ? String(cargo.codigo).padStart(2, '0') : '-'}
                                    </TableCell>
                                    <TableCell className="flex items-center justify-center">
                                        <div className="w-40 h-16 bg-muted/50 rounded-md flex items-center justify-center ">
                                            {cargo.divisaUrl ? (
                                                <Image src={cargo.divisaUrl} alt={`Divisa de ${cargo.nome}`} width={100} height={64} style={{ objectFit: 'contain' }} />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Sem imagem</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold flex items-center gap-3 mb-4">
                    Quadro de Praças (QPGM)
                </h2>
                <div className="relative w-full overflow-auto border rounded-lg ">
                    <Table className="bg-card">
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead className="w-[300px] align-middle text-center border-r">Graduação</TableHead>
                                <TableHead className="w-[280px] align-middle border-r text-center">Abreviação</TableHead>
                                <TableHead className="w-[250px] align-middle border-r text-center">Número</TableHead>
                                <TableHead className="align-middle text-center">Divisa</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pracas.map(cargo => (
                                <TableRow key={cargo.id}>
                                    <TableCell className="font-medium whitespace-nowrap border-r text-center">
                                        <div>
                                            <span>{cargo.nome}</span>
                                            {cargo.nome.toUpperCase() === 'ASPIRANTE' && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    (Praça em situação especial)
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="border-r text-center">{cargo.abreviacao}</TableCell>
                                    <TableCell className="border-r text-center">
                                        {cargo.codigo ? String(cargo.codigo).padStart(2, '0') : '-'}
                                    </TableCell>
                                    <TableCell className="flex items-center justify-center">
                                        <div className="w-40 h-16 bg-muted/50 rounded-md flex items-center justify-center">
                                            {cargo.divisaUrl ? (
                                                <Image src={cargo.divisaUrl} alt={`Divisa de ${cargo.nome}`} width={100} height={64} style={{ objectFit: 'contain' }} />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Sem imagem</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </section>
        </div>
    );
}