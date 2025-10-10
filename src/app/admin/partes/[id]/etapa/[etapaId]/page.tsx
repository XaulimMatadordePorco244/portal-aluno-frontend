import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ParecerForm } from "./ParecerForm";


async function getEtapaDetails(processoId: string, etapaId: string) {
    const etapa = await prisma.etapaProcesso.findUnique({
        where: { id: etapaId, processoId: processoId },
        include: { processo: true }
    });
    return etapa;
}


export default async function EtapaParecerPage({ params }: { params: { id: string, etapaId: string } }) {

    const etapa = await getEtapaDetails(params.id, params.etapaId);
    if (!etapa) notFound();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-4">
          
                <Link href={`/admin/partes/${etapa.processoId}`} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para a Linha do Tempo do Processo
                </Link>
            </div>
            
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Detalhes do Processo Original</CardTitle>
                </CardHeader>
                <CardContent>
                    <p><span className="font-semibold">Nº:</span> {etapa.processo.numeroDocumento}</p>
                    <p><span className="font-semibold">Assunto:</span> {etapa.processo.assunto}</p>
                    <p className="mt-4 font-semibold">Conteúdo Original:</p>
                    <p className="whitespace-pre-wrap text-muted-foreground border p-2 rounded-md">{etapa.processo.conteudo}</p>
                </CardContent>
            </Card>

            <ParecerForm etapaId={etapa.id} processoId={etapa.processoId} />
        </div>
    );
}