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
import { PlusCircle, Save, Trash2, ChevronsUpDown } from 'lucide-react';


type EscalaItemState = {
    secao: string;
    cargo: string;
    horarioInicio: string;
    horarioFim: string;
    alunoId: string;
    observacao?: string;
};

type EscalaFormState = {
    dataEscala: string;
    tipo: TipoEscala | '';
    elaboradoPor: string;
    itens: EscalaItemState[];
};

export function EscalaForm({ alunos, elaboradorPadrao }: { alunos: User[], elaboradorPadrao: string }) {
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [escala, setEscala] = useState<EscalaFormState>({
        dataEscala: '',
        tipo: '',
        elaboradoPor: elaboradorPadrao,
        itens: [],
    });

    const handleAddItem = () => {
        setEscala(prev => ({
            ...prev,
            itens: [...prev.itens, { secao: '', cargo: '', horarioInicio: '13:00', horarioFim: '17:45', alunoId: '', observacao: '' }]
        }));
    };

    const handleRemoveItem = (index: number) => {
        setEscala(prev => ({
            ...prev,
            itens: prev.itens.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index: number, field: keyof EscalaItemState, value: string) => {
        const novosItens = [...escala.itens];
        novosItens[index] = { ...novosItens[index], [field]: value };
        setEscala(prev => ({ ...prev, itens: novosItens }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (escala.tipo === '' || !escala.dataEscala) {
            toast.error("Erro de Validação", { description: "Data e Tipo da Escala são obrigatórios." });
            return;
        }
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/escalas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...escala,
                    dataEscala: new Date(escala.dataEscala).toISOString(),
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
            if (error instanceof Error) {
                toast.error("Erro ao criar escala", { description: error.message });
            }
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
                        <Input id="dataEscala" type="date" value={escala.dataEscala} onChange={e => setEscala(p => ({ ...p, dataEscala: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo da Escala</Label>
                        <Select value={escala.tipo} onValueChange={(v: TipoEscala) => setEscala(p => ({ ...p, tipo: v }))} required>
                            <SelectTrigger><SelectValue placeholder="Selecione o tipo..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={TipoEscala.COLABORACAO}>Colaboração</SelectItem>
                                <SelectItem value={TipoEscala.ESPECIAL}>Especial</SelectItem>
                                <SelectItem value={TipoEscala.EVENTO}>Evento</SelectItem>
                                <SelectItem value={TipoEscala.OUTRO}>Outro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="elaboradoPor">Elaborado Por</Label>
                        <Input id="elaboradoPor" value={escala.elaboradoPor} onChange={e => setEscala(p => ({ ...p, elaboradoPor: e.target.value }))} required />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Itens da Escala</CardTitle>
                    <CardDescription>Adicione as seções e os alunos escalados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {escala.itens.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 border p-3 rounded-md relative">
                            <div className="col-span-12 md:col-span-2 space-y-2">
                                <Label>Seção</Label>
                                <Input placeholder="Ex: Coordenação" value={item.secao} onChange={e => handleItemChange(index, 'secao', e.target.value)} />
                            </div>
                            <div className="col-span-12 md:col-span-3 space-y-2">
                                <Label>Cargo/Função</Label>
                                <Input placeholder="Ex: Chefe de Turma" value={item.cargo} onChange={e => handleItemChange(index, 'cargo', e.target.value)} />
                            </div>
                            <div className="col-span-6 md:col-span-2 space-y-2">
                                <Label>Início</Label>
                                <Input type="time" value={item.horarioInicio} onChange={e => handleItemChange(index, 'horarioInicio', e.target.value)} />
                            </div>
                            <div className="col-span-6 md:col-span-2 space-y-2">
                                <Label>Fim</Label>
                                <Input type="time" value={item.horarioFim} onChange={e => handleItemChange(index, 'horarioFim', e.target.value)} />
                            </div>
                            <div className="col-span-12 md:col-span-3 space-y-2">
                                <Label>Aluno</Label>
                                <AlunoCombobox alunos={alunos} value={item.alunoId} onChange={alunoId => handleItemChange(index, 'alunoId', alunoId)} />
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => handleRemoveItem(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                    </Button>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Salvando..." : "Salvar Rascunho da Escala"}
                </Button>
            </div>
        </form>
    );
}


function AlunoCombobox({ alunos, value, onChange }: { alunos: User[], value: string, onChange: (value: string) => void }) {
    const [open, setOpen] = useState(false);
    const selectedAluno = alunos.find(a => a.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {selectedAluno ? selectedAluno.nomeDeGuerra : "Selecione um aluno..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Buscar por nome..." />
                    <CommandList>
                        <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                        <CommandGroup>
                            {alunos.map(aluno => (
                                <CommandItem key={aluno.id} value={aluno.nomeDeGuerra || ''} onSelect={() => { onChange(aluno.id); setOpen(false); }}>
                                    {aluno.nomeDeGuerra}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}