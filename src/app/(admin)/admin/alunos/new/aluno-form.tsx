"use client";

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { createAluno } from '../actions';
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Salvando...' : 'Salvar Aluno'}
    </Button>
  );
}

export default function AlunoForm() {
  const [state, formAction] = useActionState(createAluno, undefined);


  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome Completo</Label>
        <Input id="nome" name="nome" required />
        {state?.errors?.nome && <p className="text-sm text-red-500 mt-1">{state.errors.nome[0]}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nomeDeGuerra">Nome de Guerra</Label>
          <Input id="nomeDeGuerra" name="nomeDeGuerra" required />
          {state?.errors?.nomeDeGuerra && <p className="text-sm text-red-500 mt-1">{state.errors.nomeDeGuerra[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF (apenas números)</Label>
          <Input id="cpf" name="cpf" required maxLength={11} />
          {state?.errors?.cpf && <p className="text-sm text-red-500 mt-1">{state.errors.cpf[0]}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="numero">Número do Aluno</Label>
          <Input id="numero" name="numero" required />
          {state?.errors?.numero && <p className="text-sm text-red-500 mt-1">{state.errors.numero[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="companhia">Companhia</Label>
          <Select name="companhia" required>
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
        <Label htmlFor="cargo">Cargo</Label>
        <Select name="cargo" required>
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
        {state?.errors?.cargo && <p className="text-sm text-red-500 mt-1">{state.errors.cargo[0]}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email (Opcional)</Label>
        <Input id="email" name="email" type="email" />
        {state?.errors?.email && <p className="text-sm text-red-500 mt-1">{state.errors.email[0]}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="password">Senha Provisória</Label>
          <Input id="password" name="password" type="password" required />
          {state?.errors?.password && <p className="text-sm text-red-500 mt-1">{state.errors.password[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fotoUrl">Foto do Aluno (Opcional)</Label>
          <Input id="fotoUrl" name="fotoUrl" type="file" accept="image/*" />
          {state?.errors?.fotoUrl && <p className="text-sm text-red-500 mt-1">{state.errors.fotoUrl[0]}</p>}
        </div>
      </div>
      
      {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
      
      <div className="flex gap-2 pt-4">
        <SubmitButton />
        <Button variant="outline" asChild>
          <Link href="/admin/alunos">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}