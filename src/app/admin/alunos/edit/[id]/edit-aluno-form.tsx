"use client";

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { updateAluno } from '../../actions';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from '@prisma/client';
import Image from 'next/image';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Salvando...' : 'Salvar Alterações'}</Button>;
}

const cargosPadrao = [
  "ALUNO SOLDADO", "SOLDADO", "CABO", "3º SARGENTO", "2º SARGENTO", 
  "1º SARGENTO", "SUB TENENTE", "ASPIRANTE", "2º TENENTE", "1º TENENTE", 
  "CAPITÃO", "MAJOR", "TENENTE CORONEL", "CORONEL"
];


type UserWithCargoString = User & {
  cargo?: string | null;
};

export default function EditAlunoForm({ aluno }: { aluno: UserWithCargoString }) {
  const [state, formAction] = useActionState(updateAluno, undefined);

 
  const isCargoPadrao = cargosPadrao.includes(aluno.cargo || "");
  const [selectedCargo, setSelectedCargo] = useState(isCargoPadrao ? (aluno.cargo || "") : "OUTRO");
  const [outroCargo, setOutroCargo] = useState(isCargoPadrao ? "" : (aluno.cargo || ""));

 
  const getFinalCargoValue = () => {
    return selectedCargo === 'OUTRO' ? outroCargo : selectedCargo;
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={aluno.id} />
          <input type="hidden" name="cargo" value={getFinalCargoValue() || ""} />
      
      <div className="space-y-2">
        <Label htmlFor="nome">Nome Completo</Label>
        <Input id="nome" name="nome" required defaultValue={aluno.nome} />
        {state?.errors?.nome && <p className="text-sm text-red-500 mt-1">{state.errors.nome[0]}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nomeDeGuerra">Nome de Guerra</Label>
          <Input id="nomeDeGuerra" name="nomeDeGuerra" required defaultValue={aluno.nomeDeGuerra || ''} />
          {state?.errors?.nomeDeGuerra && <p className="text-sm text-red-500 mt-1">{state.errors.nomeDeGuerra[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF (apenas números)</Label>
          <Input id="cpf" name="cpf" required maxLength={11} defaultValue={aluno.cpf} />
          {state?.errors?.cpf && <p className="text-sm text-red-500 mt-1">{state.errors.cpf[0]}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="numero">Número do Aluno</Label>
          <Input id="numero" name="numero" required defaultValue={aluno.numero || ''} />
          {state?.errors?.numero && <p className="text-sm text-red-500 mt-1">{state.errors.numero[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="companhia">Companhia</Label>
          <Select name="companhia" required defaultValue={aluno.companhia || ''}>
            <SelectTrigger><SelectValue placeholder="Selecione a companhia" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1ª Companhia">1ª Companhia</SelectItem>
              <SelectItem value="2ª Companhia">2ª Companhia</SelectItem>
              <SelectItem value="3ª Companhia">3ª Companhia</SelectItem>
              <SelectItem value="4ª Companhia">4ª Companhia</SelectItem>
              <SelectItem value="5ª Companhia">5ª Companhia</SelectItem>
            </SelectContent>
          </Select>
          {state?.errors?.companhia && <p className="text-sm text-red-500 mt-1">{state.errors.companhia[0]}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cargoSelect">Cargo</Label>
        <Select name="cargoSelect" required onValueChange={setSelectedCargo} defaultValue={selectedCargo}>
          <SelectTrigger><SelectValue placeholder="Selecione o cargo" /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Praças</SelectLabel>
              <SelectItem value="ALUNO SOLDADO">ALUNO SOLDADO</SelectItem>
              <SelectItem value="SOLDADO">SOLDADO</SelectItem>
              <SelectItem value="CABO">CABO</SelectItem>
              <SelectItem value="3º SARGENTO">3º SARGENTO</SelectItem>
              <SelectItem value="2º SARGENTO">2º SARGENTO</SelectItem>
              <SelectItem value="1º SARGENTO">1º SARGENTO</SelectItem>
              <SelectItem value="SUB TENENTE">SUB TENENTE</SelectItem>
              <SelectItem value="ASPIRANTE">ASPIRANTE</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Oficiais</SelectLabel>
              <SelectItem value="2º TENENTE">2º TENENTE</SelectItem>
              <SelectItem value="1º TENENTE">1º TENENTE</SelectItem>
              <SelectItem value="CAPITÃO">CAPITÃO</SelectItem>
              <SelectItem value="MAJOR">MAJOR</SelectItem>
              <SelectItem value="TENENTE CORONEL">TENENTE CORONEL</SelectItem>
              <SelectItem value="CORONEL">CORONEL</SelectItem>
            </SelectGroup>
            <SelectItem value="OUTRO">OUTRO</SelectItem>
          </SelectContent>
        </Select>
        {state?.errors?.cargoNome && <p className="text-sm text-red-500 mt-1">{state.errors.cargoNome[0]}</p>}
      </div>

      {selectedCargo === 'OUTRO' && (
        <div className="space-y-2 animate-in fade-in">
          <Label htmlFor="cargoOutro">Especifique o Cargo</Label>
          <Input 
            id="cargoOutro" 
            name="cargoOutro" 
            placeholder="Ex: Diretor Presidente"
            value={outroCargo}
            onChange={(e) => setOutroCargo(e.target.value)}
          />
          {state?.errors?.cargoOutro && <p className="text-sm text-red-500 mt-1">{state.errors.cargoOutro[0]}</p>}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email (Opcional)</Label>
        <Input id="email" name="email" type="email" defaultValue={aluno.email || ''} />
        {state?.errors?.email && <p className="text-sm text-red-500 mt-1">{state.errors.email[0]}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="password">Nova Senha (deixe em branco para não alterar)</Label>
          <Input id="password" name="password" type="password" />
          {state?.errors?.password && <p className="text-sm text-red-500 mt-1">{state.errors.password[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fotoUrl">Substituir Foto</Label>
          {aluno.fotoUrl && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Image src={aluno.fotoUrl} alt="Foto atual" width={24} height={24} className="rounded-full object-cover" />
              <span>Foto atual. Envie uma nova para substituir.</span>
            </div>
          )}
          <Input id="fotoUrl" name="fotoUrl" type="file" accept="image/*" />
          {state?.errors?.fotoUrl && <p className="text-sm text-red-500 mt-1">{state.errors.fotoUrl[0]}</p>}
        </div>
      </div>
      
      {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
      
      <div className="flex gap-2 pt-4">
        <SubmitButton />
        <Button variant="outline" asChild><Link href="/admin/alunos">Cancelar</Link></Button>
      </div>
    </form>
  );
}