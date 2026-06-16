"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResultadoAnalise } from "@prisma/client";
import { analisarParteAdmin } from "../actions"; 
import { CheckCircle2, Loader2 } from "lucide-react";

export function AnalysisForm({ parteId }: { parteId: string }) {
    const [resultado, setResultado] = useState<ResultadoAnalise | "">("");
    const [observacoes, setObservacoes] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!resultado) {
            setError("Por favor, selecione um resultado para a análise.");
            return;
        }
        setError(null);

        startTransition(async () => {
            const res = await analisarParteAdmin(parteId, resultado as ResultadoAnalise, observacoes);
            
            if (res?.error) {
                setError(res.error);
            } else {
                setSucesso(true);
            }
        });
    };

    if (sucesso) {
        return (
            <Card className="mt-6 border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-900/30">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center gap-4">
                    <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-500" />
                    <div>
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">
                            Análise Registrada com Sucesso!
                        </h3>
                        <p className="text-sm text-green-600/80 dark:text-green-500/80 mt-1">
                            A parte foi atualizada e salva no histórico.
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => router.push("/admin/partes")}
                    >
                        Voltar para a Lista
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Registrar Análise</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Resultado da Análise</Label>
                        <Select onValueChange={(value) => setResultado(value as ResultadoAnalise)} value={resultado} required disabled={isPending}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um parecer..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="APROVADA">Aprovar / Deferir</SelectItem>
                                <SelectItem value="NEGADA">Negar / Indeferir</SelectItem>
                                <SelectItem value="ARQUIVADA">Arquivar</SelectItem>
                                <SelectItem value="ENCAMINHADA">Encaminhar</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações (Opcional)</Label>
                        <Textarea
                            id="observacoes"
                            placeholder="Adicione aqui suas observações, despachos ou justificativas..."
                            className="min-h-[150px]"
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isPending ? "Salvando..." : "Salvar Análise"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}