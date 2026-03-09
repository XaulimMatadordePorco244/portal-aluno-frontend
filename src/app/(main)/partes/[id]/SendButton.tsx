"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Send, Loader2 } from "lucide-react";
import { generatePartePDF } from "@/lib/PartepdfGenerator"; 

interface SendButtonProps {
    parteId: string; 
}

export function SendButton({ parteId }: SendButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("Processando...");
    const router = useRouter();

    const handleSend = async () => {
        const confirmou = window.confirm(
            "Tem certeza que deseja oficializar este documento?\n\n" +
            "• Um número de protocolo será gerado.\n" +
            "• O documento será enviado ao Comandante.\n" +
            "• Você não poderá mais editar o texto."
        );

        if (!confirmou) return;

        setIsLoading(true);
        setLoadingText("Gerando protocolo...");

        try {
            const response = await fetch(`/api/partes/${parteId}/enviar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            const parteAtualizada = await response.json();

            if (!response.ok) {
                throw new Error(parteAtualizada.error || 'Falha ao oficializar a parte.');
            }

            setLoadingText("Gerando PDF...");
            const pdfFile = await generatePartePDF(parteAtualizada);

            setLoadingText("Salvando documento...");
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(pdfFile);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });

            const uploadResponse = await fetch(`/api/partes/${parteId}/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    fileBase64: base64, 
                    fileName: pdfFile.name 
                }),
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json().catch(() => ({ error: 'Erro desconhecido' }));
                console.error("Erro no upload (Resposta da API):", errorData);
                console.warn("A parte foi enviada, mas houve um erro ao salvar o PDF no servidor.");
            }

            alert(`Parte enviada com sucesso! Protocolo: ${parteAtualizada.numeroDocumento}`);
            router.refresh();

        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao enviar.";
            alert(errorMessage);
        } finally {
            setIsLoading(false);
            setLoadingText("Processando...");
        }
    };

    return (
        <Button
            onClick={handleSend}
            disabled={isLoading}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
        >
            {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {loadingText}</>
            ) : (
                <><Send className="mr-2 h-4 w-4" /> Enviar para Análise</>
            )}
        </Button>
    );
}