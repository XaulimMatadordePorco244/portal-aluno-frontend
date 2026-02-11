"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Send, Loader2 } from "lucide-react";
import { generatePartePDF } from "@/lib/PartepdfGenerator";
import { Prisma } from "@prisma/client";

type ParteWithRelations = Prisma.ParteGetPayload<{
  include: {
    autor: {
      include: {
        perfilAluno: {
          include: {
            cargo: true;
            companhia: true;
          };
        };
      };
    };
    analises: {
      include: {
        analista: true;
      };
    };
    etapas: true;
    logs: true;
  };
}>;

interface SendButtonProps {
    parte: ParteWithRelations;
}

export function SendButton({ parte }: SendButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
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

        try {
            const pdfFile = await generatePartePDF(parte);
            
            const formData = new FormData();
            formData.append("file", pdfFile);

            const response = await fetch(`/api/partes/${parte.id}/enviar`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Falha ao enviar a parte.');
            }

            alert("Parte enviada com sucesso! O protocolo foi gerado.");
            router.refresh();

        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao enviar.";
            alert(errorMessage);
        } finally {
            setIsLoading(false);
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
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                </>
            ) : (
                <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar para Análise
                </>
            )}
        </Button>
    );
}