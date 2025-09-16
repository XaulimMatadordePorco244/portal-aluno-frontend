// src/app/(main)/my-reports/page.tsx

import { Button } from "@/components/ui/Button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PlusCircle, FileText, Download } from "lucide-react";


const partesAnteriores = [
    { id: 1, numero: "DOC-0152-2025", assunto: "Justificativa de falta", data: "07/09/2025" },
    { id: 2, numero: "DOC-0148-2025", assunto: "Solicitação de troca de escala", data: "25/08/2025" },
    { id: 3, numero: "DOC-0133-2025", assunto: "Comunicação de avaria em material", data: "12/07/2025" },
];

export default function MyReportsPage() {
    return (
   
        <div className="container mx-auto py-10 max-w-5xl">

            {}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-gray-700" />
                    <h1 className="text-3xl font-bold text-gray-800">Minhas Partes</h1>
                </div>
                <a href="/generate-report">
                    <Button size="lg" className="cursor-pointer"> {}
                        <PlusCircle className="mr-2 h-5 w-5 " />
                        Criar Nova Parte
                    </Button>
                </a>
            </div>

            {}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Histórico de Documentos</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Aqui estão todas as partes que você já registrou no sistema.
                    </p>
                </div>
  
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {}
                                <TableHead className="w-[220px] font-semibold">Nº do Documento</TableHead>
                                <TableHead className="font-semibold">Assunto</TableHead>
                                <TableHead className="w-[150px] font-semibold">Data</TableHead>
                                <TableHead className="text-right w-[200px] font-semibold">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partesAnteriores.map((parte) => (
                                <TableRow key={parte.id}>
                                    {}
                                    <TableCell className="font-mono font-medium">{parte.numero}</TableCell>
                                    <TableCell>{parte.assunto}</TableCell>
                                    <TableCell>{parte.data}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">
                                            <Download className="mr-2 h-4 w-4" />
                                            Baixar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {partesAnteriores.length === 0 && (
                        <div className="text-center p-10 text-gray-500">
                            Você ainda não criou nenhuma parte.
                        </div>
                    )}
            </div>
        </div>
    );
}