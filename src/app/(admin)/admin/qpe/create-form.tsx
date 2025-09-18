// src/app/(admin)/admin/qpe/create-form.tsx
"use client";

import { useEffect, useState, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createTipoDeAnotacao, CreateQPEState } from './actions'; 

type SelectionType = '' | 'FO_POSITIVO' | 'FO_NEGATIVO' | 'ELOGIO_COORDENACAO' | 'PUNICAO_COORDENACAO' | 'ELOGIO_CUSTOM' | 'PUNICAO_CUSTOM';

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

  useEffect(() => {
    if (state.type === 'success') {
      formRef.current?.reset();
      setSelectionType('');
      setCustomPontos('');
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {/* Campo oculto para passar o tipo de seleção para a action */}
      <input type="hidden" name="selectionType" value={selectionType} />

      <div>
        <Label htmlFor="titulo">Título</Label>
        <Input id="titulo" name="titulo" required placeholder="Ex: SER CAMARADA" className="mt-1"/>
      </div>
      
      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" name="descricao" required placeholder="Descrição detalhada do item..." className="mt-1"/>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <div>
          <Label htmlFor="tipo">Tipo de Item</Label>
          <Select onValueChange={(v) => setSelectionType(v as SelectionType)} value={selectionType} required>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione o tipo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FO_POSITIVO">FO+ (Padrão: +0.5)</SelectItem>
              <SelectItem value="FO_NEGATIVO">FO- (Padrão: -0.3)</SelectItem>
              <SelectItem value="ELOGIO_COORDENACAO">Elogio (Aberto p/ Coordenação)</SelectItem>
              <SelectItem value="PUNICAO_COORDENACAO">Punição (Aberto p/ Coordenação)</SelectItem>
              <SelectItem value="ELOGIO_CUSTOM">Elogio (Pontuação Manual)</SelectItem>
              <SelectItem value="PUNICAO_CUSTOM">Punição (Pontuação Manual)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Input de pontos customizados que aparece condicionalmente */}
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
                min="0" // Não permite negativos aqui, o sinal já está no prefixo
                value={customPontos}
                onChange={(e) => setCustomPontos(e.target.value)}
                required
                className="pl-7" // Espaço para o prefixo '+' ou '-'
              />
            </div>
          </div>
        )}
      </div>

      {state.message && (
        <div className={`p-3 text-sm rounded-md ${state.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {state.message}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}