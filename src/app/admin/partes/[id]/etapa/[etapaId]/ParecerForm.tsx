"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";

export function ParecerForm({ etapaId, processoId }: { etapaId: string, processoId: string }) {
    const [conteudo, setConteudo] = useState("");
    const [decisao, setDecisao] = useState<"DEFERIDO" | "INDEFERIDO" | "">("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
    
            const response = await fetch(`/api/etapas/${etapaId}/submeter-parecer`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conteudo, decisao }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Falha ao salvar parecer.');
            }
        
            router.push(`/admin/partes/${processoId}`);
            router.refresh();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocorreu um erro inesperado.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Emissão de Parecer</CardTitle>
                    <CardDescription>Descreva sua análise dos fatos e sua decisão final (Deferido/Indeferido).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="parecer">Parecer Descritivo</Label>
                        <Textarea id="parecer" className="min-h-[300px]" value={conteudo} onChange={(e) => setConteudo(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                        <Label>Decisão do Parecer</Label>
                        <Select onValueChange={(value: "DEFERIDO" | "INDEFERIDO" | "") => setDecisao(value)} value={decisao} required>
                            <SelectTrigger><SelectValue placeholder="Selecione sua decisão..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DEFERIDO">DEFERIDO / ACEITO</SelectItem>
                                <SelectItem value="INDEFERIDO">INDEFERIDO / NEGADO</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     {error && <p className="text-sm text-destructive">{error}</p>}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSubmitting ? "Enviando..." : "Enviar Parecer"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}