"use client";

import {  useState, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createTipoDeAnotacao, CreateQPEState } from './actions'; 

type SelectionType = '' | 'FO_POSITIVO' | 'FO_NEGATIVO' | 'ELOGIO_COORDENACAO' | 'PUNICAO_COORDENACAO' | 'ELOGIO_CUSTOM' | 'PUNICAO_CUSTOM' | 'SUSPENSAO';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Adicionando...' : 'Adicionar Item ao QPE'}</Button>;
}

export default function CreateQPEForm() {
  const initialState: CreateQPEState = {};
  const [state, formAction] = useActionState(createTipoDeAnotacao, initialState);
  
  const [selectionType, setSelectionType] = useState<SelectionType>('');
  const [customPontos, setCustomPontos] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const showCustomPontos = selectionType === 'ELOGIO_CUSTOM' || selectionType === 'PUNICAO_CUSTOM';

  return (
    <form action={formAction} ref={formRef} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="titulo">Título / Infração</Label>
          <Input id="titulo" name="titulo" required placeholder="Ex: Atraso Reincidente" />
        </div>
        <div>
          <Label htmlFor="descricao">Descrição (Fato Típico)</Label>
          <Textarea id="descricao" name="descricao" required placeholder="Descreva o enquadramento..." />
        </div>
        <div>
          <Label htmlFor="selectionType">Classificação no QPE</Label>
          <Select name="selectionType" value={selectionType} onValueChange={(v) => setSelectionType(v as SelectionType)} required>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FO_POSITIVO">Fato Observado Positivo (FO+ 0.5)</SelectItem>
              <SelectItem value="FO_NEGATIVO">Fato Observado Negativo (FO- -0.3)</SelectItem>
              <SelectItem value="ELOGIO_COORDENACAO">Elogio (Aberto p/ Coordenação)</SelectItem>
              <SelectItem value="PUNICAO_COORDENACAO">Punição (Aberto p/ Coordenação)</SelectItem>
              <SelectItem value="ELOGIO_CUSTOM">Elogio (Pontuação Manual)</SelectItem>
              <SelectItem value="PUNICAO_CUSTOM">Punição (Pontuação Manual)</SelectItem>
              <SelectItem value="SUSPENSAO">Suspensão</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {showCustomPontos && (
          <div>
            <Label htmlFor="pontos">Pontos</Label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                {selectionType === 'ELOGIO_CUSTOM' ? '+' : '-'}
              </span>
              <Input
                id="pontos"
                name="pontos"
                type="number"
                step="0.1"
                min="0" 
                value={customPontos}
                onChange={(e) => setCustomPontos(e.target.value)}
                required
                className="pl-7" 
              />
            </div>
          </div>
        )}
      </div>

      {state.message && (
        <div className={`p-3 text-sm rounded-md ${state.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {state.message}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}