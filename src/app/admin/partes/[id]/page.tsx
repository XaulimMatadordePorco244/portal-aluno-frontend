import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisForm } from './AnalysisForm';
import { ReversalDialog } from './ReversalDialog';
import { DownloadButton } from '@/app/(main)/partes/[id]/DownloadButton';

async function getParteParaAnalise(id: string) {
    const user = await getCurrentUser();
    if (user?.role !== 'ADMIN') {
        redirect('/');
    }

    const parte = await prisma.parte.findUnique({
        where: { id },
        include: {
            autor: true,
            analises: {
                include: { analista: true },
                orderBy: { createdAt: 'desc' }
            },
        },
    });

    return parte;
}

export default async function AdminParteDetailsPage({ params }: { params: { id: string } }) {
    const parte = await getParteParaAnalise(params.id);

    if (!parte) { notFound(); }
    const ultimaAnalise = parte.analises[0];

    return (
        <div >
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{parte.assunto}</CardTitle>
                    <CardDescription>
                        Enviada por: {parte.autor.nomeDeGuerra || parte.autor.nome} em {parte.dataEnvio ? new Date(parte.dataEnvio).toLocaleString('pt-BR') : 'N/A'}
                    </CardDescription>
                    <div>
                        <DownloadButton parteData={parte} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap border p-4 rounded-md">
                        {parte.conteudo}
                    </div>
                </CardContent>
            </Card>

            {parte.status === 'ANALISADA' && ultimaAnalise ? (
                <Card className="mt-6 bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-xl">Análise Concluída</CardTitle>
                        <CardDescription>
                            Analisado por: {ultimaAnalise.analista.nome} em {new Date(ultimaAnalise.createdAt).toLocaleString('pt-BR')}
                        </CardDescription>
                        <div>
                            <ReversalDialog parteId={parte.id} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">Resultado: <Badge>{ultimaAnalise.resultado}</Badge></p>
                        <p className="mt-4 font-semibold">Observações:</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">{ultimaAnalise.observacoes || "Nenhuma observação."}</p>
                    </CardContent>
                </Card>
            ) : (
                <AnalysisForm parteId={parte.id} />
            )}
        </div>
    );
}