import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DownloadButton } from '@/app/(main)/partes/[id]/DownloadButton';
import { TipoProcesso } from '@prisma/client';
import { GenericProcessView } from './GenericProcessView';
import { AtoDeBravuraProcessView } from './AtoDeBravuraProcessView';
import { ProcessoCompleto } from '@/lib/types';

async function getProcessoDetails(id: string): Promise<ProcessoCompleto | null> {
    const user = await getCurrentUser();
    if (user?.role !== 'ADMIN') {
        redirect('/');
    }
    const processo = await prisma.parte.findUnique({
        where: { id },
        include: {
            autor: { include: { cargo: true } },
            analises: {
                include: { analista: true },
                orderBy: { createdAt: 'desc' }
            },
            etapas: {
                include: { responsavel: true },
                orderBy: { createdAt: 'asc' }
            },
        },
    });
    return processo;
}

function ProcessView({ processo }: { processo: ProcessoCompleto }) {
    switch (processo.tipo) {
        case TipoProcesso.ATO_DE_BRAVURA:
        case TipoProcesso.RECONSIDERACAO_ATO_DE_BRAVURA:
            return <AtoDeBravuraProcessView processo={processo} />;
        
        default:
            return <GenericProcessView processo={processo} />;
    }
}


export default async function AdminProcessoDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const processo = await getProcessoDetails(id);

    if (!processo) {
        notFound();
    }
    const nomeFormatado = `${processo.autor.cargo?.abreviacao || ''} GM ${processo.autor.nomeDeGuerra || processo.autor.nome}`;

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">{processo.assunto}</CardTitle>
                        <DownloadButton parteData={processo} />
                    </div>
                    <CardDescription>
                        Enviada por: {nomeFormatado} em {processo.dataEnvio ? new Date(processo.dataEnvio).toLocaleString('pt-BR') : 'N/A'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap border p-4 rounded-md bg-muted/20">
                        {processo.conteudo}
                    </div>
                </CardContent>
            </Card>
            <div className="mt-6">
                <ProcessView processo={processo} />
            </div>
        </>
    );
}