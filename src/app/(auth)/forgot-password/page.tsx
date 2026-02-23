"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button"; 
import { Input } from "@/components/ui/Input";   
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react"; 

export default function ForgotPasswordPage() {
  const [cpf, setCpf] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    value = value.replace(/\D/g, "");

    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    setCpf(value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    const cleanCpf = cpf.replace(/\D/g, "");

    if (cleanCpf.length !== 11) {
        setError("O CPF deve conter 11 dígitos.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/password/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cleanCpf }), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao processar a solicitação.');
      }
      
      setMessage(`Link enviado para o e-mail ${data.maskedEmail}`);
      
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
     <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm shadow-lg border border-border">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
            <CardDescription>Digite seu CPF para iniciarmos a recuperação.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="cpf" className="text-sm font-medium leading-none">
                        CPF
                    </label>
                    <Input
                        id="cpf"
                        type="text" 
                        inputMode="numeric" 
                        required
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={handleCpfChange}
                        disabled={isLoading || !!message} 
                        maxLength={14} 
                        className="font-mono" 
                    />
                </div>
            
                {message && (
                    <div className="p-4 flex flex-col items-center gap-2 text-sm text-center text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md animate-in fade-in slide-in-from-top-2">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <span className="font-medium">{message}</span>
                        <span className="text-xs text-emerald-600/80 mt-1">Verifique sua caixa de entrada e spam.</span>
                    </div>
                )}
                
                {error && (
                    <div className="p-4 flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {!message && (
                    <Button type="submit" className="w-full" disabled={isLoading || cpf.length < 14}>
                        {isLoading ? "Verificando..." : "Enviar Link de Recuperação"}
                    </Button>
                )}
            </form>

            <div className="text-center mt-6">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary hover:underline transition-colors">
                Voltar para o Login
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}