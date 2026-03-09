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
import { AvatarUpload } from '@/components/admin/avatar-upload'; 

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

function ErrorMsg({ error }: { error?: string[] }) {
    if (!error || error.length === 0) return null;
    return <p className="text-xs text-destructive mt-1">{error[0]}</p>;
}

export default function AlunoForm({ cargos, companhias }: AlunoFormProps) {
  const [state, formAction] = useActionState(createAluno, undefined);
  const [cursoExterno, setCursoExterno] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);

  const handleSubmit = (formData: FormData) => {
    if (profilePic) {
      formData.append("fotoPerfil", profilePic);
    }
    formAction(formData);
  };

  return (
    <form action={handleSubmit} className="space-y-8 bg-card text-card-foreground">
      
      <section className="space-y-6">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground/80 flex items-center gap-2">
            <span className="bg-primary/10 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
            Dados Pessoais
        </h3>

        <div className="flex justify-center pb-4">
            <AvatarUpload onFileSelect={setProfilePic} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label htmlFor="nome">Nome Completo</Label>
             <Input id="nome" name="nome" placeholder="Nome completo do aluno" required />
             <ErrorMsg error={state?.errors?.nome} />
           </div>
           <div className="space-y-2">
             <Label htmlFor="cpf">CPF</Label>
             <Input id="cpf" name="cpf" placeholder="000.000.000-00" required maxLength={14} />
             <ErrorMsg error={state?.errors?.cpf} />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
               <Label htmlFor="dataNascimento">Data de Nascimento</Label>
               <Input id="dataNascimento" name="dataNascimento" type="date" />
            </div>
            <div className="space-y-2">
               <Label htmlFor="rg">RG</Label>
               <Input id="rg" name="rg" placeholder="Registro Geral" />
            </div>
            <div className="space-y-2">
               <Label htmlFor="rgEstadoEmissor">Órgão/UF</Label>
               <Input id="rgEstadoEmissor" name="rgEstadoEmissor" placeholder="Ex: SSP/MS" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
               <Label>Gênero</Label>
               <Select name="genero">
                 <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="MASCULINO">Masculino</SelectItem>
                   <SelectItem value="FEMININO">Feminino</SelectItem>
                 </SelectContent>
               </Select>
            </div>
            <div className="space-y-2">
               <Label htmlFor="telefone">Telefone / Celular</Label>
               <Input id="telefone" name="telefone" placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
               <Input id="email" name="email" type="email" placeholder="aluno@exemplo.com" />
               <ErrorMsg error={state?.errors?.email} />
            </div>
        </div>

        <div className="space-y-2">
           <Label htmlFor="endereco">Endereço Completo</Label>
           <Textarea 
             id="endereco" 
             name="endereco" 
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
               <Input id="numero" name="numero" placeholder="Ex: 502" required />
               <ErrorMsg error={state?.errors?.numero} />
            </div>
            <div className="space-y-2">
               <Label htmlFor="nomeDeGuerra">Nome de Guerra</Label>
               <Input id="nomeDeGuerra" name="nomeDeGuerra" placeholder="Ex: Sd. Silva" required />
            </div>
            <div className="space-y-2">
               <Label htmlFor="password">Senha Inicial</Label>
               <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
               <Label>Cargo / Graduação</Label>
               <Select name="cargoId">
                 <SelectTrigger><SelectValue placeholder="Selecione o Cargo" /></SelectTrigger>
                 <SelectContent>
                   {cargos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                 </SelectContent>
               </Select>
            </div>
            <div className="space-y-2">
               <Label>Companhia</Label>
               <Select name="companhiaId">
                 <SelectTrigger><SelectValue placeholder="Selecione a Companhia" /></SelectTrigger>
                 <SelectContent>
                   {companhias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                 </SelectContent>
               </Select>
            </div>
        </div>

        <div className="flex items-center space-x-2 border border-border p-3 rounded-md bg-muted/10">
           <Checkbox id="ingressoForaDeData" name="ingressoForaDeData" />
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
               <Select name="tipagemSanguinea">
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
                <Select name="aptidaoFisicaStatus" defaultValue="LIBERADO">
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
           <Checkbox id="aptidaoFisicaLaudo" name="aptidaoFisicaLaudo" />
           <Label htmlFor="aptidaoFisicaLaudo" className="font-medium cursor-pointer">Possui laudo médico entregue?</Label>
        </div>

        <div className="space-y-2">
           <Label htmlFor="aptidaoFisicaObs">Observações Médicas / Restrições</Label>
           <Textarea 
             id="aptidaoFisicaObs" 
             name="aptidaoFisicaObs" 
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
              <Input id="escola" name="escola" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serieEscolar">Série / Ano</Label>
              <Input id="serieEscolar" name="serieEscolar" />
            </div>
        </div>

        <div className="space-y-2 border border-border p-4 rounded-md bg-muted/10">
           <div className="flex items-center space-x-2 mb-2">
              <Checkbox 
                id="fazCursoExterno" 
                name="fazCursoExterno" 
                onCheckedChange={(checked) => setCursoExterno(checked === true)} 
              />
              <Label htmlFor="fazCursoExterno" className="font-medium cursor-pointer">Faz algum curso externo?</Label>
           </div>
           
           {cursoExterno && (
             <Input name="cursoExternoDescricao" placeholder="Qual curso e onde?" className="mt-2 bg-background" />
           )}
        </div>

        <div className="flex items-center space-x-2 border border-border p-3 rounded-md bg-muted/10">
           <Checkbox id="termoResponsabilidadeAssinado" name="termoResponsabilidadeAssinado" />
           <Label htmlFor="termoResponsabilidadeAssinado" className="font-medium cursor-pointer">Termo de Responsabilidade Assinado?</Label>
        </div>
      </section>

      <section className="space-y-4 pb-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground/80 flex items-center gap-2">
            <span className="bg-primary/10 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs">5</span>
            Dados do Responsável
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label htmlFor="responsavelNome">Nome do Responsável</Label>
             <Input id="responsavelNome" name="responsavelNome" placeholder="Nome completo do responsável" required />
             <ErrorMsg error={state?.errors?.responsavelNome} />
           </div>
           <div className="space-y-2">
             <Label htmlFor="responsavelCpf">CPF do Responsável</Label>
             <Input id="responsavelCpf" name="responsavelCpf" placeholder="000.000.000-00" required maxLength={14} />
             <ErrorMsg error={state?.errors?.responsavelCpf} />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
               <Label htmlFor="responsavelParentesco">Grau de Parentesco</Label>
               <Select name="responsavelParentesco" defaultValue="MAE">
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="MAE">Mãe</SelectItem>
                   <SelectItem value="PAI">Pai</SelectItem>
                   <SelectItem value="AVO">Avô/Avó</SelectItem>
                   <SelectItem value="TIO">Tio(a)</SelectItem>
                   <SelectItem value="IRMAO">Irmão(ã)</SelectItem>
                   <SelectItem value="OUTRO">Outro</SelectItem>
                 </SelectContent>
               </Select>
            </div>
            <div className="space-y-2">
               <Label htmlFor="responsavelTelefone">Telefone</Label>
               <Input id="responsavelTelefone" name="responsavelTelefone" placeholder="(00) 00000-0000" required />
            </div>
            <div className="space-y-2">
               <Label htmlFor="responsavelEmail">Email (Opcional)</Label>
               <Input id="responsavelEmail" name="responsavelEmail" type="email" placeholder="email@exemplo.com" />
            </div>
        </div>
      </section>

      {state?.message && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm font-medium border border-destructive/20 flex items-center">
          <span className="mr-2">⚠️</span> {state.message}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}