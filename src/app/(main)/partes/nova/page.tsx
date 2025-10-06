"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NovaPartePage() {
    const [assunto, setAssunto] = useState("");
    const [conteudo, setConteudo] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/partes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assunto, conteudo }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Falha ao salvar o rascunho.');
            }

            
            router.push(`/partes/${data.id}`);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

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
                    <CardTitle>Criar Nova Parte</CardTitle>
                    <CardDescription>
                        Descreva sua solicitação ou justificativa. Após salvar, você poderá revisar antes de enviar para análise.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="assunto">Assunto</Label>
                            <Input
                                id="assunto"
                                placeholder="Ex: Justificativa de falta"
                                value={assunto}
                                onChange={(e) => setAssunto(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="conteudo">Conteúdo</Label>
                            <Textarea
                                id="conteudo"
                                placeholder="Eu, Aluno FULANO, nº 000, venho por meio desta justificar minha ausência..."
                                className="min-h-[250px]"
                                value={conteudo}
                                onChange={(e) => setConteudo(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {error && <p className="text-sm text-destructive">{error}</p>}

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                                <Save className="mr-2 h-4 w-4" />
                                {isLoading ? "Salvando..." : "Salvar Rascunho"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}