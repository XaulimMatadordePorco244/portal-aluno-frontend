"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResultadoAnalise } from "@prisma/client";

export function AnalysisForm({ parteId }: { parteId: string }) {
    const [resultado, setResultado] = useState<ResultadoAnalise | ''>('');
    const [observacoes, setObservacoes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!resultado) {
            setError("Por favor, selecione um resultado para a análise.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/partes/${parteId}/analise`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resultado, observacoes }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Falha ao registrar a análise.');
            }
            
 
            router.push('/admin/partes');
            router.refresh(); 

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Registrar Análise</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Resultado da Análise</Label>
                        <Select onValueChange={(value) => setResultado(value as ResultadoAnalise)} value={resultado} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um parecer..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="APROVADA">Aprovar</SelectItem>
                                <SelectItem value="NEGADA">Negar</SelectItem>
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
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Salvar Análise"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}