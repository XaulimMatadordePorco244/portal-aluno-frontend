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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Usuario, PerfilAluno, Cargo, Companhia } from '@prisma/client';
import Image from 'next/image';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Salvando...' : 'Salvar Alterações'}</Button>;
}

type UsuarioCompleto = Usuario & {
  perfilAluno: (PerfilAluno & {
    cargo: Cargo | null;
    companhia: Companhia | null;
  }) | null;
};

export default function EditAlunoForm({ 
  aluno, 
  cargosDisponiveis,
  companhiasDisponiveis 
}: { 
  aluno: UsuarioCompleto, 
  cargosDisponiveis: Cargo[],
  companhiasDisponiveis: Companhia[]
}) {
  const [state, formAction] = useActionState(updateAluno, undefined);

  const perfil = aluno.perfilAluno;
  const cargoAtualNome = perfil?.cargo?.nome || "";
  
  const isCargoListado = cargosDisponiveis.some(c => c.nome === cargoAtualNome);
  
  const [selectedCargo, setSelectedCargo] = useState(isCargoListado ? cargoAtualNome : (cargoAtualNome ? "OUTRO" : ""));
  const [outroCargo, setOutroCargo] = useState(!isCargoListado ? cargoAtualNome : "");

  const getFinalCargoValue = () => {
    return selectedCargo === 'OUTRO' ? outroCargo : selectedCargo;
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={aluno.id} />
      <input type="hidden" name="cargoNome" value={getFinalCargoValue() || ""} />
      
      <div className="space-y-2">
        <Label htmlFor="nome">Nome Completo</Label>
        <Input id="nome" name="nome" required defaultValue={aluno.nome} />
        {state?.errors?.nome && <p className="text-sm text-red-500 mt-1">{state.errors.nome[0]}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nomeDeGuerra">Nome de Guerra</Label>
          <Input id="nomeDeGuerra" name="nomeDeGuerra" required defaultValue={perfil?.nomeDeGuerra || ''} />
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
          <Input id="numero" name="numero" required defaultValue={perfil?.numero || ''} />
          {state?.errors?.numero && <p className="text-sm text-red-500 mt-1">{state.errors.numero[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="companhiaId">Companhia</Label>
          <Select name="companhiaId" required defaultValue={perfil?.companhia?.id || ''}>
            <SelectTrigger><SelectValue placeholder="Selecione a companhia" /></SelectTrigger>
            <SelectContent>
              {companhiasDisponiveis.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state?.errors?.companhiaId && <p className="text-sm text-red-500 mt-1">{state.errors.companhiaId[0]}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cargoSelect">Cargo</Label>
        <Select name="cargoSelect" required onValueChange={setSelectedCargo} defaultValue={selectedCargo}>
          <SelectTrigger><SelectValue placeholder="Selecione o cargo" /></SelectTrigger>
          <SelectContent>
            {cargosDisponiveis.map((cargo) => (
              <SelectItem key={cargo.id} value={cargo.nome}>
                {cargo.nome}
              </SelectItem>
            ))}
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