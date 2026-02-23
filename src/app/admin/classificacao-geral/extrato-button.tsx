'use client'

import { Button } from "@/components/ui/Button";
import { Printer } from "lucide-react";
import { ClassificacaoPdfService } from "@/services/pdf/classificacao-pdf.service";
import { ClassificacaoItem } from "@/components/admin/ClassificacaoTable"; 

interface ExtratoButtonProps {
  dados: ClassificacaoItem[];
  dataAtualizacao: string;
}

export function ExtratoButton({ dados, dataAtualizacao }: ExtratoButtonProps) {
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