"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProcessoCompleto } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, MoreHorizontal, User, Users} from "lucide-react";


function InitialActions({ processoId }: { processoId: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleIniciarApuracao = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/partes/${processoId}/iniciar-apuracao`, { method: 'POST' });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Falha ao iniciar apuração.');
            }
            router.refresh(); 
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocorreu um erro inesperado.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Primeira Análise</CardTitle>
                <CardDescription>
                    Selecione a próxima ação para este processo de Ato de Bravura.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
                <Button variant="destructive" disabled={isLoading}>Negar Liminarmente</Button>
                <Button variant="secondary" disabled={isLoading}>Encaminhar para Coordenação</Button>
                <Button onClick={handleIniciarApuracao} disabled={isLoading}>
                    {isLoading ? "Sorteando..." : "Sortear Oficial para Parecer"}
                </Button>
                 {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            </CardContent>
        </Card>
    );
}


function ProcessTimeline({ processo }: { processo: ProcessoCompleto }) {
    const getStatusIcon = (status: string) => {
        if (status === 'Concluído') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        if (status === 'Pendente') return <MoreHorizontal className="h-5 w-5 text-yellow-500" />;
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Linha do Tempo do Processo</CardTitle>
                <CardDescription>Acompanhe as etapas da apuração do Ato de Bravura.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {processo.etapas.map((etapa) => (
                        <div key={etapa.id} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                {getStatusIcon(etapa.status)}
                                <div className="w-px h-12 bg-border mt-2"></div>
                            </div>
                            <div>
                                <p className="font-semibold">{etapa.titulo}</p>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    {etapa.responsavel ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                                    <span>
                                        Responsável: {etapa.responsavel?.nomeDeGuerra || etapa.status === "EM_ANALISE" ? "Aguardando" : "Coordenação"}
                                    </span>
                                </div>
                                {etapa.status === 'CONCLUIDA' && (
                                     <p className="text-xs text-muted-foreground mt-1">
                                        Concluído em: {new Date(etapa.dataConclusao!).toLocaleDateString('pt-BR')}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}



export function AtoDeBravuraProcessView({ processo }: { processo: ProcessoCompleto }) {

    if (processo.etapas.length === 0 && processo.status === 'ENVIADA') {
        return <InitialActions processoId={processo.id} />;
    }

    
    if (processo.etapas.length > 0) {
        return <ProcessTimeline processo={processo} />;
    }
    
  
    return (
        <div className="text-center text-muted-foreground p-4 border rounded-md">
            O processo ainda não foi enviado para análise.
        </div>
    );
}