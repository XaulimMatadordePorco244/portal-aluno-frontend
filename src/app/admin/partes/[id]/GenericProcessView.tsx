import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisForm } from './AnalysisForm';
import { ReversalDialog } from './ReversalDialog';
import { Badge } from "@/components/ui/badge";
import { ProcessoCompleto } from "@/lib/types"; 

export function GenericProcessView({ processo }: { processo: ProcessoCompleto }) {
    const ultimaAnalise = processo.analises[0];

   
    if (processo.status === 'ANALISADA' && ultimaAnalise) {
        return (
            <Card className="bg-muted/50">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl">Análise Concluída</CardTitle>
                            <CardDescription>
                                Analisado por: {ultimaAnalise.analista.nome} em {new Date(ultimaAnalise.createdAt).toLocaleString('pt-BR')}
                            </CardDescription>
                        </div>
                        <ReversalDialog parteId={processo.id} />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold">Resultado: <Badge>{ultimaAnalise.resultado}</Badge></p>
                    <p className="mt-4 font-semibold">Observações:</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{ultimaAnalise.observacoes || "Nenhuma observação."}</p>
                </CardContent>
            </Card>
        );
    }

    
    return <AnalysisForm parteId={processo.id} />;
}