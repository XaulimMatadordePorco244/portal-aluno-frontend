"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button"; 
import { Input } from "@/components/ui/Input";   
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [cpf, setCpf] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/password/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf }), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro.');
      }
      setMessage(data.message); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
            <CardDescription>Digite seu CPF para enviarmos um link de recuperação para seu e-mail.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Input
                        id="cpf" type="text" required
                        placeholder="Digite seu CPF"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        disabled={isLoading || !!message}
                    />
                </div>
            
                {message && <div className="p-3 text-sm text-center text-emerald-800 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-200 rounded-md">{message}</div>}
                {error && <div className="p-3 text-sm text-center text-destructive-foreground bg-destructive rounded-md">{error}</div>}

                <Button type="submit" className="w-full" disabled={isLoading || !!message}>
                    {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
                </Button>
            </form>

            <div className="text-center mt-4">
              <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                Voltar para o Login
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}