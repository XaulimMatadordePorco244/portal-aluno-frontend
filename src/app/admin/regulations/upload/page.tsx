"use client";

import { useFormState, useFormStatus } from "react-dom";
import { uploadRegulamento, UploadState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Enviando...' : (
        <>
          <UploadCloud className="mr-2 h-4 w-4" />
          Enviar Regulamento
        </>
      )}
    </Button>
  );
}

export default function UploadPage() {
  const initialState: UploadState = {};
  const [state, formAction] = useFormState(uploadRegulamento, initialState);

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload de Novo Regulamento</CardTitle>
          <CardDescription>
            Selecione um arquivo PDF (máx. 4MB) para adicionar ao portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título do Regulamento</Label>
              <Input id="titulo" name="titulo" required placeholder="Ex: Regulamento de Uniformes" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arquivo">Arquivo PDF</Label>
              <Input id="arquivo" name="arquivo" type="file" required accept="application/pdf" />
            </div>

            {state?.error && (
               <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md border border-red-200">
                {state.error}
               </p>
            )}

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}