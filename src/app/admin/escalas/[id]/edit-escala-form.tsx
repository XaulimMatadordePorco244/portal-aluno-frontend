"use client";

import { useState } from 'react';
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
import { ArrowLeft, Edit, FileDown, Globe, PlusCircle, Save, Trash2, ChevronsUpDown } from 'lucide-react';
import { EscalaCompleta } from './page';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function AlunoCombobox({ alunos, value, onChange }: { alunos: User[], value: string, onChange: (value: string) => void }) {
    const [open, setOpen] = useState(false);
    const selectedAluno = alunos.find(a => a.id === value);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {selectedAluno ? selectedAluno.nomeDeGuerra : "Selecione..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Buscar..." /><CommandList><CommandEmpty>Nenhum aluno.</CommandEmpty><CommandGroup>{alunos.map(aluno => (<CommandItem key={aluno.id} value={aluno.nomeDeGuerra || ''} onSelect={() => { onChange(aluno.id); setOpen(false); }}>{aluno.nomeDeGuerra}</CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent>
        </Popover>
    );
}


export function EditEscalaForm({ escalaInicial, alunos }: { escalaInicial: EscalaCompleta, alunos: User[] }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [escala, setEscala] = useState(escalaInicial);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataDaEscala = new Date(escala.dataEscala);
  const isBloqueada = dataDaEscala < hoje;


  const handleAddItem = () => setEscala(p => ({ ...p, itens: [...p.itens, { id: `temp-${Date.now()}`, secao: '', cargo: '', horarioInicio: '13:00', horarioFim: '17:45', alunoId: '', observacao: '', escalaId: p.id, aluno: {} as User }] }));
  const handleRemoveItem = (index: number) => setEscala(p => ({ ...p, itens: p.itens.filter((_, i) => i !== index) }));
  const handleItemChange = (index: number, field: string, value: string) => {
    const novosItens = [...escala.itens];
    (novosItens[index] as any)[field] = value;
    setEscala(p => ({ ...p, itens: novosItens }));
  };

  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/escalas/${escala.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataEscala: escala.dataEscala,
          tipo: escala.tipo,
          elaboradoPor: escala.elaboradoPor,
          itens: escala.itens.map(({ aluno, escalaId, id, ...item }) => item), 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao salvar alterações.");
      }

      toast.success("Sucesso!", { description: "As alterações na escala foram salvas." });
      setIsEditing(false);
      router.refresh(); 

    } catch (error) {
      if (error instanceof Error) toast.error("Erro ao salvar", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePdf = () => toast.info("Funcionalidade de gerar PDF em desenvolvimento.");
  const handlePublish = () => toast.info("Funcionalidade de publicar em desenvolvimento.");

  return (
    <div className="space-y-6">


      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
          <CardDescription>Data: {format(new Date(escala.dataEscala), "dd/MM/yyyy")} | Tipo: {escala.tipo}</CardDescription>
        </CardHeader>
        <CardContent>
            {isEditing ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="dataEscala">Data da Escala</Label>
                        <Input id="dataEscala" type="date" value={format(new Date(escala.dataEscala), 'yyyy-MM-dd')} onChange={e => setEscala(p => ({...p, dataEscala: new Date(e.target.value)}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo</Label>
                        <Select value={escala.tipo} onValueChange={(v: TipoEscala) => setEscala(p => ({...p, tipo: v}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="COLABORACAO">Colaboração</SelectItem><SelectItem value="ESPECIAL">Especial</SelectItem><SelectItem value="EVENTO">Evento</SelectItem><SelectItem value="OUTRO">Outro</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="elaboradoPor">Elaborado Por</Label>
                        <Input id="elaboradoPor" value={escala.elaboradoPor} onChange={e => setEscala(p => ({...p, elaboradoPor: e.target.value}))} />
                    </div>
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><Label>Data da Escala</Label><p className="font-semibold">{format(new Date(escala.dataEscala), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p></div>
                    <div><Label>Tipo</Label><p className="font-semibold">{escala.tipo}</p></div>
                    <div><Label>Elaborado Por</Label><p className="font-semibold">{escala.elaboradoPor}</p></div>
                </div>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens da Escala</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {escala.itens.map((item, index) => (
                 <div key={item.id} className="grid grid-cols-12 gap-x-4 gap-y-2 border p-3 rounded-md relative">
                    {isEditing ? (
                        <>
                            <div className="col-span-12 md:col-span-2 space-y-2"><Label>Seção</Label><Input value={item.secao} onChange={e => handleItemChange(index, 'secao', e.target.value)} /></div>
                            <div className="col-span-12 md:col-span-3 space-y-2"><Label>Cargo/Função</Label><Input value={item.cargo} onChange={e => handleItemChange(index, 'cargo', e.target.value)} /></div>
                            <div className="col-span-6 md:col-span-2 space-y-2"><Label>Início</Label><Input type="time" value={item.horarioInicio} onChange={e => handleItemChange(index, 'horarioInicio', e.target.value)} /></div>
                            <div className="col-span-6 md:col-span-2 space-y-2"><Label>Fim</Label><Input type="time" value={item.horarioFim} onChange={e => handleItemChange(index, 'horarioFim', e.target.value)} /></div>
                            <div className="col-span-12 md:col-span-3 space-y-2"><Label>Aluno</Label><AlunoCombobox alunos={alunos} value={item.alunoId} onChange={alunoId => handleItemChange(index, 'alunoId', alunoId)} /></div>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => handleRemoveItem(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </>
                    ) : (
                        <>
                            <div className="col-span-12 md:col-span-2"><Label>Seção</Label><p>{item.secao}</p></div>
                            <div className="col-span-12 md:col-span-3"><Label>Cargo/Função</Label><p>{item.cargo}</p></div>
                            <div className="col-span-6 md:col-span-2"><Label>Horário</Label><p>{item.horarioInicio} - {item.horarioFim}</p></div>
                            <div className="col-span-6 md:col-span-3"><Label>Aluno</Label><p>{item.aluno.nomeDeGuerra}</p></div>
                            <div className="col-span-12 md:col-span-2"><Label>Observação</Label><p>{item.observacao || 'N/A'}</p></div>
                        </>
                    )}
                 </div>
            ))}
            {isEditing && <Button type="button" variant="outline" onClick={handleAddItem} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item</Button>}
        </CardContent>
      </Card>
    </div>
  );
}