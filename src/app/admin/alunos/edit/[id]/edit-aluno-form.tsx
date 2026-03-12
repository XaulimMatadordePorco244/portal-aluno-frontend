"use client";

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button'; 
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { createAluno } from '../../actions';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { AvatarUpload } from '@/components/admin/avatar-upload';

export interface AlunoEditado {
  id: string;
  nome: string;
  nomeDeGuerra: string | null;
  cpf: string;
  email: string | null;
  telefone: string | null;
  rg: string | null;
  rgEstadoEmissor: string | null;
  fotoUrl: string | null;
  dataNascimento: Date | string | null;
  genero: 'MASCULINO' | 'FEMININO' | null;
  perfilAluno: {
    numero: string | null;      
    cargoId: string | null;    
    companhiaId: string | null; 
    foraDeData: boolean;
    tipagemSanguinea: string | null;
    aptidaoFisicaStatus: string | null;
    aptidaoFisicaLaudo: boolean;
    aptidaoFisicaObs: string | null;
    endereco: string | null;
    escolaId: string | null;
    serieEscolar: string | null;
    turno: string | null;
    turmaEscolar: string | null;
    fazCursoExterno: boolean;
    cursoExternoDescricao: string | null;
    termoResponsabilidadeAssinado: boolean;
    responsavelNome: string | null;
    responsavelCpf: string | null;
    responsavelParentesco: string | null;
    responsavelTelefone: string | null;
    responsavelEmail: string | null;
  } | null;
}

interface AlunoFormProps {
  cargos: { id: string, nome: string }[];
  companhias: { id: string, nome: string }[];
  escolas: { id: string, nome: string }[];
  aluno: AlunoEditado; 
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
  return <p className="text-xs text-destructive mt-1 font-medium">{error[0]}</p>;
}

export default function AlunoForm({ cargos, companhias, escolas }: AlunoFormProps) {
  const [state, formAction] = useActionState(createAluno, undefined);
  const [cursoExterno, setCursoExterno] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);

  useEffect(() => {
    if (state?.formData?.fazCursoExterno === 'on') {
      setCursoExterno(true);
    }
  }, [state]);

  const handleSubmit = (formData: FormData) => {
    if (profilePic) {
      formData.append("fotoPerfil", profilePic);
    }
    formAction(formData);
  };

  return (
    <form action={handleSubmit} className="space-y-8 bg-card text-card-foreground">
      
      {/* 1. Dados Pessoais */}
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
            <Label htmlFor="nome">Nome Completo <span className="text-red-500">*</span></Label>
            <Input
              id="nome" name="nome" placeholder="Nome completo do aluno" required
              defaultValue={state?.formData?.nome as string}
              className={state?.errors?.nome ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            <ErrorMsg error={state?.errors?.nome} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF <span className="text-red-500">*</span></Label>
            <Input
              id="cpf" name="cpf" placeholder="000.000.000-00" required maxLength={14}
              defaultValue={state?.formData?.cpf as string}
              className={state?.errors?.cpf ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            <ErrorMsg error={state?.errors?.cpf} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dataNascimento">Data de Nascimento <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Input id="dataNascimento" name="dataNascimento" type="date" defaultValue={state?.formData?.dataNascimento as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rg">RG <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Input id="rg" name="rg" placeholder="Registro Geral" defaultValue={state?.formData?.rg as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rgEstadoEmissor">Órgão/UF <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Input id="rgEstadoEmissor" name="rgEstadoEmissor" placeholder="Ex: SSP/MS" defaultValue={state?.formData?.rgEstadoEmissor as string} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Gênero <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Select name="genero" defaultValue={state?.formData?.genero as string}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MASCULINO">Masculino</SelectItem>
                <SelectItem value="FEMININO">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone / Celular <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Input id="telefone" name="telefone" placeholder="(00) 00000-0000" defaultValue={state?.formData?.telefone as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Input
              id="email" name="email" type="email" placeholder="aluno@exemplo.com"
              defaultValue={state?.formData?.email as string}
              className={state?.errors?.email ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            <ErrorMsg error={state?.errors?.email} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço Completo <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
          <Textarea id="endereco" name="endereco" placeholder="Rua, Número, Bairro, CEP..." className="h-20 resize-none" defaultValue={state?.formData?.endereco as string} />
        </div>
      </section>

      {/* 2. Dados Institucionais */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground/80 flex items-center gap-2">
          <span className="bg-primary/10 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
          Dados Institucionais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numero">Número (Matrícula) <span className="text-red-500">*</span></Label>
            <Input id="numero" name="numero" placeholder="Ex: 502" required defaultValue={state?.formData?.numero as string} className={state?.errors?.numero ? "border-destructive focus-visible:ring-destructive" : ""} />
            <ErrorMsg error={state?.errors?.numero} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nomeDeGuerra">Nome de Guerra <span className="text-red-500">*</span></Label>
            <Input id="nomeDeGuerra" name="nomeDeGuerra" placeholder="Ex: Sd. Silva" required defaultValue={state?.formData?.nomeDeGuerra as string} className={state?.errors?.nomeDeGuerra ? "border-destructive focus-visible:ring-destructive" : ""} />
            <ErrorMsg error={state?.errors?.nomeDeGuerra} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha Inicial <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Input id="password" name="password" type="password" placeholder="Deixe em branco para senha padrão" defaultValue={state?.formData?.password as string} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cargo / Graduação <span className="text-red-500">*</span></Label>
            <Select name="cargoId" defaultValue={state?.formData?.cargoId as string}>
              <SelectTrigger className={state?.errors?.cargoId ? "border-destructive focus-visible:ring-destructive" : ""}><SelectValue placeholder="Selecione o Cargo" /></SelectTrigger>
              <SelectContent>
                {cargos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <ErrorMsg error={state?.errors?.cargoId} />
          </div>
          <div className="space-y-2">
            <Label>Companhia <span className="text-red-500">*</span></Label>
            <Select name="companhiaId" defaultValue={state?.formData?.companhiaId as string}>
              <SelectTrigger className={state?.errors?.companhiaId ? "border-destructive focus-visible:ring-destructive" : ""}><SelectValue placeholder="Selecione a Companhia" /></SelectTrigger>
              <SelectContent>
                {companhias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <ErrorMsg error={state?.errors?.companhiaId} />
          </div>
        </div>

        <div className="flex items-center space-x-2 border border-border p-3 rounded-md bg-muted/10">
          <Checkbox id="ingressoForaDeData" name="ingressoForaDeData" defaultChecked={state?.formData?.ingressoForaDeData === 'on'} />
          <Label htmlFor="ingressoForaDeData" className="font-medium cursor-pointer">Ingresso fora de data (Matrícula tardia)</Label>
        </div>
      </section>

      {/* 3. Saúde e Aptidão */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground/80 flex items-center gap-2">
          <span className="bg-primary/10 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs">3</span>
          Saúde e Aptidão
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipagem Sanguínea <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Select name="tipagemSanguinea" defaultValue={state?.formData?.tipagemSanguinea as string}>
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
            <Label>Aptidão Física <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Select name="aptidaoFisicaStatus" defaultValue={(state?.formData?.aptidaoFisicaStatus as string) || "LIBERADO"}>
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
          <Checkbox id="aptidaoFisicaLaudo" name="aptidaoFisicaLaudo" defaultChecked={state?.formData?.aptidaoFisicaLaudo === 'on'} />
          <Label htmlFor="aptidaoFisicaLaudo" className="font-medium cursor-pointer">Possui laudo médico entregue?</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="aptidaoFisicaObs">Observações Médicas / Restrições <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
          <Textarea id="aptidaoFisicaObs" name="aptidaoFisicaObs" placeholder="Ex: Alergia a picada de insetos..." className="h-20 resize-none" defaultValue={state?.formData?.aptidaoFisicaObs as string} />
        </div>
      </section>

      {/* 4. Dados Escolares e Extras */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground/80 flex items-center gap-2">
          <span className="bg-primary/10 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs">4</span>
          Dados Escolares e Extras
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Escola <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Select name="escolaId" defaultValue={state?.formData?.escolaId as string}>
              <SelectTrigger className={state?.errors?.escolaId ? "border-destructive focus-visible:ring-destructive" : ""}>
                <SelectValue placeholder="Selecione a Escola" />
              </SelectTrigger>
              <SelectContent>
                {escolas.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <ErrorMsg error={state?.errors?.escolaId} />
          </div>

          <div className="space-y-2">
            <Label>Série Escolar <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Select name="serieEscolar" defaultValue={state?.formData?.serieEscolar as string}>
              <SelectTrigger><SelectValue placeholder="Selecione a Série" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="QUARTO_ANO_FUNDAMENTAL">4º Ano do Ensino Fundamental</SelectItem>
                <SelectItem value="QUINTO_ANO_FUNDAMENTAL">5º Ano do Ensino Fundamental</SelectItem>
                <SelectItem value="SEXTO_ANO_FUNDAMENTAL">6º Ano do Ensino Fundamental</SelectItem>
                <SelectItem value="SETIMO_ANO_FUNDAMENTAL">7º Ano do Ensino Fundamental</SelectItem>
                <SelectItem value="OITAVO_ANO_FUNDAMENTAL">8º Ano do Ensino Fundamental</SelectItem>
                <SelectItem value="NONO_ANO_FUNDAMENTAL">9º Ano do Ensino Fundamental</SelectItem>
                <SelectItem value="PRIMEIRO_ANO_MEDIO">1º Ano do Ensino Médio</SelectItem>
                <SelectItem value="SEGUNDO_ANO_MEDIO">2º Ano do Ensino Médio</SelectItem>
                <SelectItem value="TERCEIRO_ANO_MEDIO">3º Ano do Ensino Médio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Turno <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Select name="turno" defaultValue={state?.formData?.turno as string}>
              <SelectTrigger><SelectValue placeholder="Selecione o Turno" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MATUTINO">Matutino</SelectItem>
                <SelectItem value="VESPERTINO">Vespertino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="turmaEscolar">Turma (Ex: A, B) <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Input 
              id="turmaEscolar" name="turmaEscolar" placeholder="Ex: A" 
              defaultValue={state?.formData?.turmaEscolar as string} 
            />
          </div>
        </div>

        <div className="space-y-2 border border-border p-4 rounded-md bg-muted/10">
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox id="fazCursoExterno" name="fazCursoExterno" checked={cursoExterno} onCheckedChange={(checked) => setCursoExterno(checked === true)} />
            <Label htmlFor="fazCursoExterno" className="font-medium cursor-pointer">Faz algum curso externo?</Label>
          </div>
          {cursoExterno && (
            <Input name="cursoExternoDescricao" placeholder="Qual curso e onde?" className="mt-2 bg-background" defaultValue={state?.formData?.cursoExternoDescricao as string} />
          )}
        </div>

        <div className="flex items-center space-x-2 border border-border p-3 rounded-md bg-muted/10">
          <Checkbox id="termoResponsabilidadeAssinado" name="termoResponsabilidadeAssinado" defaultChecked={state?.formData?.termoResponsabilidadeAssinado === 'on'} />
          <Label htmlFor="termoResponsabilidadeAssinado" className="font-medium cursor-pointer">Termo de Responsabilidade Assinado?</Label>
        </div>
      </section>

      {/* 5. Dados do Responsável */}
      <section className="space-y-4 pb-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground/80 flex items-center gap-2">
          <span className="bg-primary/10 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs">5</span>
          Dados do Responsável
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="responsavelNome">Nome do Responsável <span className="text-red-500">*</span></Label>
            <Input id="responsavelNome" name="responsavelNome" placeholder="Nome completo do responsável" required defaultValue={state?.formData?.responsavelNome as string} className={state?.errors?.responsavelNome ? "border-destructive focus-visible:ring-destructive" : ""} />
            <ErrorMsg error={state?.errors?.responsavelNome} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsavelCpf">CPF do Responsável <span className="text-red-500">*</span></Label>
            <Input id="responsavelCpf" name="responsavelCpf" placeholder="000.000.000-00" required maxLength={14} defaultValue={state?.formData?.responsavelCpf as string} className={state?.errors?.responsavelCpf ? "border-destructive focus-visible:ring-destructive" : ""} />
            <ErrorMsg error={state?.errors?.responsavelCpf} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="responsavelParentesco">Grau de Parentesco <span className="text-red-500">*</span></Label>
            <Select name="responsavelParentesco" defaultValue={(state?.formData?.responsavelParentesco as string) || "MAE"}>
              <SelectTrigger className={state?.errors?.responsavelParentesco ? "border-destructive focus-visible:ring-destructive" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MAE">Mãe</SelectItem>
                <SelectItem value="PAI">Pai</SelectItem>
                <SelectItem value="AVO">Avô/Avó</SelectItem>
                <SelectItem value="TIO">Tio(a)</SelectItem>
                <SelectItem value="IRMAO">Irmão(ã)</SelectItem>
                <SelectItem value="OUTRO">Outro</SelectItem>
              </SelectContent>
            </Select>
            <ErrorMsg error={state?.errors?.responsavelParentesco} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsavelTelefone">Telefone <span className="text-red-500">*</span></Label>
            <Input id="responsavelTelefone" name="responsavelTelefone" placeholder="(00) 00000-0000" required defaultValue={state?.formData?.responsavelTelefone as string} className={state?.errors?.responsavelTelefone ? "border-destructive focus-visible:ring-destructive" : ""} />
            <ErrorMsg error={state?.errors?.responsavelTelefone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsavelEmail">Email <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Input id="responsavelEmail" name="responsavelEmail" type="email" placeholder="email@exemplo.com" defaultValue={state?.formData?.responsavelEmail as string} className={state?.errors?.responsavelEmail ? "border-destructive focus-visible:ring-destructive" : ""} />
            <ErrorMsg error={state?.errors?.responsavelEmail} />
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