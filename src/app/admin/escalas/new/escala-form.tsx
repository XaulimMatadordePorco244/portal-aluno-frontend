"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { TipoEscala, User } from '@prisma/client';
import { toast } from 'sonner';
import { PlusCircle, Save, Trash2, ChevronsUpDown } from 'lucide-react';



type ItemState = {
  id: string; 
  cargo: string;
  horarioInicio: string;
  horarioFim: string;
  alunoId: string;
  observacao?: string;
};

type SecaoState = {
  id: string;
  nome: string;
  permiteMultiplosItens: boolean;
  isAdminSection: boolean;
  itens: ItemState[];
};


const TEMPLATE_COLABORACAO: Omit<SecaoState, 'id' | 'itens'>[] = [
  { nome: 'DIRETOR', permiteMultiplosItens: false, isAdminSection: true },
  { nome: 'COORDENAÇÃO', permiteMultiplosItens: true, isAdminSection: true },
  { nome: 'COMANDOS', permiteMultiplosItens: true, isAdminSection: false },
  { nome: 'CHEFE DE TURMA', permiteMultiplosItens: true, isAdminSection: false },
  { nome: 'GUARDA BANDEIRA', permiteMultiplosItens: true, isAdminSection: false },
  { nome: 'ESCALA EXTRA', permiteMultiplosItens: true, isAdminSection: false },
  { nome: 'PALESTRANTE', permiteMultiplosItens: true, isAdminSection: false },

];


export function EscalaForm({ alunos, admins, elaboradorPadrao }: { alunos: User[], admins: User[], elaboradorPadrao: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tipoEscala, setTipoEscala] = useState<TipoEscala | ''>('');
  const [dataEscala, setDataEscala] = useState('');
  const [elaboradoPor, setElaboradoPor] = useState(elaboradorPadrao);
  const [secoes, setSecoes] = useState<SecaoState[]>([]);

  
  useEffect(() => {
    if (tipoEscala === 'COLABORACAO') {
      const secoesDoTemplate = TEMPLATE_COLABORACAO.map(secao => ({
        ...secao,
        id: `secao-${Date.now()}-${Math.random()}`,
        itens: [{ id: `item-${Date.now()}`, cargo: '', horarioInicio: '13:00', horarioFim: '17:45', alunoId: '', observacao: '' }]
      }));
      setSecoes(secoesDoTemplate);
    } else {
     
      setSecoes([]);
    }
  }, [tipoEscala]);


  const handleAddItem = (secaoIndex: number) => {
    const novasSecoes = [...secoes];
    novasSecoes[secaoIndex].itens.push({ id: `item-${Date.now()}`, cargo: '', horarioInicio: '13:00', horarioFim: '17:45', alunoId: '', observacao: '' });
    setSecoes(novasSecoes);
  };
  
  const handleRemoveItem = (secaoIndex: number, itemIndex: number) => {
    const novasSecoes = [...secoes];
    novasSecoes[secaoIndex].itens.splice(itemIndex, 1);
    setSecoes(novasSecoes);
  };

  const handleItemChange = (secaoIndex: number, itemIndex: number, field: keyof ItemState, value: string) => {
    const novasSecoes = [...secoes];
    const item = novasSecoes[secaoIndex].itens[itemIndex];
    (item as any)[field] = value;
    setSecoes(novasSecoes);
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
   
    const todosItens = secoes.flatMap(secao => 
        secao.itens.map(item => ({
            secao: secao.nome,
            cargo: item.cargo,
            horarioInicio: item.horarioInicio,
            horarioFim: item.horarioFim,
            alunoId: item.alunoId,
            observacao: item.observacao
        }))
    ).filter(item => item.alunoId && item.cargo);

    if (todosItens.length === 0) {
        toast.error("Formulário incompleto", { description: "Adicione pelo menos um item válido com aluno e cargo." });
        setIsSubmitting(false);
        return;
    }

    try {
      const response = await fetch('/api/escalas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataEscala: new Date(dataEscala).toISOString(),
          tipo: tipoEscala,
          elaboradoPor,
          itens: todosItens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao criar a escala.");
      }

      toast.success("Sucesso!", { description: "Escala criada como rascunho." });
      router.push('/admin/escalas');
      router.refresh();

    } catch (error) {
      if (error instanceof Error) toast.error("Erro ao criar escala", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
          <CardDescription>Defina os detalhes principais da escala.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="dataEscala">Data da Escala</Label>
            <Input id="dataEscala" type="date" value={dataEscala} onChange={e => setDataEscala(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo da Escala</Label>
            <Select value={tipoEscala} onValueChange={(v: TipoEscala) => setTipoEscala(v)} required>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="COLABORACAO">Colaboração (Template)</SelectItem>
                <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
                <SelectItem value="ESPECIAL">Especial</SelectItem>
                <SelectItem value="EVENTO">Evento</SelectItem>
                <SelectItem value="OUTRO">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="elaboradoPor">Elaborado Por</Label>
            <Input id="elaboradoPor" value={elaboradoPor} onChange={e => setElaboradoPor(e.target.value)} required />
          </div>
        </CardContent>
      </Card>

      {secoes.map((secao, secaoIndex) => (
        <Card key={secao.id}>
          <CardHeader>
            <CardTitle>{secao.nome}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {secao.itens.map((item, itemIndex) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 border p-3 rounded-md relative">
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <Label>Cargo/Função</Label>
                  <Input placeholder="Ex: Chefe de Turma" value={item.cargo} onChange={e => handleItemChange(secaoIndex, itemIndex, 'cargo', e.target.value)} />
                </div>
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <Label>Usuário</Label>
                  <UserCombobox
                    users={secao.isAdminSection ? admins : alunos}
                    value={item.alunoId}
                    onChange={userId => handleItemChange(secaoIndex, itemIndex, 'alunoId', userId)}
                  />
                </div>
                <div className="col-span-6 md:col-span-2 space-y-2">
                  <Label>Início</Label>
                  <Input type="time" value={item.horarioInicio} onChange={e => handleItemChange(secaoIndex, itemIndex, 'horarioInicio', e.target.value)} />
                </div>
                <div className="col-span-6 md:col-span-2 space-y-2">
                  <Label>Fim</Label>
                  <Input type="time" value={item.horarioFim} onChange={e => handleItemChange(secaoIndex, itemIndex, 'horarioFim', e.target.value)} />
                </div>
                {secao.permiteMultiplosItens && (
                  <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => handleRemoveItem(secaoIndex, itemIndex)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            {secao.permiteMultiplosItens && (
              <Button type="button" variant="outline" onClick={() => handleAddItem(secaoIndex)} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item em {secao.nome}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Salvando..." : "Salvar Rascunho da Escala"}
        </Button>
      </div>
    </form>
  );
}


function UserCombobox({ users, value, onChange }: { users: User[], value: string, onChange: (value: string) => void }) {
    const [open, setOpen] = useState(false);
    const selectedUser = users.find(u => u.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {selectedUser ? (selectedUser.nomeDeGuerra || selectedUser.nome) : "Selecione um usuário..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Buscar por nome..." />
                    <CommandList>
                        <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                        <CommandGroup>
                            {users.map(user => (
                                <CommandItem key={user.id} value={user.nomeDeGuerra || user.nome} onSelect={() => { onChange(user.id); setOpen(false); }}>
                                    {user.nomeDeGuerra || user.nome}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}