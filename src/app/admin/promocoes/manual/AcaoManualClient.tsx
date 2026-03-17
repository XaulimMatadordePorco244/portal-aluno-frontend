'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Search, ChevronDown, Check, X, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { processarTransicaoEmMassa, TipoTransicao } from '@/app/actions/transicoes';

export interface AlunoSimples {
    id: string;
    usuario?: { nome: string; nomeDeGuerra?: string | null };
    cargo: { id: string; nome: string; precedencia?: number; categoria?: string }; // Adicionado categoria
}

const motivosPromocao = [
    { value: 'ANTIGUIDADE', label: 'Antiguidade' },
    { value: 'BRAVURA', label: 'Ato de Bravura' },
    { value: 'TERMINO_CURSO', label: 'Término de Curso' },
    { value: 'MERITO_ESCOLAR', label: 'Mérito Escolar' },
    { value: 'MERITO_INTELECTUAL', label: 'Mérito Intelectual' },
];

const motivosDespromocao = [
    { value: 'INDISCIPLINA', label: 'Indisciplina' },
    { value: 'INSUBORDINACAO', label: 'Insubordinação' },
    { value: 'REPROVACAO_ESCOLAR', label: 'Reprovação Escolar' },
    { value: 'CORRECAO_SISTEMA', label: 'Correção de Sistema' },
];

export default function AcaoManualClient({ alunos }: { alunos: AlunoSimples[] }) {
    const router = useRouter();
    
    const [acaoManual, setAcaoManual] = useState<'PROMOVER' | 'DESPROMOVER'>('PROMOVER');
    const [motivo, setMotivo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [alunosSelecionadosIds, setAlunosSelecionadosIds] = useState<string[]>([]); 
    
    const [escolherCargoManualmente, setEscolherCargoManualmente] = useState(false);
    const [cargoManualId, setCargoManualId] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [buscaAluno, setBuscaAluno] = useState('');
    const [dropdownAlunoAberto, setDropdownAlunoAberto] = useState(false);
    const [dropdownMotivoAberto, setDropdownMotivoAberto] = useState(false);
    const [dropdownCargoAberto, setDropdownCargoAberto] = useState(false);
    
    const dropdownAlunoRef = useRef<HTMLDivElement>(null);
    const dropdownMotivoRef = useRef<HTMLDivElement>(null);
    const dropdownCargoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownAlunoRef.current && !dropdownAlunoRef.current.contains(event.target as Node)) setDropdownAlunoAberto(false);
            if (dropdownMotivoRef.current && !dropdownMotivoRef.current.contains(event.target as Node)) setDropdownMotivoAberto(false);
            if (dropdownCargoRef.current && !dropdownCargoRef.current.contains(event.target as Node)) setDropdownCargoAberto(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const alunosSelecionados = alunos.filter(a => alunosSelecionadosIds.includes(a.id));
    
    const todosMesmoCargo = alunosSelecionados.length > 0 && alunosSelecionados.every(a => a.cargo.id === alunosSelecionados[0].cargo.id);
    const cargoReferencia = todosMesmoCargo ? alunosSelecionados[0].cargo : null;

    const todosCargos = Array.from(new Map(alunos.map(a => [a.cargo.id, a.cargo])).values())
        .sort((a, b) => (a.precedencia || 0) - (b.precedencia || 0));

    const cargosParaCalculo = acaoManual === 'PROMOVER' 
        ? todosCargos.filter(c => c.categoria !== 'FORMACAO') 
        : todosCargos; 

    const cargoAtualIndex = cargoReferencia 
        ? cargosParaCalculo.findIndex(c => c.id === cargoReferencia.id) 
        : -1;

    let cargoAutomatico = null;
    if (cargoAtualIndex !== -1) {
        if (acaoManual === 'PROMOVER' && cargoAtualIndex > 0) {
            cargoAutomatico = cargosParaCalculo[cargoAtualIndex - 1]; 
        } else if (acaoManual === 'DESPROMOVER' && cargoAtualIndex < cargosParaCalculo.length - 1) {
            cargoAutomatico = cargosParaCalculo[cargoAtualIndex + 1]; 
        }
    }

    const cargosDisponiveisManuais = cargosParaCalculo.filter((_, index) => {
        if (cargoAtualIndex === -1) return true; 
        if (acaoManual === 'PROMOVER') return index < cargoAtualIndex; 
        return index > cargoAtualIndex; 
    });

    const cargoDestinoFinal = escolherCargoManualmente 
        ? todosCargos.find(c => c.id === cargoManualId) 
        : cargoAutomatico;

    const alunosFiltrados = alunos.filter(a => {
        const termo = buscaAluno.toLowerCase();
        return a.usuario?.nome.toLowerCase().includes(termo) || 
               a.usuario?.nomeDeGuerra?.toLowerCase().includes(termo) ||
               a.cargo.nome.toLowerCase().includes(termo);
    });

    const motivosAtuais = acaoManual === 'PROMOVER' ? motivosPromocao : motivosDespromocao;
    const motivoLabel = motivosAtuais.find(m => m.value === motivo)?.label || '';

    const toggleAluno = (id: string) => {
        setAlunosSelecionadosIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const removerAluno = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setAlunosSelecionadosIds(prev => prev.filter(x => x !== id));
    };

    const handleRevisarAcao = () => {
        if (alunosSelecionadosIds.length === 0) return toast.error("Selecione pelo menos um aluno.");
        if (!motivo) return toast.error("Selecione a fundamentação legal.");
        if (escolherCargoManualmente && !cargoManualId) return toast.error("Selecione a patente de destino manual.");
        if (!escolherCargoManualmente && todosMesmoCargo && !cargoAutomatico) {
            return toast.error(acaoManual === 'PROMOVER' ? "Os alunos selecionados já estão no topo do quadro!" : "Os alunos selecionados já estão na base!");
        }

        setShowModal(true); 
    };

   const handleConfirmarAcaoManual = async () => {
        setIsSubmitting(true);
        const tipoParaAction: TipoTransicao = acaoManual === 'PROMOVER' ? 'PROMOCAO' : 'DESPROMOCAO';

        const payload = {
            alunoIds: alunosSelecionadosIds,
            tipo: tipoParaAction,
            cargoDestinoId: cargoDestinoFinal?.id, 
            motivo: motivo as any, 
            descricao: descricao 
        };

        const result = await processarTransicaoEmMassa(payload);
        
        if (result.success) {
            toast.success(result.message);
            router.refresh(); 
            router.push('/admin/promocoes'); 
        } else {
            toast.error(result.message);
            setIsSubmitting(false);
            setShowModal(false);
        }
    };

    const renderTextoTransicaoPadrao = () => {
        if (alunosSelecionadosIds.length === 0) return 'Aguardando seleção...';
        if (!todosMesmoCargo) return 'Cada militar avançará 1 posto no quadro';
        if (cargoAutomatico) return `Para ${cargoAutomatico.nome}`;
        return 'Limite do quadro atingido';
    };

    return (
        <div className=" animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            <div className="bg-card border border-border rounded-xl shadow-sm p-8 space-y-8">
                
                <div className="flex gap-4">
                    <label className={`flex-1 cursor-pointer border rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-200 ${acaoManual === 'PROMOVER' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md ring-1 ring-emerald-500/20' : 'bg-background border-border text-muted-foreground hover:bg-muted/50 hover:border-muted-foreground/30'}`}>
                        <input type="radio" className="hidden" checked={acaoManual === 'PROMOVER'} onChange={() => { setAcaoManual('PROMOVER'); setMotivo(''); setEscolherCargoManualmente(false); setCargoManualId(''); setAlunosSelecionadosIds([]); }} />
                        <TrendingUp className="w-8 h-8 mb-3 opacity-90" strokeWidth={1.5} />
                        <span className="font-semibold tracking-wide uppercase text-sm">Promoção</span>
                    </label>
                    <label className={`flex-1 cursor-pointer border rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-200 ${acaoManual === 'DESPROMOVER' ? 'bg-destructive/10 border-destructive text-destructive shadow-md ring-1 ring-destructive/20' : 'bg-background border-border text-muted-foreground hover:bg-muted/50 hover:border-muted-foreground/30'}`}>
                        <input type="radio" className="hidden" checked={acaoManual === 'DESPROMOVER'} onChange={() => { setAcaoManual('DESPROMOVER'); setMotivo(''); setEscolherCargoManualmente(false); setCargoManualId(''); setAlunosSelecionadosIds([]); }} />
                        <TrendingDown className="w-8 h-8 mb-3 opacity-90" strokeWidth={1.5} />
                        <span className="font-semibold tracking-wide uppercase text-sm">Despromoção</span>
                    </label>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/90">Método</label>
                    <div className="relative" ref={dropdownMotivoRef}>
                        <div 
                            className="flex h-12 w-full items-center justify-between rounded-lg border border-input bg-background/50 px-4 text-sm font-medium shadow-sm cursor-pointer hover:bg-muted/30 transition-all focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary"
                            onClick={() => setDropdownMotivoAberto(!dropdownMotivoAberto)}
                        >
                            <span className="truncate">
                                {motivo 
                                    ? <span className="font-semibold">{motivoLabel}</span> 
                                    : <span className="text-muted-foreground font-normal">Selecione o método apropriado...</span>}
                            </span>
                            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownMotivoAberto ? 'rotate-180' : ''}`} />
                        </div>

                        {dropdownMotivoAberto && (
                            <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95">
                                <div className="p-1 overflow-y-auto max-h-[220px]">
                                    {motivosAtuais.map(item => (
                                        <div 
                                            key={item.value}
                                            className={`flex w-full cursor-pointer items-center rounded-md py-2.5 px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${motivo === item.value ? 'bg-primary/10 text-primary' : ''}`}
                                            onClick={() => { setMotivo(item.value); setDropdownMotivoAberto(false); }}
                                        >
                                            {item.label}
                                            {motivo === item.value && <Check className="ml-auto h-4 w-4 text-primary" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-semibold text-foreground/90">Alunos Selecionados</label>
                        {alunosSelecionadosIds.length > 0 && (
                            <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                {alunosSelecionadosIds.length} selecionado(s)
                            </span>
                        )}
                    </div>
                    
                    <div className="relative" ref={dropdownAlunoRef}>
                        <div 
                            className="min-h-12 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm font-medium shadow-sm cursor-pointer hover:bg-muted/30 transition-all focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary flex flex-wrap gap-2 items-center"
                            onClick={() => setDropdownAlunoAberto(true)}
                        >
                            {alunosSelecionadosIds.length === 0 ? (
                                <span className="text-muted-foreground font-normal py-1 px-1">Pesquise e adicione alunos ao lote...</span>
                            ) : (
                                alunosSelecionados.map(aluno => (
                                    <span key={aluno.id} className="inline-flex items-center gap-1 bg-secondary/80 text-secondary-foreground border border-border px-2.5 py-1 rounded-md text-xs font-semibold">
                                        {aluno.usuario?.nomeDeGuerra || aluno.usuario?.nome}
                                        <button onClick={(e) => removerAluno(e, aluno.id)} className="hover:text-destructive transition-colors ml-1">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))
                            )}
                            <div className="ml-auto pl-2">
                                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownAlunoAberto ? 'rotate-180' : ''}`} />
                            </div>
                        </div>

                        {dropdownAlunoAberto && (
                            <div className="absolute z-50 mt-2 max-h-64 w-full overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95">
                                <div className="sticky top-0 bg-popover p-2 border-b border-border">
                                    <div className="flex items-center px-3 rounded-md bg-muted/50 focus-within:ring-2 focus-within:ring-primary/40 transition-all">
                                        <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                                        <input 
                                            autoFocus
                                            className="flex h-10 w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground placeholder:font-normal"
                                            placeholder="Buscar por nome, guerra ou posto..."
                                            value={buscaAluno}
                                            onChange={(e) => setBuscaAluno(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="p-1 overflow-y-auto max-h-[190px]">
                                    {alunosFiltrados.length === 0 ? (
                                        <div className="p-4 text-sm text-center text-muted-foreground">Nenhum aluno encontrado.</div>
                                    ) : (
                                        alunosFiltrados.map(aluno => {
                                            const isSelecionado = alunosSelecionadosIds.includes(aluno.id);
                                            return (
                                                <div 
                                                    key={aluno.id}
                                                    className={`flex w-full cursor-pointer items-center rounded-md py-2.5 px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isSelecionado ? 'bg-primary/10 text-primary' : ''}`}
                                                    onClick={() => toggleAluno(aluno.id)}
                                                >
                                                    <div className={`w-4 h-4 mr-3 rounded border flex items-center justify-center transition-colors ${isSelecionado ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background'}`}>
                                                        {isSelecionado && <Check className="w-3 h-3" />}
                                                    </div>
                                                    {aluno.cargo?.nome} - GM {aluno.usuario?.nomeDeGuerra || aluno.usuario?.nome}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                                {alunosSelecionadosIds.length > 0 && (
                                    <div className="p-2 border-t border-border bg-muted/30">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setDropdownAlunoAberto(false); setBuscaAluno(''); }}
                                            className="w-full py-1.5 text-xs font-bold uppercase text-center rounded bg-secondary hover:bg-secondary/80 transition-colors"
                                        >
                                            Concluir Seleção
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {alunosSelecionadosIds.length > 0 && (
                    <div className="p-5 border border-border bg-muted/10 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <span className="text-sm">
                                Transição Padrão: <strong className={acaoManual === 'PROMOVER' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}>
                                    {renderTextoTransicaoPadrao()}
                                </strong>
                            </span>
                            
                            <label className="flex items-center space-x-2 text-sm cursor-pointer select-none font-medium group">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-input w-4 h-4 text-primary focus:ring-primary/40 transition-all"
                                    checked={escolherCargoManualmente}
                                    onChange={(e) => {
                                        setEscolherCargoManualmente(e.target.checked);
                                        if (!e.target.checked) setCargoManualId('');
                                    }}
                                />
                                <span className="group-hover:text-primary transition-colors">Definir mesmo destino para todos</span>
                            </label>
                        </div>

                        {escolherCargoManualmente && (
                            <div className="pt-2 animate-in fade-in slide-in-from-top-1" ref={dropdownCargoRef}>
                                <div 
                                    className="relative flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background/50 px-4 text-sm font-medium shadow-sm cursor-pointer hover:bg-muted/30 transition-all focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary"
                                    onClick={() => setDropdownCargoAberto(!dropdownCargoAberto)}
                                >
                                    <span className="truncate">
                                        {cargoManualId 
                                            ? <span className="font-semibold">{todosCargos.find(c => c.id === cargoManualId)?.nome}</span> 
                                            : <span className="text-muted-foreground font-normal">Selecione o cargo de destino geral...</span>}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownCargoAberto ? 'rotate-180' : ''}`} />
                                </div>

                                    {dropdownCargoAberto && (
                                    <div className="absolute z-50 mt-2 w-full max-w-[calc(100%-4rem)] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95">
                                        <div className="p-1 overflow-y-auto max-h-[190px]">
                                            {cargosDisponiveisManuais.length === 0 ? (
                                                <div className="p-4 text-sm text-center text-destructive font-medium">Não existem cargos disponíveis.</div>
                                            ) : (
                                                cargosDisponiveisManuais.map(cargo => (
                                                    <div 
                                                        key={cargo.id}
                                                        className={`flex w-full cursor-pointer items-center rounded-md py-2.5 px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${cargo.id === cargoManualId ? 'bg-primary/10 text-primary' : ''}`}
                                                        onClick={() => { setCargoManualId(cargo.id); setDropdownCargoAberto(false); }}
                                                    >
                                                        {cargo.nome}
                                                        {cargo.id === cargoManualId && <Check className="ml-auto h-4 w-4 text-primary" />}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/90">Descrição</label>
                    <textarea 
                        rows={3}
                        className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-sm resize-none transition-all hover:bg-muted/30 placeholder:font-normal placeholder:text-muted-foreground"
                        placeholder="Descreva a fundamentação em texto, número de BI ou observações..."
                        value={descricao} onChange={(e) => setDescricao(e.target.value)}
                    ></textarea>
                </div>

                <button 
                    onClick={handleRevisarAcao}
                    className="w-full py-4 text-sm tracking-wide uppercase font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
                >
                    Revisar Transição 
                </button>
            </div>

            {showModal && alunosSelecionadosIds.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card text-card-foreground border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                        
                        <div className={`shrink-0 p-8 text-center text-white relative ${acaoManual === 'PROMOVER' ? 'bg-emerald-600' : 'bg-destructive'}`}>
                            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                                {acaoManual === 'PROMOVER' ? <TrendingUp className="w-8 h-8 text-white" strokeWidth={2} /> : <TrendingDown className="w-8 h-8 text-white" strokeWidth={2} />}
                            </div>
                            <h3 className="text-2xl font-black tracking-tight uppercase">
                                Processar Lote: {acaoManual === 'PROMOVER' ? 'Promoção' : 'Despromoção'}
                            </h3>
                        </div>

                        <div className="p-8 space-y-6 overflow-y-auto">
                            
                            <div className="bg-muted/30 p-5 rounded-xl border border-border relative overflow-hidden">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${acaoManual === 'PROMOVER' ? 'bg-emerald-500' : 'bg-destructive'}`} />
                                <div className="flex items-center gap-2 mb-3">
                                    <Users className="w-5 h-5 text-muted-foreground" />
                                    <h4 className="font-bold uppercase text-sm tracking-wider">{alunosSelecionadosIds.length} Alunos Afetados</h4>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {alunosSelecionados.map(a => (
                                        <span key={a.id} className="bg-background border border-border text-xs font-semibold px-2 py-1 rounded">
                                            {a.usuario?.nomeDeGuerra || a.usuario?.nome}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/20 p-4 rounded-lg border border-border text-center">
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Cargo(s) Atual(is)</p>
                                    <p className="font-semibold text-sm">
                                        {todosMesmoCargo && cargoReferencia ? cargoReferencia.nome : 'Múltiplos Cargos'}
                                    </p>
                                </div>
                                <div className="bg-muted/20 p-4 rounded-lg border border-border text-center">
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Destino Final</p>
                                    <p className={`font-black text-sm ${acaoManual === 'PROMOVER' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                                        {escolherCargoManualmente && cargoDestinoFinal
                                            ? cargoDestinoFinal.nome 
                                            : (todosMesmoCargo && cargoAutomatico ? cargoAutomatico.nome : '+/- 1 Cargo Automático')}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-border pt-4">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Método</p>
                                <p className="text-sm font-semibold">{motivoLabel}</p>
                            </div>
                        </div>

                        <div className="shrink-0 p-6 border-t border-border flex gap-4 bg-muted/10">
                            <button 
                                onClick={() => setShowModal(false)}
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold uppercase tracking-wide text-sm rounded-lg transition-colors border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleConfirmarAcaoManual}
                                disabled={isSubmitting}
                                className={`flex-1 py-3 text-white font-bold uppercase tracking-wide text-sm rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ${acaoManual === 'PROMOVER' ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600' : 'bg-destructive hover:bg-destructive/90 focus:ring-destructive'}`}
                            >
                                {isSubmitting ? 'Processando Lote...' : 'Efetivar Transições'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}