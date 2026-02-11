"use client";

import { useState, useEffect, useMemo, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAnotacao, updateAnotacao } from '@/actions/anotacoes'; 
import { Usuario, TipoDeAnotacao, Companhia, PerfilAluno, Cargo } from '@prisma/client';
import { Check, ChevronsUpDown, X, Loader2, UserCheck, Globe, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type AlunoComCompanhia = Usuario & {
  perfilAluno: (PerfilAluno & {
    companhia: Companhia | null;
    cargo: Cargo | null;
  }) | null;
}

export interface FormState {
  errors?: {
    alunoIds?: string[];
    tipoId?: string[];
    data?: string[];
    pontos?: string[];
    detalhes?: string[];
    quemAnotouId?: string[];
    quemAnotouNome?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
}

interface AnotacaoFormProps {
  alunos: AlunoComCompanhia[];
  usuarios: AlunoComCompanhia[];
  tiposDeAnotacao: TipoDeAnotacao[];
  preSelectedAlunoId?: string; 
  initialData?: {
    id: string;
    alunoId: string;
    tipoId: string;
    data: Date;
    pontos: number;
    detalhes: string | null;
    quemAnotouId: string | null;
    quemAnotouNome: string | null;
  };
}

export default function AnotacaoForm({ 
  alunos, 
  usuarios,
  tiposDeAnotacao, 
  preSelectedAlunoId, 
  initialData 
}: AnotacaoFormProps) {
  
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<FormState>({});
  
  const isEditing = !!initialData;

  const [selectionMode, setSelectionMode] = useState<'companhia' | 'individual'>('individual');
  const [selectedAlunos, setSelectedAlunos] = useState<AlunoComCompanhia[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<TipoDeAnotacao | null>(null);
  const [pontos, setPontos] = useState<number | string>('');
  const [dataOcorrencia, setDataOcorrencia] = useState<string>('');
  const [detalhes, setDetalhes] = useState<string>('');

  const [isExterno, setIsExterno] = useState(false);
  const [quemAnotouId, setQuemAnotouId] = useState<string>('AUTOR_LOGADO');
  const [quemAnotouNome, setQuemAnotouNome] = useState<string>('');
  const [selectedObserver, setSelectedObserver] = useState<AlunoComCompanhia | null>(null);

  const [isTipoComboboxOpen, setIsTipoComboboxOpen] = useState(false);
  const [isAlunoComboboxOpen, setIsAlunoComboboxOpen] = useState(false);
  const [isObserverComboboxOpen, setIsObserverComboboxOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      const aluno = alunos.find(a => a.perfilAluno?.id === initialData.alunoId);
      if (aluno) setSelectedAlunos([aluno]);

      const tipo = tiposDeAnotacao.find(t => t.id === initialData.tipoId);
      if (tipo) setSelectedTipo(tipo);

      setDataOcorrencia(new Date(initialData.data).toISOString().split('T')[0]);
      setPontos(Number(initialData.pontos));
      setDetalhes(initialData.detalhes || '');
      
      if (initialData.quemAnotouNome) {
        setIsExterno(true);
        setQuemAnotouNome(initialData.quemAnotouNome);
        setQuemAnotouId('AUTOR_LOGADO');
      } else {
        setIsExterno(false);
        setQuemAnotouId(initialData.quemAnotouId || 'AUTOR_LOGADO');
        if (initialData.quemAnotouId && initialData.quemAnotouId !== 'AUTOR_LOGADO') {
            const u = usuarios.find(user => user.id === initialData.quemAnotouId);
            if (u) setSelectedObserver(u);
        }
      }

    } else if (preSelectedAlunoId) {
      const aluno = alunos.find(a => a.perfilAluno?.id === preSelectedAlunoId);
      if (aluno) setSelectedAlunos([aluno]);
    }
  }, [initialData, preSelectedAlunoId, alunos, tiposDeAnotacao, usuarios]);

  useEffect(() => {
    if (!initialData && !dataOcorrencia) {
      setDataOcorrencia(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, dataOcorrencia]);

  useEffect(() => {
    if (selectedTipo && !isEditing) {
      if (selectedTipo.abertoCoordenacao) {
        if (pontos === '' || pontos === selectedTipo.pontos) {
          setPontos('');
        }
      } else {
        setPontos(selectedTipo.pontos ?? 0);
      }
    } else if (!selectedTipo && !isEditing) {
      setPontos('');
    }
  }, [selectedTipo, isEditing, pontos]);

  const getDisplayText = (u: AlunoComCompanhia) => {
    if (u.role === 'ALUNO') {
      const cargo = u.perfilAluno?.cargo?.abreviacao || 'AL';
      const nomeGuerra = u.perfilAluno?.nomeDeGuerra || u.nome.split(' ')[0];
      return `${cargo} GM ${nomeGuerra}`;
    }
    return u.nome.toUpperCase();
  };

  const getSearchValue = (u: AlunoComCompanhia) => {
    if (u.role === 'ALUNO') {
      return u.perfilAluno?.nomeDeGuerra || u.nome.split(' ')[0];
    }
    return u.nome;
  };

  const { staffMembers, studentMembers } = useMemo(() => {
    const staff = usuarios.filter(u => u.role !== 'ALUNO');
    const students = usuarios.filter(u => u.role === 'ALUNO');
    return { staffMembers: staff, studentMembers: students };
  }, [usuarios]);

  const handleCompanhiaChange = (companhia: string) => {
    const alunosDaCompanhia = alunos.filter(a => a.perfilAluno?.companhia?.nome === companhia);
    setSelectedAlunos(alunosDaCompanhia);
  };

  const handleAlunoSelect = (aluno: AlunoComCompanhia) => {
    setSelectedAlunos(prev => prev.find(a => a.id === aluno.id) ? prev : [...prev, aluno]);
    setIsAlunoComboboxOpen(false);
  };

  const handleObserverSelect = (user: AlunoComCompanhia | null) => {
     if (user) {
         setQuemAnotouId(user.id);
         setSelectedObserver(user);
     } else {
         setQuemAnotouId('AUTOR_LOGADO');
         setSelectedObserver(null);
     }
     setIsObserverComboboxOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAlunos.length === 0) { toast.error("Selecione pelo menos um aluno"); return; }
    if (!selectedTipo) { toast.error("Selecione um tipo"); return; }

    startTransition(async () => {
      const formData = new FormData();
      selectedAlunos.forEach(aluno => {
        if (aluno.perfilAluno?.id) formData.append("alunoIds", aluno.perfilAluno.id);
      });
      formData.append("tipoId", selectedTipo.id);
      formData.append("data", dataOcorrencia);
      formData.append("pontos", pontos.toString());
      formData.append("detalhes", detalhes);
      
      if (isExterno) {
        formData.append("quemAnotouNome", quemAnotouNome);
        formData.append("quemAnotouId", ""); 
      } else {
        formData.append("quemAnotouId", quemAnotouId);
      }

      let result;
      if (isEditing && initialData) {
        result = await updateAnotacao(initialData.id, {}, formData);
      } else {
        result = await createAnotacao({}, formData);
      }

      setFormState(result); 

      if (result?.success) {
        toast.success(isEditing ? "Anotação atualizada!" : "Anotação lançada!");
        if (preSelectedAlunoId || initialData?.alunoId) {
            router.push(`/admin/alunos/${preSelectedAlunoId || initialData?.alunoId}`);
        } else {
            router.push("/admin/alunos");
        }
      } else if (result?.message) {
        toast.error(result.message);
      }
    });
  };

  const companhias = useMemo(() => [...new Set(alunos.map(a => a.perfilAluno?.companhia?.nome).filter(Boolean))], [alunos]);

  const { positivas, negativas, abertasElogio, abertasPunicao } = useMemo(() => {
    return {
      positivas: tiposDeAnotacao.filter(t => t.pontos !== null && t.pontos > 0 && !t.abertoCoordenacao),
      negativas: tiposDeAnotacao.filter(t => t.pontos !== null && t.pontos < 0 && !t.abertoCoordenacao),
      abertasElogio: tiposDeAnotacao.filter(t => t.abertoCoordenacao && t.categoriaAberto === 'ELOGIO'),
      abertasPunicao: tiposDeAnotacao.filter(t => t.abertoCoordenacao && t.categoriaAberto === 'PUNICAO'),
    };
  }, [tiposDeAnotacao]);

  const strictStartFilter = (value: string, search: string) => {
    if (value.toLowerCase().startsWith(search.toLowerCase())) return 1;
    return 0;
  };

  const anotacaoTypeFilter = (value: string, search: string) => {
    if (!search) return 1;
    const [title, description] = value.split('|||');
    const searchLower = search.toLowerCase();
    
    const titleWords = title.toLowerCase().split(' ');
    const titleMatch = titleWords.some(word => word.startsWith(searchLower));
    
    if (titleMatch) return 2; 

    const descWords = description.toLowerCase().split(' ');
    const descMatch = descWords.some(word => word.startsWith(searchLower));

    if (descMatch) return 1;

    return 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <Label className="text-base font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Quem receberá a anotação?
        </Label>
        
        <RadioGroup 
          value={selectionMode} 
          onValueChange={(value: 'companhia' | 'individual') => { 
            setSelectionMode(value); 
            if(!isEditing && !preSelectedAlunoId) setSelectedAlunos([]); 
          }}
          disabled={isEditing || !!preSelectedAlunoId}
          className="flex gap-4 pb-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual" id="individual" />
            <Label htmlFor="individual" className="cursor-pointer">Alunos Específicos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="companhia" id="companhia" />
            <Label htmlFor="companhia" className="cursor-pointer">Companhia Inteira</Label>
          </div>
        </RadioGroup>

        <div className="pt-2">
          {selectionMode === 'companhia' ? (
            <Select onValueChange={handleCompanhiaChange}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione uma companhia" /></SelectTrigger>
              <SelectContent>
                {companhias.map(comp => <SelectItem key={comp as string} value={comp as string}>{comp as string}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <Popover open={isAlunoComboboxOpen} onOpenChange={setIsAlunoComboboxOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-background text-muted-foreground font-normal" disabled={isEditing || !!preSelectedAlunoId}>
                  {isEditing || preSelectedAlunoId ? "Aluno selecionado (fixo)" : "Pesquisar aluno (Nome de Guerra)..."}
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command filter={strictStartFilter}>
                  <CommandInput placeholder="Digite o início do nome de guerra..." />
                  <CommandList>
                    <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                    <CommandGroup>
                      {alunos.map(aluno => (
                        <CommandItem 
                            key={aluno.id} 
                            value={getSearchValue(aluno)} 
                            onSelect={() => handleAlunoSelect(aluno)}
                            className="cursor-pointer"
                        >
                          {getDisplayText(aluno)} 
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {selectedAlunos.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedAlunos.map(aluno => (
              <Badge key={aluno.id} variant="secondary" className="pl-2 pr-1 py-1 h-7 text-sm font-medium border-primary/20 bg-primary/5 text-primary">
                {getDisplayText(aluno)}
                {!isEditing && !preSelectedAlunoId && (
                    <button type="button" onClick={() => setSelectedAlunos(prev => prev.filter(a => a.id !== aluno.id))} className="ml-2 hover:bg-destructive/10 rounded-full p-0.5 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                )}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className={cn(
          "space-y-4 rounded-xl border p-5 shadow-sm transition-all duration-300",
          isExterno 
            ? "border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/10" 
            : "border-border bg-card"
        )}>
        <div className="flex justify-between items-center">
          <Label className="flex items-center gap-2 text-base font-semibold">
            <UserCheck className={cn("w-4 h-4", isExterno ? "text-amber-600" : "text-primary")} />
            Quem observou o fato?
          </Label>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className={cn("text-xs font-bold uppercase tracking-wide", isExterno ? "text-amber-700 hover:text-amber-800 hover:bg-amber-100" : "text-muted-foreground")}
            onClick={() => { setIsExterno(!isExterno); setQuemAnotouId('AUTOR_LOGADO'); setSelectedObserver(null); }}
          >
            {isExterno ? "Voltar para Lista Interna" : "Visitante / Externo"}
          </Button>
        </div>

        {isExterno ? (
          <div className="relative animate-in slide-in-from-top-2 fade-in">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/70" />
            <Input 
              name="quemAnotouNome" 
              placeholder="Ex: Cel. Silva / Autoridade Externa" 
              className="pl-9 h-11 border-amber-200 focus-visible:ring-amber-500 bg-background" 
              required={isExterno}
              value={quemAnotouNome}
              onChange={(e) => setQuemAnotouNome(e.target.value)}
            />
            <p className="text-[10px] text-amber-600/80 mt-1.5 ml-1 font-medium">* Este nome será salvo como texto e não terá vínculo com perfil de usuário.</p>
          </div>
        ) : (
          <div className="relative animate-in slide-in-from-top-2 fade-in">
            <Popover open={isObserverComboboxOpen} onOpenChange={setIsObserverComboboxOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between h-11 bg-background px-3 font-normal text-foreground">
                        <span className="flex items-center gap-2 truncate">
                            {quemAnotouId === 'AUTOR_LOGADO' ? (
                                <>
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                                        <User className="h-3 w-3 text-primary" />
                                    </span>
                                    <span className="font-semibold text-primary">Eu mesmo (Lançador)</span>
                                </>
                            ) : selectedObserver ? (
                                <>
                                    <span className="font-medium text-foreground">{getDisplayText(selectedObserver)}</span>
                                </>
                            ) : "Selecione o responsável..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command filter={strictStartFilter}>
                        <CommandInput placeholder="Digite o início do nome..." />
                        <CommandList className="max-h-[300px]">
                            <CommandEmpty>Ninguém encontrado.</CommandEmpty>
                            
                            <CommandGroup>
                                <CommandItem value="AUTOR_LOGADO eu mesmo" onSelect={() => handleObserverSelect(null)} className="cursor-pointer font-medium text-primary bg-primary/5">
                                    Eu mesmo (Lançador)
                                </CommandItem>
                            </CommandGroup>
                            
                            {staffMembers.length > 0 && (
                                <CommandGroup heading="Corpo de Comando & Staff">
                                    {staffMembers.map(u => (
                                        <CommandItem 
                                            key={u.id} 
                                            value={getSearchValue(u)} 
                                            onSelect={() => handleObserverSelect(u)}
                                            className="cursor-pointer"
                                        >
                                            {getDisplayText(u)}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {studentMembers.length > 0 && (
                                <CommandGroup heading="Corpo de Alunos">
                                    {studentMembers.map(u => (
                                        <CommandItem 
                                            key={u.id} 
                                            value={getSearchValue(u)} 
                                            onSelect={() => handleObserverSelect(u)}
                                            className="cursor-pointer"
                                        >
                                            {getDisplayText(u)}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-2">
            <Label className="text-base font-semibold">Classificação do Fato</Label>
            <Popover open={isTipoComboboxOpen} onOpenChange={setIsTipoComboboxOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={isTipoComboboxOpen} className="w-full justify-between h-11 font-normal bg-background">
                {selectedTipo ? (
                    <span className="font-medium">{selectedTipo.titulo}</span>
                ) : (
                    <span className="text-muted-foreground">Selecione o tipo...</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command filter={anotacaoTypeFilter}>
                <CommandInput placeholder="Pesquisar..." />
                <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
                <CommandList>
                    {[
                      { label: "Elogios (Aberto)", data: abertasElogio }, 
                      { label: "Positivas", data: positivas }, 
                      { label: "Punições (Aberto)", data: abertasPunicao },
                      { label: "Negativas", data: negativas }
                    ].map(group => group.data.length > 0 && (
                        <CommandGroup key={group.label} heading={group.label}>
                        {group.data.map(tipo => (
                            <CommandItem 
                                key={tipo.id} 
                                value={`${tipo.titulo}|||${tipo.descricao}`}
                                onSelect={() => { setSelectedTipo(tipo); setIsTipoComboboxOpen(false); }}
                            >
                            <Check className={cn("mr-2 h-4 w-4", selectedTipo?.id === tipo.id ? "opacity-100" : "opacity-0")} />
                            <div className="flex flex-col">
                                <span className="font-medium">{tipo.titulo}</span>
                                <span className="text-[10px] text-muted-foreground line-clamp-1">{tipo.descricao}</span>
                            </div>
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    ))}
                </CommandList>
                </Command>
            </PopoverContent>
            </Popover>
            {formState?.errors?.tipoId && <p className="text-sm text-destructive mt-1 font-medium">{formState.errors.tipoId[0]}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="data">Data do Fato</Label>
                <Input 
                    id="data" 
                    name="data" 
                    type="date" 
                    required 
                    value={dataOcorrencia}
                    onChange={(e) => setDataOcorrencia(e.target.value)}
                    className="h-11 bg-background"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="pontos">Pontuação</Label>
                <div className="relative">
                    <Input
                        id="pontos"
                        name="pontos"
                        type="number"
                        step="0.5"
                        required
                        value={pontos}
                        onChange={(e) => setPontos(e.target.value)}
                        readOnly={!selectedTipo?.abertoCoordenacao}
                        className={cn(
                            "h-11 bg-background font-medium text-lg pl-4",
                            selectedTipo?.abertoCoordenacao ? "border-primary" : "opacity-80",
                            Number(pontos) > 0 ? "text-green-600" : Number(pontos) < 0 ? "text-red-600" : ""
                        )}
                    />
                    {!selectedTipo?.abertoCoordenacao && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Automático</div>}
                </div>
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="detalhes">Descrição Detalhada</Label>
            <Textarea 
                id="detalhes" 
                name="detalhes" 
                placeholder="Descreva o fato ocorrido com detalhes objetivos..." 
                required 
                value={detalhes}
                onChange={(e) => setDetalhes(e.target.value)}
                className="min-h-[120px] bg-background resize-none leading-relaxed"
            />
        </div>
      </div>

      {formState?.message && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
            <X className="h-4 w-4" />
            {formState.message}
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="submit" disabled={isPending} className="flex-1 h-12 text-base font-bold shadow-md">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isEditing ? 'Salvar Alterações' : 'Confirmar Lançamento'}
        </Button>
        <Button variant="secondary" type="button" onClick={() => router.back()} className="h-12 px-6">
          Cancelar
        </Button>
      </div>
    </form>
  );
}