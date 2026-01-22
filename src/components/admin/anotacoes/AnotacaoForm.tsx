"use client";

import { useFormStatus } from 'react-dom';
import { useState, useEffect, useMemo, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAnotacao, updateAnotacao } from '@/actions/anotacoes'; 
import Link from 'next/link';
import { Usuario, TipoDeAnotacao, Companhia, PerfilAluno } from '@prisma/client';
import { Check, ChevronsUpDown, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Interfaces
type AlunoComCompanhia = Usuario & {
  perfilAluno: (PerfilAluno & {
    companhia: Companhia | null;
  }) | null;
}

export interface FormState {
  errors?: {
    alunoIds?: string[];
    tipoId?: string[];
    data?: string[];
    pontos?: string[];
    detalhes?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
}

interface AnotacaoFormProps {
  alunos: AlunoComCompanhia[];
  tiposDeAnotacao: TipoDeAnotacao[];
  preSelectedAlunoId?: string; 
  initialData?: {              
    id: string;
    alunoId: string;
    tipoId: string;
    data: Date;
    pontos: number;
    detalhes: string | null;
  };
}

export default function AnotacaoForm({ 
  alunos, 
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

  const [isTipoComboboxOpen, setIsTipoComboboxOpen] = useState(false);
  const [isAlunoComboboxOpen, setIsAlunoComboboxOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      const aluno = alunos.find(a => a.perfilAluno?.id === initialData.alunoId);
      if (aluno) setSelectedAlunos([aluno]);

      const tipo = tiposDeAnotacao.find(t => t.id === initialData.tipoId);
      if (tipo) setSelectedTipo(tipo);

      setDataOcorrencia(new Date(initialData.data).toISOString().split('T')[0]);
      setPontos(Number(initialData.pontos));
      setDetalhes(initialData.detalhes || '');
    } else if (preSelectedAlunoId) {
      const aluno = alunos.find(a => a.perfilAluno?.id === preSelectedAlunoId);
      if (aluno) setSelectedAlunos([aluno]);
    }
  }, [initialData, preSelectedAlunoId, alunos, tiposDeAnotacao]);

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
  }, [selectedTipo, isEditing]);

  const companhias = useMemo(() => [...new Set(alunos.map(a => a.perfilAluno?.companhia?.nome).filter(Boolean))], [alunos]) as string[];

  const { positivas, negativas, abertasElogio, abertasPunicao } = useMemo(() => {
    const positivas = tiposDeAnotacao.filter(t => t.pontos !== null && t.pontos > 0 && !t.abertoCoordenacao);
    const negativas = tiposDeAnotacao.filter(t => t.pontos !== null && t.pontos < 0 && !t.abertoCoordenacao);
    const abertasElogio = tiposDeAnotacao.filter(t => t.abertoCoordenacao && t.categoriaAberto === 'ELOGIO');
    const abertasPunicao = tiposDeAnotacao.filter(t => t.abertoCoordenacao && t.categoriaAberto === 'PUNICAO');
    return { positivas, negativas, abertasElogio, abertasPunicao };
  }, [tiposDeAnotacao]);

  const handleCompanhiaChange = (companhia: string) => {
    const alunosDaCompanhia = alunos.filter(a => a.perfilAluno?.companhia?.nome === companhia);
    setSelectedAlunos(alunosDaCompanhia);
  };

  const handleAlunoSelect = (aluno: AlunoComCompanhia) => {
    setSelectedAlunos(prev => prev.find(a => a.id === aluno.id) ? prev : [...prev, aluno]);
    setIsAlunoComboboxOpen(false);
  };

  const handleAlunoRemove = (alunoId: string) => {
    setSelectedAlunos(prev => prev.filter(a => a.id !== alunoId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAlunos.length === 0) {
      toast.error("Selecione pelo menos um aluno");
      return;
    }
    if (!selectedTipo) {
      toast.error("Selecione um tipo");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      selectedAlunos.forEach(aluno => {
        if (aluno.perfilAluno?.id) formData.append("alunoIds", aluno.perfilAluno.id);
      });
      formData.append("tipoId", selectedTipo.id);
      formData.append("data", dataOcorrencia);
      formData.append("pontos", pontos.toString());
      formData.append("detalhes", detalhes);

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

  const pontosValue = Number(pontos);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3 rounded-md border p-4">
        <Label className="font-semibold">Aplicar para</Label>
        
        <RadioGroup 
          value={selectionMode} 
          onValueChange={(value: 'companhia' | 'individual') => { 
            setSelectionMode(value); 
            if(!isEditing && !preSelectedAlunoId) setSelectedAlunos([]); 
          }}
          disabled={isEditing || !!preSelectedAlunoId}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual" id="individual" />
            <Label htmlFor="individual" className="font-normal">Alunos Específicos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="companhia" id="companhia" />
            <Label htmlFor="companhia" className="font-normal">Companhia Inteira</Label>
          </div>
        </RadioGroup>

        <div className="pt-2 animate-in fade-in">
          {selectionMode === 'companhia' && (
            <Select onValueChange={handleCompanhiaChange}>
              <SelectTrigger><SelectValue placeholder="Selecione uma companhia" /></SelectTrigger>
              <SelectContent>
                {companhias.map(comp => <SelectItem key={comp} value={comp}>{comp}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          {selectionMode === 'individual' && (
            <Popover open={isAlunoComboboxOpen} onOpenChange={setIsAlunoComboboxOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start font-normal"
                  disabled={isEditing || !!preSelectedAlunoId} 
                >
                  {isEditing || preSelectedAlunoId ? "Aluno selecionado (fixo)" : "Adicionar aluno..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar por nome de guerra..." />
                  <CommandList>
                    <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                    <CommandGroup>
                      {alunos.map(aluno => {
                        const nomeGuerra = aluno.perfilAluno?.nomeDeGuerra || aluno.nome;
                        return (
                          <CommandItem key={aluno.id} value={`${nomeGuerra} ${aluno.nome}`} onSelect={() => handleAlunoSelect(aluno)}>
                            {nomeGuerra}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {selectedAlunos.length > 0 && (
          <div className="pt-3">
            <Label className="text-xs text-muted-foreground">Alunos selecionados ({selectedAlunos.length})</Label>
            <div className="flex flex-wrap gap-1 pt-1">
              {selectedAlunos.map(aluno => (
                <Badge key={aluno.id} variant="secondary">
                  {aluno.perfilAluno?.nomeDeGuerra || aluno.nome}
                  {!isEditing && !preSelectedAlunoId && (
                    <button type="button" onClick={() => handleAlunoRemove(aluno.id)} className="ml-1.5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {formState?.errors?.alunoIds && <p className="text-sm text-red-500 mt-1">{formState.errors.alunoIds[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipoId">Tipo de Anotação</Label>
        <Popover open={isTipoComboboxOpen} onOpenChange={setIsTipoComboboxOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={isTipoComboboxOpen} className="w-full justify-between font-normal">
              {selectedTipo ? selectedTipo.titulo : "Selecione o tipo..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Pesquisar por título ou descrição..." />
              <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
              <CommandList>
                <CommandGroup heading="Anotações Positivas">
                  {positivas.map((tipo) => (
                    <CommandItem
                      key={tipo.id}
                      value={`${tipo.titulo} ${tipo.descricao}`}
                      onSelect={() => { setSelectedTipo(tipo); setIsTipoComboboxOpen(false); }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedTipo?.id === tipo.id ? "opacity-100" : "opacity-0")} />
                      <div className="flex flex-col">
                        <span>{tipo.titulo}</span>
                        <span className="text-xs text-muted-foreground">{tipo.descricao}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Anotações Negativas">
                  {negativas.map((tipo) => (
                    <CommandItem
                      key={tipo.id}
                      value={`${tipo.titulo} ${tipo.descricao}`}
                      onSelect={() => { setSelectedTipo(tipo); setIsTipoComboboxOpen(false); }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedTipo?.id === tipo.id ? "opacity-100" : "opacity-0")} />
                      <div className="flex flex-col">
                        <span>{tipo.titulo}</span>
                        <span className="text-xs text-muted-foreground">{tipo.descricao}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                {abertasElogio.length > 0 && (
                  <>
                    <CommandGroup heading="Elogios (Aberto para Coordenação)">
                      {abertasElogio.map((tipo) => (
                        <CommandItem
                          key={tipo.id}
                          value={`${tipo.titulo} ${tipo.descricao}`}
                          onSelect={() => { setSelectedTipo(tipo); setIsTipoComboboxOpen(false); }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedTipo?.id === tipo.id ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span>{tipo.titulo}</span>
                            <span className="text-xs text-muted-foreground">{tipo.descricao}</span>
                            <span className="text-xs text-green-600 mt-0.5">Personalizável (positivo)</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}

                {abertasPunicao.length > 0 && (
                  <>
                    <CommandGroup heading="Punições (Aberto para Coordenação)">
                      {abertasPunicao.map((tipo) => (
                        <CommandItem
                          key={tipo.id}
                          value={`${tipo.titulo} ${tipo.descricao}`}
                          onSelect={() => { setSelectedTipo(tipo); setIsTipoComboboxOpen(false); }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedTipo?.id === tipo.id ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span>{tipo.titulo}</span>
                            <span className="text-xs text-muted-foreground">{tipo.descricao}</span>
                            <span className="text-xs text-red-600 mt-0.5">Personalizável (negativo)</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {formState?.errors?.tipoId && <p className="text-sm text-red-500 mt-1">{formState.errors.tipoId[0]}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="data">Data da Ocorrência</Label>
          <Input 
            id="data" 
            name="data" 
            type="date" 
            required 
            value={dataOcorrencia}
            onChange={(e) => setDataOcorrencia(e.target.value)}
          />
          {formState?.errors?.data && <p className="text-sm text-red-500 mt-1">{formState.errors.data[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pontos">Pontos</Label>
          <div className="relative">
            {pontosValue !== 0 && selectedTipo?.abertoCoordenacao && (
              <span className={cn(
                "absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-medium",
                selectedTipo?.categoriaAberto === 'ELOGIO' ? "text-green-600" : "text-red-600"
              )}>
                {selectedTipo?.categoriaAberto === 'ELOGIO' ? '+' : '-'}
              </span>
            )}
            {pontosValue !== 0 && (
              <span className={cn(
                "absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-medium",
                pontosValue > 0 ? "text-green-600" : "text-red-600"
              )}>
                {pontosValue > 0 ? '+' : ''}
              </span>

            )}
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
                "pl-7",
                selectedTipo?.abertoCoordenacao && selectedTipo?.categoriaAberto === 'PUNICAO' && "text-red-600",
                selectedTipo?.abertoCoordenacao && selectedTipo?.categoriaAberto === 'ELOGIO' && "text-green-600"
              )}
            />
          </div>
          {selectedTipo && !selectedTipo.abertoCoordenacao && (<p className="text-xs text-muted-foreground pt-1">Pontuação padrão aplicada.</p>)}
          {formState?.errors?.pontos && <p className="text-sm text-red-500 mt-1">{formState.errors.pontos[0]}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="detalhes">Descrição do Ocorrido (Obrigatório)</Label>
        <Textarea 
            id="detalhes" 
            name="detalhes" 
            placeholder="Descreva a ocorrência..." 
            required 
            value={detalhes}
            onChange={(e) => setDetalhes(e.target.value)}
        />
        {formState?.errors?.detalhes && <p className="text-sm text-red-500 mt-1">{formState.errors.detalhes[0]}</p>}
      </div>

      {formState?.message && <p className="text-sm text-red-500">{formState.message}</p>}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isPending} className="bg-primary">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Salvar Alterações' : 'Lançar Anotação'}
        </Button>
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}