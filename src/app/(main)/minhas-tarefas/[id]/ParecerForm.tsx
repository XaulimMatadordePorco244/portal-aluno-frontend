"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { EtapaProcesso, Parte } from "@prisma/client";


type ParecerFormProps = {
  etapa: EtapaProcesso & {
    processo: Parte;
  };
};

export function ParecerForm({ etapa }: ParecerFormProps) {
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
      const response = await fetch(`/api/etapas/${etapa.id}/submeter-parecer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo, decisao }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao salvar parecer.');
      }
      router.push('/minhas-tarefas');
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
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-4">
        <Link
          href="/minhas-tarefas"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Minhas Tarefas
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Detalhes do Processo</CardTitle>
          <CardDescription>
            Visualizando o pedido original para emissão do parecer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            <span className="font-semibold">Assunto:</span> {etapa.processo.assunto}
          </p>
          <p className="mt-4 font-semibold">Conteúdo Original:</p>
          <p className="whitespace-pre-wrap text-muted-foreground border p-2 rounded-md bg-muted/50">
            {etapa.processo.conteudo}
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Emissão de Parecer</CardTitle>
            <CardDescription>
              Descreva sua análise dos fatos e sua decisão final (Deferido/Indeferido).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="parecer">Parecer Descritivo</Label>
              <Textarea
                id="parecer"
                className="min-h-[300px]"
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Decisão Final do Parecer</Label>
              <Select
                onValueChange={(value: "DEFERIDO" | "INDEFERIDO") => setDecisao(value)}
                value={decisao}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua decisão..." />
                </SelectTrigger>
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
    </div>
  );
}