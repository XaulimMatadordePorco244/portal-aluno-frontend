"use client";

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateTipoDeAnotacao, CreateQPEState } from '../../actions'; 

export type UnifiedQPEItem = {
  id: string;
  titulo: string;
  descricao: string;
  pontos: number | null;
  abertoCoordenacao: boolean;
  categoriaAberto: string | null;
  tipoRegisto: 'ANOTACAO' | 'SUSPENSAO'; 
};

export default function EditQPEForm({ item }: { item: UnifiedQPEItem }) {
  const initialState: CreateQPEState = {};
  const [state, formAction] = useActionState(updateTipoDeAnotacao, initialState);

  const isSuspensao = item.tipoRegisto === 'SUSPENSAO';

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle>{isSuspensao ? 'Editar Motivo de Suspensão' : 'Editar Item do QPE'}</CardTitle>
          <CardDescription>
            Altere os dados e clique em salvar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="tipoRegisto" value={item.tipoRegisto} />

            <input type="hidden" name="abertoCoordenacao" value={item.abertoCoordenacao ? 'true' : 'false'} />
            <input type="hidden" name="categoriaAberto" value={item.categoriaAberto || ''} />

            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" name="titulo" required defaultValue={item.titulo} className="bg-background"/>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" name="descricao" required defaultValue={item.descricao} className="min-h-[120px] bg-background" />
            </div>

            {!isSuspensao && (
                <div>
                  <Label htmlFor="pontos">Pontos</Label>
                  <Input
                    id="pontos"
                    name="pontos"
                    type="number"
                    step="0.1"
                    defaultValue={item.pontos ?? ""}
                    placeholder="Deixe em branco se for manual ou aberto"
                    className="bg-background"
                  />
                </div>
            )}

            {state?.message && (
              <p className={`p-3 text-sm rounded-md font-medium ${state.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {state.message}
              </p>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" className="w-full sm:w-auto">Salvar Alterações</Button>
              <Button variant="secondary" asChild className="w-full sm:w-auto">
                <a href="/admin/qpe">Cancelar</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}