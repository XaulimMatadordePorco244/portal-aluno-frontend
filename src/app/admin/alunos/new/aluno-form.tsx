"use client";

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { createAluno } from '../actions';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react'; 

interface AlunoFormProps {
  cargos: { id: string, nome: string }[];
  companhias: { id: string, nome: string }[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Salvando...' : 'Cadastrar Aluno'}
    </Button>
  );
}

export default function AlunoForm({ cargos, companhias }: AlunoFormProps) {
  const [state, formAction] = useActionState(createAluno, undefined);
  const [cursoExterno, setCursoExterno] = useState(false); 

  return (
    <form action={formAction} className="space-y-8 bg-card text-card-foreground p-6 rounded-lg shadow-sm border border-border max-w-4xl mx-auto">
      
      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground">1. Dados Pessoais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input id="nome" name="nome" required className="bg-background" />
            <ErrorMsg error={state?.errors?.nome} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input id="cpf" name="cpf" maxLength={11} required placeholder="Somente números" className="bg-background" />
            <ErrorMsg error={state?.errors?.cpf} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
             <Label htmlFor="dataNascimento">Data de Nascimento</Label>
             <Input id="dataNascimento" name="dataNascimento" type="date" className="bg-background" />
          </div>
          <div className="space-y-2">
             <Label htmlFor="rg">RG</Label>
             <Input id="rg" name="rg" className="bg-background" />
          </div>
          <div className="space-y-2">
             <Label htmlFor="rgEstadoEmissor">Órgão/UF</Label>
             <Input id="rgEstadoEmissor" name="rgEstadoEmissor" placeholder="Ex: SSP/MS" className="bg-background" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="space-y-2">
              <Label>Gênero</Label>
              <Select name="genero">
                <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMININO">Feminino</SelectItem>
                </SelectContent>
              </Select>
           </div>
           <div className="space-y-2">
              <Label htmlFor="telefone">Telefone / Celular</Label>
              <Input id="telefone" name="telefone" className="bg-background" />
           </div>
           <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" className="bg-background" />
           </div>
        </div>

        <div className="space-y-2">
           <Label htmlFor="endereco">Endereço Completo</Label>
           <Textarea id="endereco" name="endereco" placeholder="Rua, Número, Bairro, CEP..." className="h-20 bg-background resize-none" />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground">2. Dados Institucionais</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="space-y-2">
              <Label htmlFor="numero">Número (Matrícula) *</Label>
              <Input id="numero" name="numero" required className="bg-background" />
              <ErrorMsg error={state?.errors?.numero} />
           </div>
           <div className="space-y-2">
              <Label htmlFor="nomeDeGuerra">Nome de Guerra *</Label>
              <Input id="nomeDeGuerra" name="nomeDeGuerra" required className="bg-background" />
           </div>
           <div className="space-y-2">
              <Label htmlFor="password">Senha Inicial</Label>
              <Input id="password" name="password" type="password" placeholder="Opcional" className="bg-background" />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
              <Label>Cargo / Graduação *</Label>
              <Select name="cargoId" required>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {cargos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
           </div>
           <div className="space-y-2">
              <Label>Companhia *</Label>
              <Select name="companhiaId" required>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {companhias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
           </div>
        </div>

        <div className="flex items-center space-x-2 border border-border p-3 rounded-md bg-muted/50">
           <Checkbox id="ingressoForaDeData" name="ingressoForaDeData" />
           <Label htmlFor="ingressoForaDeData" className="font-normal cursor-pointer">Ingresso fora de data (Define conceito inicial como 6.0)</Label>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground">3. Saúde e Aptidão</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
              <Label>Tipagem Sanguínea</Label>
              <Select name="tipagemSanguinea">
                <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione" /></SelectTrigger>
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
               <Select name="aptidaoFisicaStatus" defaultValue="LIBERADO">
                 <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                 <SelectContent>
                    <SelectItem value="LIBERADO">Liberado</SelectItem>
                    <SelectItem value="LIBERADO_COM_RESTRICOES">Com Restrições</SelectItem>
                    <SelectItem value="VETADO">Vetado</SelectItem>
                 </SelectContent>
               </Select>
           </div>
        </div>

        <div className="flex items-center space-x-2">
           <Checkbox id="aptidaoFisicaLaudo" name="aptidaoFisicaLaudo" />
           <Label htmlFor="aptidaoFisicaLaudo" className="cursor-pointer">Possui laudo médico entregue?</Label>
        </div>

        <div className="space-y-2">
           <Label htmlFor="aptidaoFisicaObs">Observações Médicas / Restrições</Label>
           <Textarea id="aptidaoFisicaObs" name="aptidaoFisicaObs" placeholder="Ex: Alergia a picada de insetos..." className="h-20 bg-background resize-none" />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground">4. Dados Escolares e Extras</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label htmlFor="escola">Escola</Label>
             <Input id="escola" name="escola" placeholder="Nome da Escola" className="bg-background" />
           </div>
           <div className="space-y-2">
             <Label htmlFor="serieEscolar">Série / Ano</Label>
             <Input id="serieEscolar" name="serieEscolar" placeholder="Ex: 9º Ano" className="bg-background" />
           </div>
        </div>

        <div className="space-y-2 border border-border p-3 rounded-md bg-muted/50">
           <div className="flex items-center space-x-2 mb-2">
              <Checkbox 
                id="fazCursoExterno" 
                name="fazCursoExterno" 
                onCheckedChange={(checked) => setCursoExterno(checked === true)} 
              />
              <Label htmlFor="fazCursoExterno" className="cursor-pointer">Faz algum curso externo?</Label>
           </div>
           
           {cursoExterno && (
             <Input name="cursoExternoDescricao" placeholder="Qual curso e onde?" className="mt-2 bg-background" />
           )}
        </div>

        <div className="flex items-center space-x-2">
           <Checkbox id="termoResponsabilidadeAssinado" name="termoResponsabilidadeAssinado" />
           <Label htmlFor="termoResponsabilidadeAssinado" className="cursor-pointer">Termo de Responsabilidade Assinado?</Label>
        </div>
      </section>

      {state?.message && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm font-medium border border-destructive/20 flex items-center">
          <span className="mr-2">⚠️</span> {state.message}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

function ErrorMsg({ error }: { error?: string[] }) {
  if (!error || error.length === 0) return null;
  return <p className="text-xs text-destructive mt-1 font-medium ml-1">{error[0]}</p>;
}