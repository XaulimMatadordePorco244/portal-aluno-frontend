"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResultadoAnalise } from "@prisma/client";
import { RotateCcw } from "lucide-react";

export function ReversalDialog({ parteId }: { parteId: string }) {
    const [open, setOpen] = useState(false);
    const [novoResultado, setNovoResultado] = useState<ResultadoAnalise | ''>('');
    const [justificativa, setJustificativa] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!novoResultado || !justificativa) {
            setError("Tanto o novo resultado quanto a justificativa são obrigatórios.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/partes/${parteId}/reverter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ novoResultado, justificativa }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Falha ao reverter a decisão.');
            }

            setOpen(false);
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reverter Decisão
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reverter Decisão da Parte</DialogTitle>
                    <DialogDescription>
                        Selecione o novo resultado e forneça uma justificativa obrigatória. A análise anterior será mantida no histórico.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Novo Resultado</Label>
                        <Select onValueChange={(value) => setNovoResultado(value as ResultadoAnalise)} value={novoResultado}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um novo parecer..." />
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
                        <Label htmlFor="justificativa">Justificativa (Obrigatória)</Label>
                        <Textarea
                            id="justificativa"
                            placeholder="Descreva o motivo da reversão da decisão..."
                            value={justificativa}
                            onChange={(e) => setJustificativa(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Salvando..." : "Salvar Nova Decisão"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}