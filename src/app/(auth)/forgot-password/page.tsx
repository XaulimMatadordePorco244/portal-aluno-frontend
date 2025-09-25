"use client";

import { Button } from "@/components/ui/Button"; 
import { Input } from "@/components/ui/Input";   
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
     <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-sm p-8 space-y-6 bg-card rounded-xl shadow-lg border">
        
        <div className="text-center">
                 <h1 className="text-2xl font-bold text-foreground">
            Recuperar Senha
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Digite e-mail cadastrado para enviarmos um link de recuperação.
          </p>
        </div>

        <form className="space-y-4">
          <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="email" type="email" required
              placeholder="Digite seu e-mail"
              className="pl-10" 
            />
          </div>

      
          <Button type="submit" className="w-full !mt-6">
            Enviar Link de Recuperação
          </Button>
        </form>

        <div className="text-center">
            <a href="/login" className="text-sm font-medium text-primary hover:underline">
            Voltar para o Login
          </a>
        </div>

      </div>
    </div>
  );
}