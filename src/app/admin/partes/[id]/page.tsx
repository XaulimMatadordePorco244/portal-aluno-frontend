import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

import { TipoProcesso } from '@prisma/client';
import { ProcessoCompleto } from '@/lib/types';
import { GenericProcessView } from './GenericProcessView';
import { AtoDeBravuraProcessView } from './AtoDeBravuraProcessView';

import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ExternalLink, User, AlertTriangle } from 'lucide-react';

// ==========================================
// LÓGICA DE BUSCA DO BANCO (Inalterada)
// ==========================================
async function getProcessoDetails(id: string): Promise<ProcessoCompleto | null> {
    const user = await getCurrentUser();
    if (user?.role !== 'ADMIN') {
        redirect('/');
    }
    const processo = await prisma.parte.findUnique({
        where: { id },
        include: {
            autor: {
                include: {
                    perfilAluno: {
                        include: { cargo: true }
                    }
                }
            },
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
    return processo as ProcessoCompleto | null;
}

// ==========================================
// RENDERIZADOR DE FLUXO (Admin)
// ==========================================
function ProcessView({ processo }: { processo: ProcessoCompleto }) {
    switch (processo.tipo) {
        case TipoProcesso.ATO_DE_BRAVURA:
        case TipoProcesso.RECONSIDERACAO_ATO_DE_BRAVURA:
            return <AtoDeBravuraProcessView processo={processo} />;
        
        default:
            return <GenericProcessView processo={processo} />;
    }
}

// ==========================================
// PÁGINA PRINCIPAL DO ADMIN (Com Layout PDF)
// ==========================================
export default async function AdminProcessoDetailsPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const { id } = await params;
    const processo = await getProcessoDetails(id);

    if (!processo) {
        notFound();
    }

    const pdfUrl = processo.urlPdf;
    const perfil = processo.autor.perfilAluno;
    const nomeFormatado = `${perfil?.cargo?.abreviacao || ''} GM ${processo.autor.nomeDeGuerra || processo.autor.nome}`;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-black/10">
            
            {/* CABEÇALHO */}
            <header className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    {/* Altere o Link abaixo para a rota de listagem de partes do admin */}
                    <Link href="/admin/partes">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-sm font-semibold leading-none text-gray-900 dark:text-gray-100">
                            {processo.assunto}
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1">
                            Enviada em {processo.dataEnvio ? new Date(processo.dataEnvio).toLocaleDateString('pt-BR') : 'N/A'}
                        </p>
                    </div>
                </div>

                {pdfUrl && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Abrir PDF em Nova Guia
                            </a>
                        </Button>
                    </div>
                )}
            </header>

            {/* CORPO: GRID LADO A LADO */}
            <div className="grid flex-1 overflow-hidden grid-cols-1 md:grid-cols-7 lg:grid-cols-8">
                
                {/* LADO ESQUERDO: VISUALIZADOR DE PDF */}
                <div className="hidden flex-col bg-gray-100/50 md:flex md:col-span-3 lg:col-span-5 dark:bg-gray-900/50">
                    {pdfUrl ? (
                        <iframe 
                            src={`${pdfUrl}#toolbar=0`} 
                            className="h-full w-full border-0" 
                            title="Visualização do Documento" 
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                            <p>Nenhum PDF gerado/encontrado para este documento.</p>
                        </div>
                    )}
                </div>

                {/* LADO DIREITO: DETALHES E DECISÃO/FLUXO */}
                <div className="flex flex-col overflow-y-auto border-l bg-white md:col-span-4 lg:col-span-3 dark:bg-gray-950 dark:border-gray-800">
                    
                    {/* INFORMAÇÕES DO SOLICITANTE */}
                    <div className="p-6">
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Solicitante
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold leading-none">{processo.autor.nome}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {nomeFormatado}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* TEOR DO DOCUMENTO */}
                    <div className="flex-1 p-6 bg-gray-50/50 dark:bg-gray-900/20">
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Teor do Documento
                        </h3>
                        <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                            {processo.conteudo}
                        </div>
                    </div>

                    <Separator />

                    {/* AÇÕES DE ADMINISTRADOR (ProcessView) */}
                    <div className="p-6 bg-white dark:bg-gray-950">
                        {/* Como as Views do admin renderizam seus próprios <Card>, o encaixe aqui será perfeito */}
                        <ProcessView processo={processo} />
                    </div>
                </div>

            </div>
        </div>
    );
}