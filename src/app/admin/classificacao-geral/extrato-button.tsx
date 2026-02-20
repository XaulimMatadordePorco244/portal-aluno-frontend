'use client'

import { Button } from "@/components/ui/Button";
import { Printer } from "lucide-react";
import { ClassificacaoPdfService } from "@/services/pdf/classificacao-pdf.service";

export function ExtratoButton({ dados, dataAtualizacao }: { dados: any[], dataAtualizacao: string }) {
  const handlePrint = async () => {
    await ClassificacaoPdfService.download(dados, dataAtualizacao, 'extrato-classificacao.pdf');
  };

  return (
    <Button onClick={handlePrint} variant="outline" className="gap-2">
      <Printer className="w-4 h-4" />
      Imprimir Extrato
    </Button>
  );
}