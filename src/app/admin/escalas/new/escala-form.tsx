"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Funcao, TipoEscala, User } from '@prisma/client';
import { toast } from 'sonner';
import { PlusCircle, Save, Trash2, ChevronsUpDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// --- TIPOS E GABARITO ---

type ItemState = {
  id: string;
  funcaoId: string;
  horarioInicio: string;
  horarioFim: string;
  userId: string; // ID do Aluno/Admin principal (Palestrante ou Função)
  tema: string;
  cargoPersonalizado: string;
  // observacao: string; // Campo removido da estrutura principal do item
  auxiliarUserId: string; // NOVO: ID do Aluno Auxiliar (apenas para Palestrante)
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

type UserComFuncao = User & { funcao: Funcao | null };

const GABARITO_COLABORACAO = {

  fardamento: "- OS COMANDOS: COMPARECER FARDADOS.\n- OS ESCALADOS PARA LIMPEZA: COMPARECER DE TFM.\n- OS DEMAIS ALUNOS SE APRESETAR DE UNIFORME 1.",

  observacoes: "- O HASTEAMENTO DO PAVILHÃO NACIONAL: 13:25H.\n- SUSPENSÃO (-4 PONTOS): ...\n- A PALESTRA DEVERÁ TER O TEMPO DE 3MIN À 5MIN.",

  secoes: [



    { nome: 'DIRETOR', total: 1, categoriaEsperada: 'ADMIN', permiteMultiplosItens: false, isSecaoAdmin: true, isSecaoPalestrante: false, itemFuncoes: ["PRESIDENTE"] },

    { nome: 'COORDENAÇÃO', total: 3, categoriaEsperada: 'ADMIN', permiteMultiplosItens: true, isSecaoAdmin: true, isSecaoPalestrante: false, itemFuncoes: ["COORDENADOR", "AUXILIAR ADM.", "AUXILIAR ADM."] },

    // Seções Aluno

    { nome: 'COMANDOS', total: 4, categoriaEsperada: 'COMANDOS', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["COMANDANTE DA TROPA", "SUB COMANDANTE", "COMP. EQUIPE – G4", "COMP. EQUIPE"] },

    { nome: 'CHEFE DE TURMA', total: 3, categoriaEsperada: 'CHEFE_TURMA', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["CHEFE DE TURMA – 1ª CIA", "CHEFE DE TURMA – 2ª CIA", "CHEFE DE TURMA – 3ª CIA"] },

    { nome: 'GUARDA BANDEIRA', total: 3, categoriaEsperada: 'GUARDA_BANDEIRA', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["PORTA BANDEIRA - BR", "PORTA BANDEIRA - MS", "PORTA BANDEIRA - NV"] },

    { nome: 'PALESTRANTE', total: 3, categoriaEsperada: '', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: true, itemFuncoes: [] }, // Sem função pré-definida

    { nome: 'ESCALA EXTRA', total: 5, categoriaEsperada: 'ESCALA_EXTRA', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["LANCHE", "LANCHE", "LIMPEZA EXTERNA E INTERNA", "LIMPEZA EXTERNA E INTERNA", "LIMPEZA EXTERNA E INTERNA"] },

  ]

};

export function EscalaForm({ alunos, admins, funcoes, elaboradorPadrao }: { alunos: UserComFuncao[], admins: UserComFuncao[], funcoes: (Funcao & { categoria: string | null })[], elaboradorPadrao: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoEscala, setTipoEscala] = useState<TipoEscala | ''>('');
  const [dataEscala, setDataEscala] = useState('');
  const [elaboradoPor, setElaboradoPor] = useState(elaboradorPadrao);
  const [secoes, setSecoes] = useState<SecaoState[]>([]);
  const [fardamento, setFardamento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const funcaoOutroId = useMemo(() => funcoes.find(f => f.nome.toUpperCase() === 'OUTRO')?.id || '', [funcoes]);

  useEffect(() => {
    if (tipoEscala === 'COLABORACAO') {
      const gabarito = GABARITO_COLABORACAO;
      setFardamento(gabarito.fardamento);
      setObservacoes(gabarito.observacoes);

      const secoesDoGabarito = gabarito.secoes.map(secaoTemplate => {
        const itens = Array.from({ length: secaoTemplate.total }, (v, i): ItemState => { // Adiciona ItemState aqui
          const funcaoNome = secaoTemplate.itemFuncoes[i]?.toUpperCase() || '';
          const funcaoPredefinida = funcoes.find(f => f.nome.toUpperCase() === funcaoNome);
          let userIdPreenchido = '';
          if (secaoTemplate.isSecaoAdmin && funcaoPredefinida) {
             const adminComFuncao = admins.find(a => a.funcaoId === funcaoPredefinida.id);
             if (adminComFuncao) userIdPreenchido = adminComFuncao.id;
          }
          return {
            id: `item-${Math.random()}`,
            funcaoId: funcaoPredefinida?.id || '',
            horarioInicio: '13:00',
            horarioFim: '17:45',
            userId: userIdPreenchido,
            tema: '',
            cargoPersonalizado: '',
            // observacao: '', // Removido daqui
            auxiliarUserId: '', // Inicializa o novo campo
          };
        });
        return { ...secaoTemplate, id: `secao-${Math.random()}`, itens };
      });
      setSecoes(secoesDoGabarito);
    } else { /* ... (limpa estados) ... */ }
  }, [tipoEscala, funcoes, admins]);

  const handleAddItem = (secaoIndex: number) => {
    const novasSecoes = [...secoes];
    const secao = novasSecoes[secaoIndex];
    const ultimaFuncaoId = secao.itens[secao.itens.length - 1]?.funcaoId || '';
    // Adiciona o auxiliarUserId ao novo item
    secao.itens.push({ id: `item-${Math.random()}`, funcaoId: ultimaFuncaoId, cargoPersonalizado: '', horarioInicio: '13:00', horarioFim: '17:45', userId: '', tema: '', auxiliarUserId: '' });
    setSecoes(novasSecoes);
  };

  // handleRemoveItem - sem alterações

 const handleRemoveItem = (secaoIndex: number, itemIndex: number) => {
      const novasSecoes = [...secoes];
      // Permite remover mesmo se for o último item, SE a seção permitir múltiplos
      if (novasSecoes[secaoIndex].permiteMultiplosItens || novasSecoes[secaoIndex].itens.length > 1) {
          novasSecoes[secaoIndex].itens.splice(itemIndex, 1);
          // Adiciona um item vazio se a lista ficou vazia e permite múltiplos
          if (novasSecoes[secaoIndex].itens.length === 0 && novasSecoes[secaoIndex].permiteMultiplosItens) {
              handleAddItem(secaoIndex); // Adiciona um item em branco
          } else {
              setSecoes(novasSecoes);
          }
      } else {
          toast.info("A seção deve ter pelo menos um item.");
      }
  };

  const handleItemChange = (secaoIndex: number, itemIndex: number, field: keyof ItemState, value: string) => {
    const novasSecoes = [...secoes];
    (novasSecoes[secaoIndex].itens[itemIndex] as any)[field] = value;
    setSecoes(novasSecoes);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const todosItens = secoes.flatMap(secao =>
        secao.itens.map(item => {
            const funcao = funcoes.find(f => f.id === item.funcaoId);
            let cargoFinal = '';
            let observacaoFinal = null; // Inicializa observação como null

            if (secao.isSecaoPalestrante) {
              cargoFinal = item.tema || 'PALESTRA'; // O cargo é o tema
              // Monta a observação com o nome do auxiliar
              const auxiliar = alunos.find(a => a.id === item.auxiliarUserId);
              if (auxiliar) {
                observacaoFinal = `AUXILIAR - ${auxiliar.nomeDeGuerra || auxiliar.nome}`;
              }
            } else if (funcao?.id === funcaoOutroId) {
              cargoFinal = item.cargoPersonalizado; // Usa o texto digitado
            } else {
              cargoFinal = funcao?.nome || ''; // Usa o nome da função selecionada
            }

            return {
                secao: secao.nome,
                cargo: cargoFinal,
                horarioInicio: item.horarioInicio,
                horarioFim: item.horarioFim,
                alunoId: item.userId, // ID do usuário principal (palestrante ou função)
                observacao: observacaoFinal, // Envia a string formatada do auxiliar ou null
            }
        })
    ).filter(item => item.alunoId && item.cargo); // Valida se tem usuário E cargo/tema

    // ... (resto da lógica de submit, validação e chamada da API - sem alterações)
     if (todosItens.length === 0) { toast.error("Formulário incompleto", { description: "Adicione pelo menos um item válido." }); setIsSubmitting(false); return; }

    try {
      const response = await fetch('/api/escalas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataEscala: new Date(dataEscala).toISOString(), tipo: tipoEscala, elaboradoPor, itens: todosItens, fardamento, observacoes }) });
      if (!response.ok) throw new Error((await response.json()).error || "Falha ao criar a escala.");
      toast.success("Sucesso!", { description: "Escala criada como rascunho." });
      router.push('/admin/escalas'); router.refresh();
    } catch (error) { if (error instanceof Error) toast.error("Erro ao criar escala", { description: error.message }); }
    finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card> {/* Card de Infos Gerais */}
         {/* ... (Conteúdo do Card de Informações Gerais - sem alterações) ... */}
         <CardHeader><CardTitle>Informações Gerais</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><Label htmlFor="dataEscala">Data da Escala</Label><Input id="dataEscala" type="date" value={dataEscala} onChange={e => setDataEscala(e.target.value)} required /></div>
          <div><Label htmlFor="tipo">Tipo da Escala</Label><Select value={tipoEscala} onValueChange={(v: TipoEscala) => setTipoEscala(v)} required><SelectTrigger><SelectValue placeholder="Selecione o tipo..." /></SelectTrigger><SelectContent><SelectItem value="COLABORACAO">Colaboração (Gabarito)</SelectItem><SelectItem value="PERSONALIZADO">Personalizado</SelectItem><SelectItem value="ESPECIAL">Especial</SelectItem><SelectItem value="EVENTO">Evento</SelectItem><SelectItem value="OUTRO">Outro</SelectItem></SelectContent></Select></div>
          <div><Label htmlFor="elaboradoPor">Elaborado Por</Label><Input id="elaboradoPor" value={elaboradoPor} onChange={e => setElaboradoPor(e.target.value)} required /></div>
        </CardContent>
      </Card>

      {secoes.map((secao, secaoIndex) => (
        <Card key={secao.id}>
          <CardHeader><CardTitle>{secao.nome}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {secao.itens.map((item, itemIndex) => {
              const funcoesFiltradas = funcoes.filter(f => f.categoria === secao.categoriaEsperada || f.id === funcaoOutroId);
              const isOutroSelecionado = item.funcaoId === funcaoOutroId;
              const podeRemover = secao.permiteMultiplosItens || secao.itens.length > 1;

              return (
                <div key={item.id} className="grid grid-cols-12 gap-x-4 gap-y-2 border p-3 rounded-md relative">
                  {secao.isSecaoPalestrante ? (
                    <>
                      {/* Campos para Palestrante */}
                      <div className="col-span-12 md:col-span-4 space-y-2"><Label>Tema da Palestra</Label><Input placeholder="Tema..." value={item.tema} onChange={e => handleItemChange(secaoIndex, itemIndex, 'tema', e.target.value)} /></div>
                      <div className="col-span-12 md:col-span-4 space-y-2"><Label>Palestrante (Aluno)</Label><UserCombobox users={alunos} value={item.userId} onChange={userId => handleItemChange(secaoIndex, itemIndex, 'userId', userId)} /></div>
                      {/* SUBSTITUI O INPUT POR UM COMBOBOX DE ALUNOS */}
                      <div className="col-span-12 md:col-span-4 space-y-2"><Label>Auxiliar (Aluno)</Label><UserCombobox users={alunos} value={item.auxiliarUserId} onChange={userId => handleItemChange(secaoIndex, itemIndex, 'auxiliarUserId', userId)} /></div>
                    </>
                  ) : (
                    <>
                      {/* Campos para outras seções */}
                      <div className={`col-span-12 ${isOutroSelecionado ? 'md:col-span-2' : 'md:col-span-3'} space-y-2`}><Label>Função</Label><Select value={item.funcaoId} onValueChange={value => handleItemChange(secaoIndex, itemIndex, 'funcaoId', value)}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{funcoesFiltradas.map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent></Select></div>
                      {isOutroSelecionado && <div className="col-span-12 md:col-span-2 space-y-2"><Label>Função (Outro)</Label><Input placeholder="Digite a função..." value={item.cargoPersonalizado} onChange={e => handleItemChange(secaoIndex, itemIndex, 'cargoPersonalizado', e.target.value)} /></div>}
                      <div className="col-span-12 md:col-span-3 space-y-2"><Label>Usuário</Label><UserCombobox users={secao.isSecaoAdmin ? admins : alunos} value={item.userId} onChange={userId => handleItemChange(secaoIndex, itemIndex, 'userId', userId)} /></div>
                    </>
                  )}
                  {/* Horários e Botão Remover (sem alterações) */}
                  <div className="col-span-6 md:col-span-2 space-y-2"><Label>Início</Label><Input type="time" value={item.horarioInicio} onChange={e => handleItemChange(secaoIndex, itemIndex, 'horarioInicio', e.target.value)} /></div>
                  <div className="col-span-6 md:col-span-1 space-y-2"><Label>Fim</Label><Input type="time" value={item.horarioFim} onChange={e => handleItemChange(secaoIndex, itemIndex, 'horarioFim', e.target.value)} /></div>
                  {podeRemover && <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => handleRemoveItem(secaoIndex, itemIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                </div>
              );
            })}
            {secao.permiteMultiplosItens && <Button type="button" variant="outline" onClick={() => handleAddItem(secaoIndex)} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar em {secao.nome}</Button>}
          </CardContent>
        </Card>
      ))}

      {/* Cards de Fardamento e Observações (sem alterações) */}
      {tipoEscala === 'COLABORACAO' && <>
          <Card><CardHeader><CardTitle>Fardamento</CardTitle></CardHeader><CardContent><Textarea value={fardamento} onChange={(e) => setFardamento(e.target.value)} rows={4} /></CardContent></Card>
          <Card><CardHeader><CardTitle>Observações</CardTitle></CardHeader><CardContent><Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={6} /></CardContent></Card>
      </>}

      {/* Botão Salvar (sem alterações) */}
      <div className="flex justify-end pt-4"><Button type="submit" disabled={isSubmitting}><Save className="mr-2 h-4 w-4" />{isSubmitting ? "Salvando..." : "Salvar Rascunho"}</Button></div>
    </form>
  );
}

// --- COMPONENTE AUXILIAR ---
function UserCombobox({ users, value, onChange }: { users: UserComFuncao[], value: string, onChange: (value: string) => void }) {
    const [open, setOpen] = useState(false);
    const selectedUser = users.find(u => u.id === value);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild><Button variant="outline" role="combobox" className="w-full justify-between font-normal">{selectedUser ? (selectedUser.nomeDeGuerra || selectedUser.nome) : "Selecione..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Buscar..." /><CommandList><CommandEmpty>Nenhum usuário.</CommandEmpty><CommandGroup>
                {/* Corrigido: Acessar nomeDeGuerra corretamente */}
                {users.map(user => (<CommandItem key={user.id} value={user.nomeDeGuerra || user.nome} onSelect={() => { onChange(user.id); setOpen(false); }}>{user.nomeDeGuerra || user.nome}</CommandItem>))}
            </CommandGroup></CommandList></Command></PopoverContent>
        </Popover>
    );
}