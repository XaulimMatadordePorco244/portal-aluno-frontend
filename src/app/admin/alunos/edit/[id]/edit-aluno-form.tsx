"use client";

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button'; 
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { createAluno } from '../../actions'; // Ajuste o import da action se necessário (ex: updateAluno)
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
      {pending ? 'Salvando...' : 'Salvar Alterações'}
    </Button>
  );
}

function ErrorMsg({ error }: { error?: string[] }) {
  if (!error || error.length === 0) return null;
  return <p className="text-xs text-destructive mt-1 font-medium">{error[0]}</p>;
}

export default function EditAlunoForm({ cargos, companhias, escolas, aluno }: AlunoFormProps) {
  const [state, formAction] = useActionState(createAluno, undefined);
  const [cursoExterno, setCursoExterno] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);

  useEffect(() => {
    if (state?.formData) {
      setCursoExterno(state.formData.fazCursoExterno === 'on');
    } else if (aluno.perfilAluno?.fazCursoExterno) {
      setCursoExterno(true);
    }
  }, [state, aluno]);

  const handleSubmit = (formData: FormData) => {
    formData.append("id", aluno.id);
    if (profilePic) {
      formData.append("fotoPerfil", profilePic);
    }
    formAction(formData);
  };

  const getBirthDate = () => {
    if (state?.formData?.dataNascimento) return state.formData.dataNascimento as string;
    if (aluno.dataNascimento) {
      return new Date(aluno.dataNascimento).toISOString().split('T')[0];
    }
    return "";
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
            <Label htmlFor="nome">Nome Completo <span className="text-red-500">*</span></Label>
            <Input
              id="nome" name="nome" placeholder="Nome completo do aluno" required
              defaultValue={(state?.formData?.nome as string) ?? aluno.nome}
              className={state?.errors?.nome ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            <ErrorMsg error={state?.errors?.nome} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF <span className="text-red-500">*</span></Label>
            <Input
              id="cpf" name="cpf" placeholder="000.000.000-00" required maxLength={14}
              defaultValue={(state?.formData?.cpf as string) ?? aluno.cpf}
              className={state?.errors?.cpf ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            <ErrorMsg error={state?.errors?.cpf} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dataNascimento">Data de Nascimento <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Input id="dataNascimento" name="dataNascimento" type="date" defaultValue={getBirthDate()} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rg">RG <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Input id="rg" name="rg" placeholder="Registro Geral" defaultValue={(state?.formData?.rg as string) ?? (aluno.rg || "")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rgEstadoEmissor">Órgão/UF <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Input id="rgEstadoEmissor" name="rgEstadoEmissor" placeholder="Ex: SSP/MS" defaultValue={(state?.formData?.rgEstadoEmissor as string) ?? (aluno.rgEstadoEmissor || "")} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Gênero <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Select name="genero" defaultValue={(state?.formData?.genero as string) ?? (aluno.genero || "")}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MASCULINO">Masculino</SelectItem>
                <SelectItem value="FEMININO">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone / Celular <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Input id="telefone" name="telefone" placeholder="(00) 00000-0000" defaultValue={(state?.formData?.telefone as string) ?? (aluno.telefone || "")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Input id="email" name="email" type="email" placeholder="aluno@exemplo.com" defaultValue={(state?.formData?.email as string) ?? (aluno.email || "")} className={state?.errors?.email ? "border-destructive focus-visible:ring-destructive" : ""} />
            <ErrorMsg error={state?.errors?.email} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço Completo <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
          <Textarea id="endereco" name="endereco" placeholder="Rua, Número, Bairro, CEP..." className="h-20 resize-none" defaultValue={(state?.formData?.endereco as string) ?? (aluno.perfilAluno?.endereco || "")} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground/80 flex items-center gap-2">
          <span className="bg-primary/10 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
          Dados Institucionais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numero">Número (Matrícula) <span className="text-red-500">*</span></Label>
            <Input id="numero" name="numero" placeholder="Ex: 502" required defaultValue={(state?.formData?.numero as string) ?? (aluno.perfilAluno?.numero || "")} className={state?.errors?.numero ? "border-destructive focus-visible:ring-destructive" : ""} />
            <ErrorMsg error={state?.errors?.numero} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nomeDeGuerra">Nome de Guerra <span className="text-red-500">*</span></Label>
            <Input id="nomeDeGuerra" name="nomeDeGuerra" placeholder="Nome na farda" required defaultValue={(state?.formData?.nomeDeGuerra as string) ?? (aluno.nomeDeGuerra || "")} />
          </div>
          <div className="space-y-2 flex flex-col justify-end pb-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="foraDeData" name="foraDeData" defaultChecked={state?.formData ? state.formData.foraDeData === 'on' : (aluno.perfilAluno?.foraDeData || false)} />
              <Label htmlFor="foraDeData" className="font-normal cursor-pointer">Aluno Fora de Data?</Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cargo / Posto <span className="text-red-500">*</span></Label>
            <Select name="cargoId" defaultValue={(state?.formData?.cargoId as string) ?? (aluno.perfilAluno?.cargoId || "")}>
              <SelectTrigger className={state?.errors?.cargoId ? "border-destructive focus-visible:ring-destructive" : ""}><SelectValue placeholder="Selecione um cargo" /></SelectTrigger>
              <SelectContent>
                {cargos.map((cargo) => (
                  <SelectItem key={cargo.id} value={cargo.id}>{cargo.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ErrorMsg error={state?.errors?.cargoId} />
          </div>

          <div className="space-y-2">
            <Label>Companhia <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Select name="companhiaId" defaultValue={(state?.formData?.companhiaId as string) ?? (aluno.perfilAluno?.companhiaId || "")}>
              <SelectTrigger><SelectValue placeholder="Selecione a companhia" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {companhias.map((cia) => (
                  <SelectItem key={cia.id} value={cia.id}>{cia.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground/80 flex items-center gap-2">
          <span className="bg-primary/10 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs">3</span>
          Saúde e Aptidão Física
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Tipo Sanguíneo <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Select name="tipagemSanguinea" defaultValue={(state?.formData?.tipagemSanguinea as string) ?? (aluno.perfilAluno?.tipagemSanguinea || "")}>
              <SelectTrigger><SelectValue placeholder="Ex: O+" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="O_POSITIVO">O Positivo (+)</SelectItem>
                <SelectItem value="O_NEGATIVO">O Negativo (-)</SelectItem>
                <SelectItem value="A_POSITIVO">A Positivo (+)</SelectItem>
                <SelectItem value="A_NEGATIVO">A Negativo (-)</SelectItem>
                <SelectItem value="B_POSITIVO">B Positivo (+)</SelectItem>
                <SelectItem value="B_NEGATIVO">B Negativo (-)</SelectItem>
                <SelectItem value="AB_POSITIVO">AB Positivo (+)</SelectItem>
                <SelectItem value="AB_NEGATIVO">AB Negativo (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Aptidão Física <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Select name="aptidaoFisicaStatus" defaultValue={(state?.formData?.aptidaoFisicaStatus as string) ?? (aluno.perfilAluno?.aptidaoFisicaStatus || "")}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="LIBERADO">Liberado p/ Atividades</SelectItem>
                <SelectItem value="LIBERADO_COM_RESTRICOES">Liberado c/ Restrições</SelectItem>
                <SelectItem value="VETADO">Vetado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 flex flex-col justify-end pb-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="aptidaoFisicaLaudo" name="aptidaoFisicaLaudo" defaultChecked={state?.formData ? state.formData.aptidaoFisicaLaudo === 'on' : (aluno.perfilAluno?.aptidaoFisicaLaudo || false)} />
              <Label htmlFor="aptidaoFisicaLaudo" className="font-normal cursor-pointer">Entregou Laudo Médico?</Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="aptidaoFisicaObs">Observações Médicas / Restrições <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
          <Textarea id="aptidaoFisicaObs" name="aptidaoFisicaObs" placeholder="Alergias, asma, restrições a exercícios específicos..." className="h-16 resize-none" defaultValue={(state?.formData?.aptidaoFisicaObs as string) ?? (aluno.perfilAluno?.aptidaoFisicaObs || "")} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground/80 flex items-center gap-2">
          <span className="bg-primary/10 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs">4</span>
          Dados Escolares
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Escola <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Select name="escolaId" defaultValue={(state?.formData?.escolaId as string) ?? (aluno.perfilAluno?.escolaId || "")}>
              <SelectTrigger><SelectValue placeholder="Selecione a escola" /></SelectTrigger>
              <SelectContent>
                {escolas.map((escola) => (
                  <SelectItem key={escola.id} value={escola.id}>{escola.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ano/Série <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Select name="serieEscolar" defaultValue={(state?.formData?.serieEscolar as string) ?? (aluno.perfilAluno?.serieEscolar || "")}>
              <SelectTrigger><SelectValue placeholder="Ex: 1º Ano Ens. Médio" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="QUARTO_ANO_FUNDAMENTAL">4º Ano do Fundamental</SelectItem>
                <SelectItem value="QUINTO_ANO_FUNDAMENTAL">5º Ano do Fundamental</SelectItem>
                <SelectItem value="SEXTO_ANO_FUNDAMENTAL">6º Ano do Fundamental</SelectItem>
                <SelectItem value="SETIMO_ANO_FUNDAMENTAL">7º Ano do Fundamental</SelectItem>
                <SelectItem value="OITAVO_ANO_FUNDAMENTAL">8º Ano do Fundamental</SelectItem>
                <SelectItem value="NONO_ANO_FUNDAMENTAL">9º Ano do Fundamental</SelectItem>
                <SelectItem value="PRIMEIRO_ANO_MEDIO">1º Ano do Ensino Médio</SelectItem>
                <SelectItem value="SEGUNDO_ANO_MEDIO">2º Ano do Ensino Médio</SelectItem>
                <SelectItem value="TERCEIRO_ANO_MEDIO">3º Ano do Ensino Médio</SelectItem>
                <SelectItem value="CONCLUIDO">Ensino Médio Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="turno">Turno <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Select name="turno" defaultValue={(state?.formData?.turno as string) ?? (aluno.perfilAluno?.turno || "")}>
              <SelectTrigger><SelectValue placeholder="Matutino, Vespertino..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MATUTINO">Matutino</SelectItem>
                <SelectItem value="VESPERTINO">Vespertino</SelectItem>
                <SelectItem value="NOTURNO">Noturno</SelectItem>
                <SelectItem value="INTEGRAL">Integral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="turmaEscolar">Nome da Turma <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Input id="turmaEscolar" name="turmaEscolar" placeholder="Ex: Turma A, Sala 3" defaultValue={(state?.formData?.turmaEscolar as string) ?? (aluno.perfilAluno?.turmaEscolar || "")} />
          </div>
        </div>

        <div className="space-y-4 border p-4 rounded-md bg-muted/20">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="fazCursoExterno" 
              name="fazCursoExterno" 
              checked={cursoExterno}
              onCheckedChange={(checked) => setCursoExterno(checked as boolean)}
            />
            <Label htmlFor="fazCursoExterno" className="font-medium cursor-pointer">Aluno realiza algum curso externo?</Label>
          </div>
          
          {cursoExterno && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="cursoExternoDescricao">Descreva o curso, local e horários</Label>
              <Textarea id="cursoExternoDescricao" name="cursoExternoDescricao" placeholder="Ex: Curso de Inglês às terças e quintas de manhã..." className="h-16 resize-none" defaultValue={(state?.formData?.cursoExternoDescricao as string) ?? (aluno.perfilAluno?.cursoExternoDescricao || "")} />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 text-foreground/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs">5</span>
            Responsável Legal
          </div>
        </h3>
        
        <div className="flex items-center space-x-2 pb-2">
          <Checkbox id="termoResponsabilidadeAssinado" name="termoResponsabilidadeAssinado" defaultChecked={state?.formData ? state.formData.termoResponsabilidadeAssinado === 'on' : (aluno.perfilAluno?.termoResponsabilidadeAssinado || false)} />
          <Label htmlFor="termoResponsabilidadeAssinado" className="font-normal cursor-pointer text-green-700 dark:text-green-500">Termo de Responsabilidade Assinado?</Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="responsavelNome">Nome do Responsável <span className="text-red-500">*</span></Label>
            <Input id="responsavelNome" name="responsavelNome" placeholder="Nome completo" required defaultValue={(state?.formData?.responsavelNome as string) ?? (aluno.perfilAluno?.responsavelNome || "")} className={state?.errors?.responsavelNome ? "border-destructive focus-visible:ring-destructive" : ""} />
            <ErrorMsg error={state?.errors?.responsavelNome} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsavelCpf">CPF do Responsável <span className="text-red-500">*</span></Label>
            <Input id="responsavelCpf" name="responsavelCpf" placeholder="000.000.000-00" required maxLength={14} defaultValue={(state?.formData?.responsavelCpf as string) ?? (aluno.perfilAluno?.responsavelCpf || "")} className={state?.errors?.responsavelCpf ? "border-destructive focus-visible:ring-destructive" : ""} />
            <ErrorMsg error={state?.errors?.responsavelCpf} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Grau de Parentesco <span className="text-red-500">*</span></Label>
            <Select name="responsavelParentesco" defaultValue={(state?.formData?.responsavelParentesco as string) ?? (aluno.perfilAluno?.responsavelParentesco || "")}>
              <SelectTrigger className={state?.errors?.responsavelParentesco ? "border-destructive focus-visible:ring-destructive" : ""}><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PAI">Pai</SelectItem>
                <SelectItem value="MAE">Mãe</SelectItem>
                <SelectItem value="AVO">Avô / Avó</SelectItem>
                <SelectItem value="TIO">Tio / Tia</SelectItem>
                <SelectItem value="IRMAO">Irmão / Irmã</SelectItem>
                <SelectItem value="OUTRO">Outro (Tutor Legal)</SelectItem>
              </SelectContent>
            </Select>
            <ErrorMsg error={state?.errors?.responsavelParentesco} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsavelTelefone">Telefone <span className="text-red-500">*</span></Label>
            <Input id="responsavelTelefone" name="responsavelTelefone" placeholder="(00) 00000-0000" required defaultValue={(state?.formData?.responsavelTelefone as string) ?? (aluno.perfilAluno?.responsavelTelefone || "")} className={state?.errors?.responsavelTelefone ? "border-destructive focus-visible:ring-destructive" : ""} />
            <ErrorMsg error={state?.errors?.responsavelTelefone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsavelEmail">Email <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
            <Input id="responsavelEmail" name="responsavelEmail" type="email" placeholder="email@exemplo.com" defaultValue={(state?.formData?.responsavelEmail as string) ?? (aluno.perfilAluno?.responsavelEmail || "")} className={state?.errors?.responsavelEmail ? "border-destructive focus-visible:ring-destructive" : ""} />
            <ErrorMsg error={state?.errors?.responsavelEmail} />
          </div>
        </div>
      </section>

      {state?.message && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm font-medium border border-destructive/20 flex items-center">
          <span className="mr-2">⚠️</span>
          {state.message}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}