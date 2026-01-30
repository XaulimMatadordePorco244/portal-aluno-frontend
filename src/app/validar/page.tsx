"use client";

import { useFormState, useFormStatus } from "react-dom";
import { validateUserByNumber, FormState } from "./actions"; 
import Image from 'next/image';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Search, AlertCircle, Hash } from "lucide-react"; 

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full font-bold" disabled={pending} size="lg">
      {pending ? "Verificando..." : "Validar Aluno"}
    </Button>
  );
}

export default function ValidationPage() {
  const initialState: FormState = { error: null };
  const [state, formAction] = useFormState(validateUserByNumber, initialState);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-lg border">
        
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="rounded-full bg-primary/5 p-1 mb-5">
            <Image
                src="/img/logo.svg" 
                alt="Logo da Guarda Mirim"
                width={100}
                height={100}
                className="object-contain"
                priority
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Validação de Atividade</h1>
          <p className="text-sm text-muted-foreground">
            Insira o número do aluno ou aponte a câmera para o QR Code da carteirinha.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          
          <div className="space-y-2">
            <Label htmlFor="numero" className="ml-1">Número do Aluno</Label>
            <div className="relative">
                <Input
                id="numero"
                name="numero"
                type="text"
                placeholder="Digite o número do aluno"
                required
                className="pl-2 h-12 text-9 tracking-wider" 
                />
            </div>
          </div>

          {state?.error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{state.error}</p>
            </div>
          )}

          <SubmitButton />
        </form>
        
        <div className="text-center text-xs text-muted-foreground mt-4">
            &copy; {new Date().getFullYear()} Guarda Mirim de Naviraí-MS
        </div>
      </div>
    </div>
  );
}