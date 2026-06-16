import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisForm } from "./AnalysisForm";
import { ReversalDialog } from "./ReversalDialog";
import { Badge } from "@/components/ui/badge";
import { ProcessoCompleto } from "@/lib/types"; 

export function GenericProcessView({ processo }: { processo: ProcessoCompleto }) {
    const ultimaAnalise = processo.analises?.[0];

    if (processo.status === "DEFERIDO" || processo.status === "INDEFERIDO") {
        return (
            <Card className="bg-muted/50">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl">Análise Concluída</CardTitle>
                            <CardDescription>
                                Analisado por: {ultimaAnalise?.analista?.nome || "Sistema"} em {new Date(ultimaAnalise?.createdAt || processo.dataAnalise || new Date()).toLocaleString("pt-BR")}
                            </CardDescription>
                        </div>
                        <ReversalDialog parteId={processo.id} />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold flex items-center gap-2">
                        Resultado: 
                        <Badge variant={processo.status === "DEFERIDO" ? "default" : "destructive"}>
                            {ultimaAnalise?.resultado || processo.status}
                        </Badge>
                    </p>
                    <p className="mt-4 font-semibold">Observações:</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                        {ultimaAnalise?.observacoes || processo.analiseComando || "Nenhuma observação."}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return <AnalysisForm parteId={processo.id} />;
}