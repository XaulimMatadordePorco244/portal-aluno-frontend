"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button"; 
import { FileDown } from "lucide-react";
import { antiguidadePdfService } from "@/services/pdf/antiguidade-pdf.service";

interface Props {
  efetivo: any[]; 
}

export default function BotaoExtratoAntiguidade({ efetivo }: Props) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await antiguidadePdfService.generate({ efetivo });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleGenerate} disabled={loading} className="w-full sm:w-auto">
      <FileDown className="mr-2 h-4 w-4" /> 
      {loading ? "Gerando..." : "Gerar Extrato"}
    </Button>
  );
}