"use client";


import { useFormStatus } from 'react-dom';
import { useState, useEffect, useMemo, useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAnotacao } from '../actions';
import Link from 'next/link';
import { Usuario, TipoDeAnotacao, Companhia} from '@prisma/client';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormState } from '../actions';

type AlunoComCompanhia = Usuario & {
  companhia: Companhia | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Lançando...' : 'Lançar Anotação'}
    </Button>
  );
}




const initialState: FormState = {};

export default function AnotacaoForm({ alunos, tiposDeAnotacao,  }: { alunos: AlunoComCompanhia[], tiposDeAnotacao: TipoDeAnotacao[] }) {

  const [state, formAction] = useActionState<FormState, FormData>(createAnotacao, initialState);

  const [selectionMode, setSelectionMode] = useState<'companhia' | 'individual'>('individual');
  const [selectedAlunos, setSelectedAlunos] = useState<Usuario[]>([]);

  const [selectedTipo, setSelectedTipo] = useState<TipoDeAnotacao | null>(null);
  const [pontos, setPontos] = useState<number | string>('');
  const [isTipoComboboxOpen, setIsTipoComboboxOpen] = useState(false);

  useEffect(() => {
    if (selectedTipo) setPontos(selectedTipo.pontos ?? 0);
    else setPontos('');
  }, [selectedTipo]);

  const companhias = useMemo(() => [...new Set(alunos.map(a => a.companhia?.nome).filter(Boolean))], [alunos]) as string[];

  const { positivas, negativas } = useMemo(() => {
    const positivas = tiposDeAnotacao.filter(t => t.pontos !== null && t.pontos > 0);
    const negativas = tiposDeAnotacao.filter(t => t.pontos !== null && t.pontos < 0);
    return { positivas, negativas };
  }, [tiposDeAnotacao]);

  const handleCompanhiaChange = (companhia: string) => {
    const alunosDaCompanhia = alunos.filter(a => a.companhia?.nome === companhia);
    setSelectedAlunos(alunosDaCompanhia);
  };

  const handleAlunoSelect = (aluno: Usuario) => {
    setSelectedAlunos(prev => prev.find(a => a.id === aluno.id) ? prev : [...prev, aluno]);
  };

  const handleAlunoRemove = (alunoId: string) => {
    setSelectedAlunos(prev => prev.filter(a => a.id !== alunoId));
  };

  const pontosValue = Number(pontos);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-3 rounded-md border p-4">
        <Label className="font-semibold">Aplicar para</Label>
        <RadioGroup value={selectionMode} onValueChange={(value: 'companhia' | 'individual') => { setSelectionMode(value); setSelectedAlunos([]); }}>
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal">
                  Adicionar aluno...
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar por nome de guerra..." />
                  <CommandList>
                    <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                    <CommandGroup>
                      {alunos.map(aluno => (
                        <CommandItem key={aluno.id} value={`${aluno.nomeDeGuerra} ${aluno.nome}`} onSelect={() => handleAlunoSelect(aluno)}>
                          {aluno.nomeDeGuerra}
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
          <div className="pt-3">
            <Label className="text-xs text-muted-foreground">Alunos selecionados ({selectedAlunos.length})</Label>
            <div className="flex flex-wrap gap-1 pt-1">
              {selectedAlunos.map(aluno => (
                <Badge key={aluno.id} variant="secondary">
                  {aluno.nomeDeGuerra}
                  <button type="button" onClick={() => handleAlunoRemove(aluno.id)} className="ml-1.5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        {selectedAlunos.map(aluno => <input key={aluno.id} type="hidden" name="alunoIds" value={aluno.id} />)}
        {state?.errors?.alunoIds && <p className="text-sm text-red-500 mt-1">{state.errors.alunoIds[0]}</p>}
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
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedTipo && <input type="hidden" name="tipoId" value={selectedTipo.id} />}
        {state?.errors?.tipoId && <p className="text-sm text-red-500 mt-1">{state.errors.tipoId[0]}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="data">Data da Ocorrência</Label>
          <Input id="data" name="data" type="date" required />
          {state?.errors?.data && <p className="text-sm text-red-500 mt-1">{state.errors.data[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pontos">Pontos</Label>
          <div className="relative">
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
              readOnly={!selectedTipo || !selectedTipo.abertoCoordenacao}
              className="pl-7"
            />
          </div>
          {selectedTipo && !selectedTipo.abertoCoordenacao && (<p className="text-xs text-muted-foreground pt-1">Pontuação padrão aplicada.</p>)}
          {state?.errors?.pontos && <p className="text-sm text-red-500 mt-1">{state.errors.pontos[0]}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="detalhes">Descrição do Ocorrido (Obrigatório)</Label>
        <Textarea id="detalhes" name="detalhes" placeholder="Descreva a ocorrência..." required />
        {state?.errors?.detalhes && <p className="text-sm text-red-500 mt-1">{state.errors.detalhes[0]}</p>}
      </div>

      {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

      <div className="flex gap-2 pt-4">
        <SubmitButton />
        <Button variant="outline" asChild><Link href="/admin/alunos">Cancelar</Link></Button>
      </div>
    </form>
  );
}