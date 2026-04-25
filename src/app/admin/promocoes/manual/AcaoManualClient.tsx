'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Search, Check, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { processarTransicaoEmMassa, TipoTransicao } from '@/app/actions/transicoes';
import { MotivoPromocao, MotivoDespromocao } from '@prisma/client';

export interface AlunoSimples {
    id: string;
    usuario?: { nome: string; nomeDeGuerra?: string | null };
    cargo: { id: string; nome: string; precedencia?: number; categoria?: string };
}

const motivosPromocao = [
    { value: 'ANTIGUIDADE', label: 'Antiguidade' },
    { value: 'BRAVURA', label: 'Ato de Bravura' },
    { value: 'TERMINO_CURSO', label: 'Término de Curso' },
    { value: 'MERECIMENTO', label: 'Merecimento' },
    { value: 'MERITO_ESCOLAR', label: 'Mérito Escolar' },
    { value: 'MERITO_INTELECTUAL', label: 'Mérito Intelectual' },
    { value: 'CORRECAO_SISTEMA', label: 'Correção de Lançamento' },
];

const motivosDespromocao = [
    { value: 'INDISCIPLINA', label: 'Indisciplina' },
    { value: 'INSUBORDINACAO', label: 'Insubordinação' },
    { value: 'REPROVACAO_ESCOLAR', label: 'Reprovação Escolar' },
    { value: 'CORRECAO_SISTEMA', label: 'Correção de Lançamento' },
];

export default function AcaoManualClient({ alunos }: { alunos: AlunoSimples[] }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAlunos, setSelectedAlunos] = useState<AlunoSimples[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [acaoManual, setAcaoManual] = useState<TipoTransicao>('PROMOCAO');
    const [motivo, setMotivo] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredAlunos = alunos.filter(aluno => 
        aluno.usuario?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.usuario?.nomeDeGuerra?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleAluno = (aluno: AlunoSimples) => {
        if (selectedAlunos.find(a => a.id === aluno.id)) {
            setSelectedAlunos(selectedAlunos.filter(a => a.id !== aluno.id));
        } else {
            setSelectedAlunos([...selectedAlunos, aluno]);
        }
    };

    const handleConfirmarAcaoManual = async () => {
        if (!motivo) {
            toast.error('Selecione um motivo');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await processarTransicaoEmMassa({
                alunoIds: selectedAlunos.map(a => a.id),
                tipo: acaoManual,
                motivo: motivo as MotivoPromocao | MotivoDespromocao,
            });

            if (res.success) {
                toast.success(res.message);
                setSelectedAlunos([]);
                setShowModal(false);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error('Erro ao processar ação');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-180px)]">
            <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="Buscar aluno por nome ou guerra..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                        onClick={() => { setAcaoManual('PROMOCAO'); setShowModal(true); }}
                        disabled={selectedAlunos.length === 0}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg font-medium transition-all shadow-sm"
                    >
                        <TrendingUp className="w-4 h-4" />
                        Promover ({selectedAlunos.length})
                    </button>
                    <button 
                        onClick={() => { setAcaoManual('DESPROMOCAO'); setShowModal(true); }}
                        disabled={selectedAlunos.length === 0}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-destructive hover:bg-destructive/90 disabled:opacity-40 text-white rounded-lg font-medium transition-all shadow-sm"
                    >
                        <TrendingDown className="w-4 h-4" />
                        Despromover
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto rounded-xl border border-border bg-card shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/50 sticky top-0 z-10 border-b border-border">
                        <tr>
                            <th className="p-4 w-10"></th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cargo Atual</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredAlunos.map(aluno => (
                            <tr 
                                key={aluno.id}
                                onClick={() => toggleAluno(aluno)}
                                className={`cursor-pointer transition-colors hover:bg-muted/30 ${selectedAlunos.find(a => a.id === aluno.id) ? 'bg-primary/5' : ''}`}
                            >
                                <td className="p-4">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedAlunos.find(a => a.id === aluno.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-slate-300'}`}>
                                        {selectedAlunos.find(a => a.id === aluno.id) && <Check className="w-3 h-3" />}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-slate-900 dark:text-slate-100">{aluno.usuario?.nomeDeGuerra}</div>
                                    <div className="text-xs text-slate-500 truncate max-w-[200px]">{aluno.usuario?.nome}</div>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded-md bg-muted text-slate-600 text-[10px] font-bold uppercase tracking-tight">
                                        {aluno.cargo.nome}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className={`p-6 text-white ${acaoManual === 'PROMOCAO' ? 'bg-emerald-600' : 'bg-destructive'}`}>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                {acaoManual === 'PROMOCAO' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                                Confirmar Transição em Massa
                            </h3>
                            <p className="opacity-90 text-sm mt-1">Defina o motivo para os {selectedAlunos.length} alunos selecionados.</p>
                        </div>

                        <div className="p-6 space-y-4">
                            {acaoManual === 'PROMOCAO' && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                    <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-tight">
                                        <strong>Ordem de Antiguidade:</strong> A ordem na lista abaixo define quem é mais antigo. O primeiro da lista terá precedência sobre os demais em caso de empate na data.
                                    </p>
                                </div>
                            )}

                            <div className="max-h-40 overflow-y-auto border rounded-lg bg-muted/20 divide-y">
                                {selectedAlunos.map((aluno, idx) => (
                                    <div key={aluno.id} className="p-2 flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 flex items-center justify-center bg-primary/10 text-primary rounded-full text-[10px] font-bold">
                                                {idx + 1}º
                                            </span>
                                            <span className="font-medium">{aluno.usuario?.nomeDeGuerra}</span>
                                        </div>
                                        <span className="text-[10px] uppercase text-muted-foreground">{aluno.cargo.nome}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Motivo da Transição</label>
                                <select 
                                    className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20"
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                >
                                    <option value="">Selecione um motivo...</option>
                                    {(acaoManual === 'PROMOCAO' ? motivosPromocao : motivosDespromocao).map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border flex gap-4 bg-muted/10">
                            <button 
                                onClick={() => setShowModal(false)}
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-secondary text-secondary-foreground font-bold uppercase text-sm rounded-lg border border-border transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleConfirmarAcaoManual}
                                disabled={isSubmitting}
                                className={`flex-1 py-3 text-white font-bold uppercase text-sm rounded-lg shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 ${acaoManual === 'PROMOCAO' ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600' : 'bg-destructive hover:bg-destructive/90 focus:ring-destructive'}`}
                            >
                                {isSubmitting ? 'Processando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}