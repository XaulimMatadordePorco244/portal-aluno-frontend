"use client";

import { useFormState, useFormStatus } from "react-dom";
import { validateUserByNumber, FormState } from "./actions"; 
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Validando...' : (
        <>
          <Search className="mr-2 h-4 w-4" />
          Validar
        </>
      )}
    </Button>
  );
}

export default function ManualValidationPage() {
  const initialState: FormState = { error: null };
  const [state, formAction] = useFormState(validateUserByNumber, initialState);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Validação Manual</CardTitle>
          <CardDescription>
            Insira o número do aluno para verificar a autenticidade da carteirinha.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                name="numero"
                placeholder="Ex: 2534"
                required
              />
            </div>
            {state?.error && (
              <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md border border-red-200">
                {state.error}
              </p>
            )}
          </CardContent>
          <CardFooter className="mt-3">
            
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}