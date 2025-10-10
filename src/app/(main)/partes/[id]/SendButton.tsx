"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Send, Loader2 } from "lucide-react";

export function SendButton({ parteId }: { parteId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSend = async () => {
        if (!confirm("Você tem certeza que deseja enviar esta parte para análise? Ela não poderá mais ser editada.")) {
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/api/partes/${parteId}/enviar`, {
                method: 'PUT',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Falha ao enviar a parte.');
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
        <div className="flex flex-col items-center w-full">
            <Button onClick={handleSend} disabled={isLoading} size="lg">
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Enviando..." : "Enviar para Análise"}
            </Button>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>
    );
}