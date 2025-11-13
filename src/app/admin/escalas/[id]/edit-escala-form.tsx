"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Funcao, TipoEscala} from '@prisma/client';
import { toast } from 'sonner';
import { ArrowLeft, Edit, FileDown, Globe, PlusCircle, Save, Trash2, ChevronsUpDown } from 'lucide-react';
import { EscalaCompleta, UserComCargoEFuncao } from './page';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusEscala } from '@prisma/client';
import { Textarea } from '@/components/ui/textarea';
import { GABARITO_COLABORACAO } from '../new/escala-form';

type ItemState = {
    id: string;
    funcaoId: string;
    horarioInicio: string;
    horarioFim: string;
    userId: string;
    tema: string;
    cargoPersonalizado: string;
    auxiliarUserId: string;
};

type SecaoState = {
    id: string;
    nome: string;
    categoriaEsperada: string;
    permiteMultiplosItens: boolean;
    isSecaoAdmin: boolean;
    isSecaoPalestrante: boolean;
    itens: ItemState[];
};

type UserComCargo = UserComCargoEFuncao;

const AUXILIAR_PREFIX = "AUXILIAR - ";

function initializeState(
    escala: EscalaCompleta, 
    alunos: UserComCargo[], 
    funcaoOutroId: string
): SecaoState[] {
    
    return GABARITO_COLABORACAO.secoes.map(secaoTemplate => {
        const itensDaSecao = escala.itens.filter(item => item.secao === secaoTemplate.nome);

        const itensState: ItemState[] = itensDaSecao.map(item => {
            let auxiliarUserId = '';
            let tema = '';
            let cargoPersonalizado = '';
         
            if (secaoTemplate.isSecaoPalestrante) {
                tema = item.cargo;
                if (item.observacao && item.observacao.startsWith(AUXILIAR_PREFIX)) {
                    const auxNome = item.observacao.substring(AUXILIAR_PREFIX.length);
                    const auxUser = alunos.find(a => a.nomeDeGuerra === auxNome);
                    auxiliarUserId = auxUser?.id || '';
                }
            }
            else if (item.funcaoId === funcaoOutroId) {
                cargoPersonalizado = item.cargo;
            }

            return {
                id: item.id,
                funcaoId: item.funcaoId || '',
                horarioInicio: item.horarioInicio,
                horarioFim: item.horarioFim,
                userId: item.alunoId || '',
                tema: tema,
                cargoPersonalizado: cargoPersonalizado,
                auxiliarUserId: auxiliarUserId,
            };
        });

        return {
            ...secaoTemplate,
            id: `secao-${secaoTemplate.nome}`,
            itens: itensState
        };
    });
}

function UserCombobox({ users, value, onChange }: { users: UserComCargo[], value: string, onChange: (value: string) => void }) {
    const [open, setOpen] = useState(false);
    const selectedUser = users.find(u => u.id === value);

    const formatUserDisplay = (user: UserComCargo) => {
        return `${user.cargo?.abreviacao || ''} ${user.nomeDeGuerra}`.trim();
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {selectedUser 
                        ? formatUserDisplay(selectedUser)
                        : "Selecione..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Buscar..." />
                    <CommandList>
                        <CommandEmpty>Nenhum usuário.</CommandEmpty>
                        <CommandGroup>
                            {users.map(user => (
                                <CommandItem
                                    key={user.id}
                                    value={formatUserDisplay(user)}
                                    onSelect={() => {
                                        onChange(user.id);
                                        setOpen(false);
                                    }}
                                >
                                    {formatUserDisplay(user)}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

type FuncaoComCategoria = Funcao & { categoria: string | null };

export function EditEscalaForm({ 
    escalaInicial, 
    alunos, 
    admins, 
    funcoes: funcoesProp 
}: { 
    escalaInicial: EscalaCompleta, 
    alunos: UserComCargo[], 
    admins: UserComCargo[], 
    funcoes: FuncaoComCategoria[]
}) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const [dataEscala, setDataEscala] = useState(escalaInicial.dataEscala);
    const [tipo, setTipo] = useState(escalaInicial.tipo);
    const [elaboradoPor, setElaboradoPor] = useState(escalaInicial.elaboradoPor);
    const [pdfUrl, setPdfUrl] = useState(escalaInicial.pdfUrl);
    const [status, setStatus] = useState(escalaInicial.status);
    
    const [fardamento, setFardamento] = useState(escalaInicial.fardamento || GABARITO_COLABORACAO.fardamento);
    const [observacoes, setObservacoes] = useState(escalaInicial.observacoes || GABARITO_COLABORACAO.observacoes);

    const funcaoOutroId = useMemo(() => funcoesProp.find(f => f.nome.toUpperCase() === 'OUTRO')?.id || '', [funcoesProp]);

    const [secoes, setSecoes] = useState<SecaoState[]>(() => initializeState(escalaInicial, alunos, funcaoOutroId));

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataDaEscalaObj = new Date(dataEscala);
    const isBloqueada = dataDaEscalaObj < hoje;

    const handleItemChange = (secaoIndex: number, itemIndex: number, field: keyof ItemState, value: string) => {
        const novasSecoes = [...secoes];
        const itemCopy: ItemState = { ...novasSecoes[secaoIndex].itens[itemIndex] };
        itemCopy[field] = value;
        novasSecoes[secaoIndex].itens[itemIndex] = itemCopy;
        setSecoes(novasSecoes);
    };

    const handleAddItem = (secaoIndex: number) => {
        const novasSecoes = [...secoes];
        const secao = novasSecoes[secaoIndex];
        const ultimaFuncaoId = secao.itens[secao.itens.length - 1]?.funcaoId || '';
        
        secao.itens.push({ 
            id: `item-${Date.now()}`, 
            funcaoId: ultimaFuncaoId, 
            cargoPersonalizado: '', 
            horarioInicio: '13:00', 
            horarioFim: '17:45', 
            userId: '', 
            tema: '', 
            auxiliarUserId: '' 
        });
        setSecoes(novasSecoes);
    };

    const handleRemoveItem = (secaoIndex: number, itemIndex: number) => {
        const novasSecoes = [...secoes];
        novasSecoes[secaoIndex].itens.splice(itemIndex, 1);
        setSecoes(novasSecoes);
    };

    const handleSaveChanges = async () => {
        setIsSubmitting(true);

        const todosItens = secoes.flatMap(secao =>
            secao.itens.map(item => {
                const funcao = funcoesProp.find(f => f.id === item.funcaoId);
                let cargoFinal = '';
                let observacaoFinal = null;
                let funcaoIdFinal = item.funcaoId || null;

                if (secao.isSecaoPalestrante) {
                    cargoFinal = item.tema || 'PALESTRA';
                    funcaoIdFinal = null;
                    const auxiliar = alunos.find(a => a.id === item.auxiliarUserId);
                    if (auxiliar) {
                        observacaoFinal = `AUXILIAR - ${auxiliar.nomeDeGuerra || auxiliar.nome}`;
                    }
                } else if (funcao?.id === funcaoOutroId) {
                    cargoFinal = item.cargoPersonalizado;
                } else {
                    cargoFinal = funcao?.nome || '';
                }

                return {
                    id: item.id.startsWith('item-') ? undefined : item.id,
                    secao: secao.nome,
                    cargo: cargoFinal,
                    horarioInicio: item.horarioInicio,
                    horarioFim: item.horarioFim,
                    alunoId: item.userId || null,
                    observacao: observacaoFinal,
                    funcaoId: funcaoIdFinal,
                }
            })
        ).filter(item => item.alunoId && item.cargo);

        try {
            const response = await fetch(`/api/escalas/${escalaInicial.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dataEscala: dataEscala,
                    tipo: tipo,
                    elaboradoPor: elaboradoPor,
                    fardamento: fardamento,
                    observacoes: observacoes,
                    itens: todosItens,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Falha ao salvar alterações.");
            }
            
            const updatedEscala: EscalaCompleta = await response.json();

            setDataEscala(updatedEscala.dataEscala);
            setTipo(updatedEscala.tipo);
            setElaboradoPor(updatedEscala.elaboradoPor);
            setPdfUrl(null);
            setStatus(StatusEscala.RASCUNHO);
            setFardamento(updatedEscala.fardamento || '');
            setObservacoes(updatedEscala.observacoes || '');
            setSecoes(initializeState(updatedEscala, alunos, funcaoOutroId));

            toast.success("Sucesso!", {
                description: "As alterações foram salvas. O PDF foi invalidado e a escala retornou para Rascunho."
            });
            setIsEditing(false);
            router.refresh();

        } catch (error) {
            if (error instanceof Error) {
                toast.error("Erro ao salvar", { description: error.message });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGeneratePdf = async () => {
        setIsGeneratingPdf(true);
        const toastId = toast.loading("Gerando PDF...");
        try {
            const response = await fetch(`/api/escalas/${escalaInicial.id}/generate-pdf`, { method: 'POST' });
            if (!response.ok) throw new Error("Falha ao gerar o PDF.");
            const updatedEscala = await response.json();
            setPdfUrl(updatedEscala.pdfUrl);
            toast.success("PDF gerado e salvo!", { id: toastId });
            router.refresh();
        } catch (error) {
            toast.error("Erro ao gerar PDF", { id: toastId, description: (error as Error).message });
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handlePublish = async () => {
        if (status === 'RASCUNHO' && !pdfUrl) {
            toast.error("Ação bloqueada", { description: "Você deve gerar o PDF antes de publicar." });
            return;
        }
        setIsPublishing(true);
        const novoStatus = status === 'PUBLICADA' ? StatusEscala.RASCUNHO : StatusEscala.PUBLICADA;
        const toastId = toast.loading(novoStatus === 'PUBLICADA' ? 'Publicando...' : 'Retornando...');
        try {
            const response = await fetch(`/api/escalas/${escalaInicial.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus }),
            });
            if (!response.ok) throw new Error('Falha ao alterar o status.');
            const updatedEscala = await response.json();
            setStatus(updatedEscala.status);
            toast.success("Status atualizado!", { id: toastId });
            router.refresh();
        } catch (error) {
            toast.error("Erro ao atualizar status", { id: toastId, description: (error as Error).message });
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDownloadPdf = () => {
        if (pdfUrl) window.open(pdfUrl, '_blank');
        else toast.error("PDF não disponível.");
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setDataEscala(escalaInicial.dataEscala);
        setTipo(escalaInicial.tipo);
        setElaboradoPor(escalaInicial.elaboradoPor);
        setPdfUrl(escalaInicial.pdfUrl);
        setStatus(escalaInicial.status);
        setFardamento(escalaInicial.fardamento || GABARITO_COLABORACAO.fardamento);
        setObservacoes(escalaInicial.observacoes || GABARITO_COLABORACAO.observacoes);
        setSecoes(initializeState(escalaInicial, alunos, funcaoOutroId));
    }

    const getAlunoName = (alunoId: string, isSecaoAdmin: boolean) => {
        const userList = isSecaoAdmin ? admins : alunos;
        return userList.find(u => u.id === alunoId)?.nomeDeGuerra || 'N/A';
    };

    const getFuncaoName = (funcaoId: string, cargoPersonalizado?: string) => {
        if (funcaoId === funcaoOutroId) {
            return cargoPersonalizado || 'N/A';
        }
        return funcoesProp.find(f => f.id === funcaoId)?.nome || 'N/A';
    };

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/escalas">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Editar Escala</h1>
                        <p className="text-muted-foreground">
                            {format(new Date(dataEscala), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} • {tipo}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {!isEditing ? (
                        <>
                            <Button onClick={() => setIsEditing(true)} disabled={isBloqueada}><Edit className="mr-2 h-4 w-4" /> Editar</Button>
                            {pdfUrl ? (
                                <Button variant="outline" onClick={handleDownloadPdf}><FileDown className="mr-2 h-4 w-4" /> Baixar PDF</Button>
                            ) : (
                                <Button variant="outline" onClick={handleGeneratePdf} disabled={isGeneratingPdf}><FileDown className="mr-2 h-4 w-4" /> {isGeneratingPdf ? 'Gerando...' : 'Gerar PDF'}</Button>
                            )}
                            <Button variant="outline" onClick={handlePublish} disabled={isPublishing || isBloqueada}><Globe className="mr-2 h-4 w-4" /> {isPublishing ? '...' : (status === 'PUBLICADA' ? 'Retornar p/ Rascunho' : 'Publicar')}</Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={handleSaveChanges} disabled={isSubmitting}><Save className="mr-2 h-4 w-4" /> {isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
                            <Button variant="outline" onClick={handleCancelEdit} disabled={isSubmitting}>Cancelar</Button>
                        </>
                    )}
                </div>
            </div>

            {isBloqueada && !isEditing && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-800 text-sm font-medium">
                        ⚠️ Esta escala já passou da data e não pode mais ser editada ou ter seu status alterado.
                    </p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Informações Gerais</CardTitle>
                    <CardDescription>
                        Data: {format(new Date(dataEscala), "dd/MM/yyyy")} | Tipo: {tipo} | Status: {status}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="dataEscala">Data da Escala</Label>
                                <Input id="dataEscala" type="date" value={format(new Date(dataEscala), 'yyyy-MM-dd')} onChange={e => setDataEscala(new Date(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo</Label>
                                <Select value={tipo} onValueChange={(v: TipoEscala) => setTipo(v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="COLABORACAO">Colaboração</SelectItem>
                                        <SelectItem value="ESPECIAL">Especial</SelectItem>
                                        <SelectItem value="EVENTO">Evento</SelectItem>
                                        <SelectItem value="OUTRO">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="elaboradoPor">Elaborado Por</Label>
                                <Input id="elaboradoPor" value={elaboradoPor} onChange={e => setElaboradoPor(e.target.value)} />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><Label>Data da Escala</Label><p className="font-semibold text-sm">{format(new Date(dataEscala), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p></div>
                            <div><Label>Tipo</Label><p className="font-semibold text-sm">{tipo}</p></div>
                            <div><Label>Elaborado Por</Label><p className="font-semibold text-sm">{elaboradoPor}</p></div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-6">
                {secoes.map((secao, secaoIndex) => (
                    <Card key={secao.id}>
                        <CardHeader>
                            <CardTitle>{secao.nome}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            
                            {secao.itens.length === 0 && !isEditing && (
                                <p className="text-sm text-muted-foreground italic">Nenhum item nesta seção.</p>
                            )}

                            {secao.itens.map((item, itemIndex) => {
                                const funcoesFiltradas = funcoesProp.filter(f => f.categoria === secao.categoriaEsperada || f.id === funcaoOutroId);
                                const isOutroSelecionado = item.funcaoId === funcaoOutroId;
                                
                                return (
                                    <div key={item.id} className="grid grid-cols-12 gap-x-4 gap-y-3 border p-4 rounded-md relative">
                                        {isEditing ? (
                                            <>
                                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleRemoveItem(secaoIndex, itemIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                
                                                {secao.isSecaoPalestrante ? (
                                                    <>
                                                        <div className="col-span-12 md:col-span-4 space-y-2"><Label>Tema da Palestra</Label><Input placeholder="Tema..." value={item.tema} onChange={e => handleItemChange(secaoIndex, itemIndex, 'tema', e.target.value)} /></div>
                                                        <div className="col-span-12 md:col-span-4 space-y-2"><Label>Palestrante (Aluno)</Label><UserCombobox users={alunos} value={item.userId} onChange={userId => handleItemChange(secaoIndex, itemIndex, 'userId', userId)} /></div>
                                                        <div className="col-span-12 md:col-span-4 space-y-2"><Label>Auxiliar (Aluno)</Label><UserCombobox users={alunos} value={item.auxiliarUserId} onChange={userId => handleItemChange(secaoIndex, itemIndex, 'auxiliarUserId', userId)} /></div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className={`col-span-12 ${isOutroSelecionado ? 'md:col-span-2' : 'md:col-span-3'} space-y-2`}><Label>Função</Label><Select value={item.funcaoId} onValueChange={value => handleItemChange(secaoIndex, itemIndex, 'funcaoId', value)}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{funcoesFiltradas.map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent></Select></div>
                                                        {isOutroSelecionado && <div className="col-span-12 md:col-span-2 space-y-2"><Label>Função (Outro)</Label><Input placeholder="Digite a função..." value={item.cargoPersonalizado} onChange={e => handleItemChange(secaoIndex, itemIndex, 'cargoPersonalizado', e.target.value)} /></div>}
                                                        <div className="col-span-12 md:col-span-3 space-y-2"><Label>Usuário</Label><UserCombobox users={secao.isSecaoAdmin ? admins : alunos} value={item.userId} onChange={userId => handleItemChange(secaoIndex, itemIndex, 'userId', userId)} /></div>
                                                    </>
                                                )}
                                                <div className="col-span-6 md:col-span-2 space-y-2"><Label>Início</Label><Input type="time" value={item.horarioInicio} onChange={e => handleItemChange(secaoIndex, itemIndex, 'horarioInicio', e.target.value)} /></div>
                                                <div className="col-span-6 md:col-span-1 space-y-2"><Label>Fim</Label><Input type="time" value={item.horarioFim} onChange={e => handleItemChange(secaoIndex, itemIndex, 'horarioFim', e.target.value)} /></div>
                                            </>
                                        ) : (
                                            <>
                                                {secao.isSecaoPalestrante ? (
                                                    <>
                                                        <div className="col-span-12 md:col-span-4"><Label>Tema</Label><p className="font-medium text-sm">{item.tema || 'N/A'}</p></div>
                                                        <div className="col-span-6 md:col-span-3"><Label>Palestrante</Label><p className="font-medium text-sm">{getAlunoName(item.userId, false)}</p></div>
                                                        <div className="col-span-6 md:col-span-3"><Label>Auxiliar</Label><p className="font-medium text-sm">{item.auxiliarUserId ? getAlunoName(item.auxiliarUserId, false) : 'N/A'}</p></div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="col-span-12 md:col-span-4"><Label>Cargo/Função</Label><p className="font-medium text-sm">{getFuncaoName(item.funcaoId, item.cargoPersonalizado)}</p></div>
                                                        <div className="col-span-6 md:col-span-5"><Label>Usuário</Label><p className="font-medium text-sm">{getAlunoName(item.userId, secao.isSecaoAdmin)}</p></div>
                                                    </>
                                                )}
                                                <div className="col-span-6 md:col-span-2"><Label>Horário</Label><p className="font-medium text-sm">{item.horarioInicio} - {item.horarioFim}</p></div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}

                            {isEditing && secao.permiteMultiplosItens && (
                                <Button type="button" variant="outline" onClick={() => handleAddItem(secaoIndex)} className="w-full">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar em {secao.nome}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {tipo === 'COLABORACAO' && (
                    <Card>
                        <CardHeader><CardTitle>Fardamento</CardTitle></CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <Textarea value={fardamento} onChange={(e) => setFardamento(e.target.value)} rows={4} />
                            ) : (
                                <p className="text-sm whitespace-pre-wrap font-medium">{fardamento || 'N/A'}</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {tipo === 'COLABORACAO' && (
                    <Card>
                        <CardHeader><CardTitle>Observações</CardTitle></CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={6} />
                            ) : (
                                <p className="text-sm whitespace-pre-wrap font-medium">{observacoes || 'N/A'}</p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}