"use client";

import { Button } from "@/components/ui/Button";
import { generatePartePDF } from "@/lib/PartepdfGenerator";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { ProcessoCompleto } from "@/lib/types";

interface DownloadButtonProps {
  parteData: ProcessoCompleto;
}

export function DownloadButton({ parteData }: DownloadButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (parteData.status === 'RASCUNHO') {
        return null;
    }

    const handleDownload = async () => {
        if (parteData.urlPdf) {
            window.open(parteData.urlPdf, '_blank');
            return;
        }

        setIsLoading(true);
        try {
            await generatePartePDF(parteData);
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Não foi possível acessar ou gerar o PDF.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleDownload} disabled={isLoading} variant="secondary">
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Download className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Processando..." : "Baixar PDF"}
        </Button>
    );
}