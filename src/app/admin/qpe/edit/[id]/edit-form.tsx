"use client";

import { useActionState } from 'react';
import { TipoDeAnotacao } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateTipoDeAnotacao, CreateQPEState } from '../../actions'; 

export default function EditQPEPage({ item }: { item: TipoDeAnotacao }) {
  const initialState: CreateQPEState = {};
  const [state, formAction] = useActionState(updateTipoDeAnotacao, initialState);

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Editar Item do QPE</CardTitle>
          <CardDescription>
            Altere os dados e clique em salvar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
           
            <input type="hidden" name="id" value={item.id} />

            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" name="titulo" required defaultValue={item.titulo} />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" name="descricao" required defaultValue={item.descricao} />
            </div>

            <div>
              <Label htmlFor="pontos">Pontos</Label>
              <Input
                id="pontos"
                name="pontos"
                type="number"
                step="0.1"
                defaultValue={item.pontos ?? ""}
                placeholder="Manual"
              />
            </div>

            {state?.message && (
              <p className={`p-3 text-sm rounded-md ${state.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {state.message}
              </p>
            )}

            <div className="flex gap-2">
              <Button type="submit">Salvar Alterações</Button>
              <Button variant="outline" asChild>
                <a href="/admin/qpe">Cancelar</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}