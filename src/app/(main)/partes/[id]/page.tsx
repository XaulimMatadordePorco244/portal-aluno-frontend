import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { StatusParte } from '@prisma/client';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SendButton } from './SendButton';
import { DownloadButton } from './DownloadButton';


async function getParteDetails(id: string) {
    const user = await getCurrentUser();
    const parte = await prisma.parte.findUnique({
        where: { id },
        include: {
            autor: {
                include: {
                    cargo: true
                }
            },
        }
    });


    if (!parte || parte.autorId !== user?.userId) {
        return null;
    }
    return parte;
}



export default async function ParteDetailsPage({ params }: { params: { id: string } }) {
    const parte = await getParteDetails(params.id);

    if (!parte) {
        notFound();
    }


    return (
        <div className="container mx-auto py-10 max-w-3xl">
            <div className="mb-4">
                <Link href="/partes" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Minhas Partes
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{parte.assunto}</CardTitle>
                            <CardDescription className="mt-2">
                                Criado em: {new Date(parte.createdAt).toLocaleDateString('pt-BR')} por {parte.autor.nomeDeGuerra || parte.autor.nome}
                            </CardDescription>
                        </div>
                        <Badge variant={parte.status === 'RASCUNHO' ? 'outline' : 'default'}>
                            {parte.status.charAt(0).toUpperCase() + parte.status.slice(1).toLowerCase()}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                        {parte.conteudo}
                    </div>


                    {parte.status === 'RASCUNHO' && (
                        <div className="mt-8 border-t pt-6 flex flex-col items-center text-center">
                            <p className="text-sm text-muted-foreground mb-4">
                                Revise sua parte com atenção. Após o envio, ela não poderá mais ser editada.
                            </p>
                            <SendButton parteId={parte.id} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}