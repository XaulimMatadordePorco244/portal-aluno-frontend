"use client";

import { useState, useMemo, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSuspensao, updateSuspensao } from '@/actions/suspensao'; // <-- Importamos o update aqui
import { ChevronsUpDown, Check, Loader2, UserCheck, Globe, AlertOctagon, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Aluno {
  id: string;
  nome: string;
  nomeDeGuerra: string | null;
  perfilAluno: {
    id: string;
    cargo: {
      abreviacao: string;
    } | null;
  } | null;
}

interface Usuario {
  id: string;
  nome: string;
  role: string;
}

interface TipoSuspensao {
  id: string;
  titulo: string;
  descricao: string;
}

interface SuspensaoFormProps {
  alunos: Aluno[];
  usuarios: Usuario[];
  tipos: TipoSuspensao[];
  initialData?: {
    id: string;
    alunoId: string;
    dataOcorrencia: Date;
    dias: number;
    pontosRetirados: number;
    detalhes: string;
    tipoId: string;
    quemAplicouId: string | null;
    quemAplicouNome: string | null;
  };
}

export default function SuspensaoForm({ alunos, usuarios, tipos, initialData }: SuspensaoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditing = !!initialData;

  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [dataOcorrencia, setDataOcorrencia] = useState<string>('');
  const [dias, setDias] = useState<string>('');
  const [pontos, setPontos] = useState<string>('');
  const [detalhes, setDetalhes] = useState<string>('');
  const [tipoId, setTipoId] = useState<string>('');

  const [isExterno, setIsExterno] = useState(false);
  const [quemAplicouId, setQuemAplicouId] = useState<string>('AUTOR_LOGADO');
  const [quemAplicouNome, setQuemAplicouNome] = useState<string>('');
  const [selectedObserver, setSelectedObserver] = useState<Usuario | null>(null);

  const [isAlunoComboboxOpen, setIsAlunoComboboxOpen] = useState(false);
  const [isObserverComboboxOpen, setIsObserverComboboxOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      const aluno = alunos.find(a => a.perfilAluno?.id === initialData.alunoId);
      if (aluno) setSelectedAluno(aluno);

      setDataOcorrencia(new Date(initialData.dataOcorrencia).toISOString().split('T')[0]);
      setDias(initialData.dias.toString());
      setPontos(initialData.pontosRetirados.toString());
      setDetalhes(initialData.detalhes);
      setTipoId(initialData.tipoId);

      if (initialData.quemAplicouNome) {
        setIsExterno(true);
        setQuemAplicouNome(initialData.quemAplicouNome);
        setQuemAplicouId('AUTOR_LOGADO');
      } else {
        setIsExterno(false);
        setQuemAplicouId(initialData.quemAplicouId || 'AUTOR_LOGADO');
        if (initialData.quemAplicouId && initialData.quemAplicouId !== 'AUTOR_LOGADO') {
          const observer = usuarios.find(u => u.id === initialData.quemAplicouId);
          if (observer) setSelectedObserver(observer);
        }
      }
    } else {
      setDataOcorrencia(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, alunos, usuarios]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAluno) { toast.error("Selecione um aluno"); return; }
    if (!tipoId) { toast.error("Selecione o tipo de infração"); return; }
    if (Number(pontos) > 0) { toast.error("Os pontos de suspensão devem ser negativos!"); return; }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("alunoId", selectedAluno?.perfilAluno?.id || "");
      formData.append("data", `${dataOcorrencia}T12:00:00.000Z`);
      formData.append("dias", dias);
      formData.append("pontos", pontos);
      formData.append("detalhes", detalhes);
      formData.append("tipoId", tipoId);

      if (isExterno) {
        formData.append("quemAplicouNome", quemAplicouNome);
        formData.append("quemAplicouId", "");
      } else {
        formData.append("quemAplicouId", quemAplicouId);
      }

      let result;
      if (isEditing && initialData) {
        result = await updateSuspensao(initialData.id, formData);
      } else {
        result = await createSuspensao({}, formData);
      }

      if (result?.success) {
        toast.success(result.message);
        router.push("/admin/suspensoes");
        router.refresh();
      } else {
        toast.error(result?.message || "Erro ao processar suspensão.");
      }
    });
  };

  const { staffMembers } = useMemo(() => ({ staffMembers: usuarios.filter(u => u.role !== 'ALUNO') }), [usuarios]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      
      <div className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <Label className="text-base font-semibold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Quem será suspenso?
        </Label>
        
        <div className="pt-2">
          <Popover open={isAlunoComboboxOpen} onOpenChange={setIsAlunoComboboxOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-background text-muted-foreground font-normal">
                {selectedAluno ? <span className="text-foreground font-medium">{selectedAluno.nomeDeGuerra || selectedAluno.nome}</span> : "Pesquisar aluno (Nome de Guerra)..."}
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder="Digite o nome..." />
                <CommandList>
                  <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                  <CommandGroup>
                    {alunos.map(aluno => (
                      <CommandItem key={aluno.id} onSelect={() => { setSelectedAluno(aluno); setIsAlunoComboboxOpen(false); }} className="cursor-pointer">
                        <Check className={cn("mr-2 h-4 w-4", selectedAluno?.id === aluno.id ? "opacity-100" : "opacity-0")} />
                        {aluno.perfilAluno?.cargo?.abreviacao} GM {aluno.nomeDeGuerra || aluno.nome}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-2">
          <Label className="text-base font-semibold text-foreground flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-destructive" />
            Classificação do Fato
          </Label>
          <Select value={tipoId} onValueChange={setTipoId} required>
            <SelectTrigger className="w-full bg-background h-11">
              <SelectValue placeholder="Selecione o enquadramento da suspensão..." />
            </SelectTrigger>
            <SelectContent>
              {tipos.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id}>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{tipo.titulo}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">{tipo.descricao}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="data">Data do Ocorrido</Label>
            <Input id="data" type="date" value={dataOcorrencia} onChange={(e) => setDataOcorrencia(e.target.value)} required className="h-11 bg-background" />
          </div>
          <div className="space-y-2">
            <Label>Dias de Afastamento</Label>
            <Input type="number" min="1" placeholder="Ex: 3" value={dias} onChange={(e) => setDias(e.target.value)} required className="h-11 bg-background" />
          </div>
          <div className="space-y-2">
            <Label className="text-destructive">Pontos (Conceito)</Label>
            <Input type="number" max="0" step="0.5" placeholder="Ex: -5.0" value={pontos} onChange={(e) => setPontos(e.target.value)} required className="h-11 bg-background text-destructive font-semibold placeholder:text-destructive/50" />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Label>Descrição Detalhada</Label>
          <Textarea
            placeholder="Descreva o fato ocorrido com detalhes objetivos..."
            className="min-h-[120px] bg-background resize-none leading-relaxed"
            value={detalhes}
            onChange={(e) => setDetalhes(e.target.value)}
            required
          />
        </div>
      </div>

      <div className={cn(
        "space-y-4 rounded-xl border p-5 shadow-sm transition-all duration-300",
        isExterno ? "border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/10" : "border-border bg-card"
      )}>
        <div className="flex justify-between items-center">
          <Label className="flex items-center gap-2 text-base font-semibold">
            <UserCheck className={cn("w-4 h-4", isExterno ? "text-amber-600" : "text-primary")} /> 
            Quem ordenou a suspensão?
          </Label>
          <Button type="button" variant="ghost" size="sm" onClick={() => { setIsExterno(!isExterno); setQuemAplicouId('AUTOR_LOGADO'); setSelectedObserver(null); }} className={cn("text-xs font-bold uppercase tracking-wide", isExterno ? "text-amber-700 hover:text-amber-800 hover:bg-amber-100" : "text-muted-foreground")}>
            {isExterno ? "Voltar para Lista Interna" : "Visitante / Externo"}
          </Button>
        </div>

        {isExterno ? (
          <div className="relative animate-in slide-in-from-top-2 fade-in">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/70" />
            <Input placeholder="Ex: Cel. Silva / Autoridade Externa" className="pl-9 h-11 border-amber-200 focus-visible:ring-amber-500 bg-background" required={isExterno} value={quemAplicouNome} onChange={(e) => setQuemAplicouNome(e.target.value)} />
            <p className="text-[10px] text-amber-600/80 mt-1.5 ml-1 font-medium">* Este nome será salvo como texto e não terá vínculo com perfil de usuário.</p>
          </div>
        ) : (
          <div className="relative animate-in slide-in-from-top-2 fade-in">
            <Popover open={isObserverComboboxOpen} onOpenChange={setIsObserverComboboxOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between h-11 bg-background px-3 font-normal text-foreground">
                  <span className="flex items-center gap-2 truncate">
                    {quemAplicouId === 'AUTOR_LOGADO' ? (
                      <>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10"><User className="h-3 w-3 text-primary" /></span>
                        <span className="font-semibold text-primary">Eu mesmo (Lançador)</span>
                      </>
                    ) : selectedObserver ? (
                      <span className="font-medium text-foreground">{selectedObserver.nome}</span>
                    ) : "Selecione o responsável..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Buscar instrutor..." />
                  <CommandList>
                    <CommandItem value="AUTOR_LOGADO eu mesmo" onSelect={() => { setQuemAplicouId('AUTOR_LOGADO'); setSelectedObserver(null); setIsObserverComboboxOpen(false); }} className="cursor-pointer font-medium text-primary bg-primary/5">
                      Eu mesmo (Lançador)
                    </CommandItem>
                    <CommandGroup heading="Equipa de Comando">
                      {staffMembers.map((staff: Usuario) => (
                        <CommandItem key={staff.id} onSelect={() => { setQuemAplicouId(staff.id); setSelectedObserver(staff); setIsObserverComboboxOpen(false); }}>
                          {staff.nome}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="submit" disabled={isPending} variant={isEditing ? "default" : "destructive"} className="flex-1 h-12 text-base font-bold shadow-md">
          {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <AlertOctagon className="mr-2 h-5 w-5" />}
          {isEditing ? "Salvar Alterações" : "Confirmar Suspensão"}
        </Button>
        <Button variant="secondary" type="button" onClick={() => router.back()} className="h-12 px-6">
          Cancelar
        </Button>
      </div>
    </form>
  );
}