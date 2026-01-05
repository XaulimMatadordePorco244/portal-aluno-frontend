"use client";

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { updateAluno } from '../../actions'; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface AlunoCompleto {
  id: string;
  nome: string;
  cpf: string;
  email?: string | null;
  telefone?: string | null;
  rg?: string | null;
  rgEstadoEmissor?: string | null;
  dataNascimento?: Date | string | null;
  genero?: 'MASCULINO' | 'FEMININO' | null;
  perfilAluno?: {
    numero?: string | null;
    nomeDeGuerra?: string | null;
    cargoId?: string | null;
    companhiaId?: string | null;
    foraDeData: boolean;
    tipagemSanguinea?: string | null;
    aptidaoFisicaStatus?: string | null;
    aptidaoFisicaLaudo: boolean;
    aptidaoFisicaObs?: string | null;
    escola?: string | null;
    serieEscolar?: string | null;
    endereco?: string | null;
    fazCursoExterno: boolean;
    cursoExternoDescricao?: string | null;
    termoResponsabilidadeAssinado: boolean;
  } | null;
}

interface EditAlunoFormProps {
  aluno: AlunoCompleto;
  cargos: { id: string, nome: string }[];
  companhias: { id: string, nome: string }[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Salvando Alterações...' : 'Atualizar Dados'}
    </Button>
  );
}

function ErrorMsg({ error }: { error?: string[] }) {
  if (!error || error.length === 0) return null;
  return <p className="text-xs text-destructive mt-1">{error[0]}</p>;
}

export default function EditAlunoForm({ aluno, cargos, companhias }: EditAlunoFormProps) {
  const [state, formAction] = useActionState(updateAluno, undefined);
  
  const [temCurso, setTemCurso] = useState(!!aluno.perfilAluno?.fazCursoExterno);

  const dataNascValue = aluno.dataNascimento 
    ? new Date(aluno.dataNascimento).toISOString().split('T')[0] 
    : '';

  return (
    <form action={formAction} className="space-y-8 bg-card text-card-foreground">
      <input type="hidden" name="id" value={aluno.id} />

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground/80 flex items-center gap-2">
          <span className="bg-primary/10 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
          Dados Pessoais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input id="nome" name="nome" defaultValue={aluno.nome} required />
            <ErrorMsg error={state?.errors?.nome} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input 
                id="cpf" 
                name="cpf" 
                defaultValue={aluno.cpf} 
                readOnly 
                className="bg-muted text-muted-foreground cursor-not-allowed opacity-70" 
                title="CPF não pode ser alterado" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
             <Label htmlFor="dataNascimento">Data de Nascimento</Label>
             <Input id="dataNascimento" name="dataNascimento" type="date" defaultValue={dataNascValue} />
          </div>
          <div className="space-y-2">
             <Label htmlFor="rg">RG</Label>
             <Input id="rg" name="rg" defaultValue={aluno.rg || ''} />
          </div>
          <div className="space-y-2">
             <Label htmlFor="rgEstadoEmissor">Órgão/UF</Label>
             <Input id="rgEstadoEmissor" name="rgEstadoEmissor" defaultValue={aluno.rgEstadoEmissor || ''} placeholder="Ex: SSP/MS" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="space-y-2">
              <Label>Gênero</Label>
              <Select name="genero" defaultValue={aluno.genero || undefined}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMININO">Feminino</SelectItem>
                </SelectContent>
              </Select>
           </div>
           <div className="space-y-2">
              <Label htmlFor="telefone">Telefone / Celular</Label>
              <Input id="telefone" name="telefone" defaultValue={aluno.telefone || ''} />
           </div>
           <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={aluno.email || ''} />
              <ErrorMsg error={state?.errors?.email} />
           </div>
        </div>

        <div className="space-y-2">
           <Label htmlFor="endereco">Endereço Completo</Label>
           <Textarea 
             id="endereco" 
             name="endereco" 
             defaultValue={aluno.perfilAluno?.endereco || ''} 
             placeholder="Rua, Número, Bairro, CEP..." 
             className="h-20 resize-none" 
           />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground/80 flex items-center gap-2">
            <span className="bg-primary/10 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
            Dados Institucionais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="space-y-2">
              <Label htmlFor="numero">Número (Matrícula)</Label>
              <Input id="numero" name="numero" defaultValue={aluno.perfilAluno?.numero || ''} required />
              <ErrorMsg error={state?.errors?.numero} />
           </div>
           <div className="space-y-2">
              <Label htmlFor="nomeDeGuerra">Nome de Guerra</Label>
              <Input id="nomeDeGuerra" name="nomeDeGuerra" defaultValue={aluno.perfilAluno?.nomeDeGuerra || ''} required />
           </div>
           <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input id="password" name="password" type="password" placeholder="Deixe em branco para manter" />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
              <Label>Cargo / Graduação</Label>
              <Select name="cargoId" defaultValue={aluno.perfilAluno?.cargoId || undefined}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {cargos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
           </div>
           <div className="space-y-2">
              <Label>Companhia</Label>
              <Select name="companhiaId" defaultValue={aluno.perfilAluno?.companhiaId || undefined}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {companhias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
           </div>
        </div>

        <div className="flex items-center space-x-2 border border-border p-3 rounded-md bg-muted/10">
           <Checkbox 
             id="ingressoForaDeData" 
             name="ingressoForaDeData" 
             defaultChecked={aluno.perfilAluno?.foraDeData} 
           />
           <Label htmlFor="ingressoForaDeData" className="font-medium cursor-pointer">Ingresso fora de data (Matrícula tardia)</Label>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground/80 flex items-center gap-2">
            <span className="bg-primary/10 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs">3</span>
            Saúde e Aptidão
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
              <Label>Tipagem Sanguínea</Label>
              <Select name="tipagemSanguinea" defaultValue={aluno.perfilAluno?.tipagemSanguinea || undefined}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A_POSITIVO">A+</SelectItem>
                  <SelectItem value="A_NEGATIVO">A-</SelectItem>
                  <SelectItem value="B_POSITIVO">B+</SelectItem>
                  <SelectItem value="B_NEGATIVO">B-</SelectItem>
                  <SelectItem value="AB_POSITIVO">AB+</SelectItem>
                  <SelectItem value="AB_NEGATIVO">AB-</SelectItem>
                  <SelectItem value="O_POSITIVO">O+</SelectItem>
                  <SelectItem value="O_NEGATIVO">O-</SelectItem>
                </SelectContent>
              </Select>
           </div>
           <div className="space-y-2">
               <Label>Aptidão Física</Label>
               <Select name="aptidaoFisicaStatus" defaultValue={aluno.perfilAluno?.aptidaoFisicaStatus || 'LIBERADO'}>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                    <SelectItem value="LIBERADO">Liberado</SelectItem>
                    <SelectItem value="LIBERADO_COM_RESTRICOES">Com Restrições</SelectItem>
                    <SelectItem value="VETADO">Vetado</SelectItem>
                 </SelectContent>
               </Select>
           </div>
        </div>

        <div className="flex items-center space-x-2 border border-border p-3 rounded-md bg-muted/10">
           <Checkbox 
             id="aptidaoFisicaLaudo" 
             name="aptidaoFisicaLaudo" 
             defaultChecked={aluno.perfilAluno?.aptidaoFisicaLaudo} 
           />
           <Label htmlFor="aptidaoFisicaLaudo" className="font-medium cursor-pointer">Possui laudo médico entregue?</Label>
        </div>

        <div className="space-y-2">
           <Label htmlFor="aptidaoFisicaObs">Observações Médicas / Restrições</Label>
           <Textarea 
             id="aptidaoFisicaObs" 
             name="aptidaoFisicaObs" 
             defaultValue={aluno.perfilAluno?.aptidaoFisicaObs || ''} 
             placeholder="Ex: Alergia a picada de insetos..." 
             className="h-20 resize-none" 
           />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground/80 flex items-center gap-2">
            <span className="bg-primary/10 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs">4</span>
            Dados Escolares e Extras
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label htmlFor="escola">Escola</Label>
             <Input id="escola" name="escola" defaultValue={aluno.perfilAluno?.escola || ''} />
           </div>
           <div className="space-y-2">
             <Label htmlFor="serieEscolar">Série / Ano</Label>
             <Input id="serieEscolar" name="serieEscolar" defaultValue={aluno.perfilAluno?.serieEscolar || ''} />
           </div>
        </div>

        <div className="space-y-2 border border-border p-4 rounded-md bg-muted/10 transition-colors hover:bg-muted/20">
           <div className="flex items-center space-x-2 mb-2">
              <Checkbox 
                id="fazCursoExterno" 
                name="fazCursoExterno"
                defaultChecked={aluno.perfilAluno?.fazCursoExterno}
                onCheckedChange={(checked) => setTemCurso(checked === true)} 
              />
              <Label htmlFor="fazCursoExterno" className="font-medium cursor-pointer">Faz algum curso externo?</Label>
           </div>
           
           {temCurso && (
             <Input 
               name="cursoExternoDescricao" 
               defaultValue={aluno.perfilAluno?.cursoExternoDescricao || ''} 
               placeholder="Descreva qual curso e onde..." 
               className="mt-2 bg-background" 
             />
           )}
        </div>

        <div className="flex items-center space-x-2 border border-border p-3 rounded-md bg-muted/10">
           <Checkbox 
             id="termoResponsabilidadeAssinado" 
             name="termoResponsabilidadeAssinado" 
             defaultChecked={aluno.perfilAluno?.termoResponsabilidadeAssinado}
           />
           <Label htmlFor="termoResponsabilidadeAssinado" className="font-medium cursor-pointer">Termo de Responsabilidade Assinado?</Label>
        </div>
      </section>

      {state?.message && (
        <div className="bg-destructive/10 text-destructive p-3 rounded text-sm font-medium border border-destructive/20">
          {state.message}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}