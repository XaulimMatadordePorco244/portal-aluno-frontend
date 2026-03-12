'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { efetivarPromocoesDoCiclo } from '@/app/actions/transicoes';

export interface VagasDisponiveis {
    superiores: number;
    intermediarios: number;
    subalternos: number;
    subtenentes: number;
    sargentos: number;
    cabos: number;
    soldados: number;
    _debug?: any;
}

export default function QuadroAcessoClient({ ciclo, cargos }: { ciclo: any, cargos: any[], vagas: VagasDisponiveis }) {
    const router = useRouter();
    const [abaAtiva, setAbaAtiva] = useState<'ANTIGUIDADE' | 'MERECIMENTO' | 'MERITO_ESCOLAR'>('ANTIGUIDADE');
    const [selecionados, setSelecionados] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);

    const getCandidatosOrdenados = (modalidade: string) => {
        let lista = [...ciclo.candidatos];

        if (modalidade === 'ANTIGUIDADE') {
            lista = lista.filter(c => {
                const isAlSd = c.aluno.cargo?.abreviacao === 'AL SD';
                const boletim = c.aluno.desempenhosEscolares?.[0];
                const estaAprovadoNaEscola = boletim?.situacao === 'APROVADO';

                // Se for AL SD, TEM que ter 8.0 de conceito E estar APROVADO na escola!
                if (isAlSd) {
                    return c.conceitoSnapshot >= 8.0 && estaAprovadoNaEscola;
                }

                // Para os outros cargos, segue a regra normal (Conceito >= 8.0)
                return c.conceitoSnapshot >= 8.0;
            });

            lista.sort((a, b) => {
                const tempoA = new Date(a.aluno.dataUltimaPromocao || a.aluno.createdAt).getTime();
                const tempoB = new Date(b.aluno.dataUltimaPromocao || b.aluno.createdAt).getTime();
                if (tempoA !== tempoB) return tempoA - tempoB;
                if (a.conceitoSnapshot !== b.conceitoSnapshot) return b.conceitoSnapshot - a.conceitoSnapshot;
                const nascA = new Date(a.aluno.usuario.dataNascimento).getTime();
                const nascB = new Date(b.aluno.usuario.dataNascimento).getTime();
                return nascA - nascB;
            });
        }
        else if (modalidade === 'MERECIMENTO') {
            lista.sort((a, b) => {
                const somaA = a.conceitoSnapshot + a.mediaEscolarSnapshot;
                const somaB = b.conceitoSnapshot + b.mediaEscolarSnapshot;
                if (somaA !== somaB) return somaB - somaA;
                const tempoA = new Date(a.aluno.dataUltimaPromocao || a.aluno.createdAt).getTime();
                const tempoB = new Date(b.aluno.dataUltimaPromocao || b.aluno.createdAt).getTime();
                if (tempoA !== tempoB) return tempoA - tempoB;
                return new Date(a.aluno.usuario.dataNascimento).getTime() - new Date(b.aluno.usuario.dataNascimento).getTime();
            });
        }
        else if (modalidade === 'MERITO_ESCOLAR') {
            lista = lista.filter(c => c.conceitoSnapshot >= 20.0 && c.mediaEscolarSnapshot >= 7.0);
            lista.sort((a, b) => b.conceitoSnapshot - a.conceitoSnapshot);
        }

        return lista;
    };

    const candidatosDaAba = getCandidatosOrdenados(abaAtiva);

    const toggleSelecao = (alunoId: string) => {
        setSelecionados(prev => ({ ...prev, [alunoId]: !prev[alunoId] }));
    };

    const getProximoCargo = (cargoAtualId: string) => {
        const currentIndex = cargos.findIndex(c => c.id === cargoAtualId);
        const targetIndex = currentIndex - 1;
        return targetIndex >= 0 ? cargos[targetIndex] : null;
    };

    const handleEfetivar = async () => {
        const confirmacao = confirm(`Tem certeza que deseja promover os alunos selecionados na modalidade de ${abaAtiva}?`);
        if (!confirmacao) return;

        setLoading(true);

        const payload = candidatosDaAba
            .filter(c => selecionados[c.alunoId])
            .map(c => {
                const proximoCargo = getProximoCargo(c.aluno.cargoId);
                return {
                    alunoId: c.alunoId,
                    novoCargoId: proximoCargo!.id,
                    modalidade: abaAtiva
                };
            });

        if (payload.length === 0) {
            alert("Selecione pelo menos um aluno para promover.");
            setLoading(false);
            return;
        }

        const result = await efetivarPromocoesDoCiclo(payload, ciclo.id);

        if (result.success) {
            alert(result.message);
            setSelecionados({});
            router.refresh();
        } else {
            alert(result.message);
        }
        setLoading(false);
    };

    const isFechado = ciclo.status === 'FINALIZADO';

    return (
        <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="flex border-b border-border bg-muted/30">
                {['ANTIGUIDADE', 'MERECIMENTO', 'MERITO_ESCOLAR'].map((aba) => (
                    <button
                        key={aba}
                        onClick={() => { setAbaAtiva(aba as any); setSelecionados({}); }}
                        className={`px-6 py-4 text-sm font-semibold transition-colors ${abaAtiva === aba
                                ? 'border-b-2 border-primary text-primary bg-card'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            }`}
                    >
                        Por {aba.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                        <tr>
                            {!isFechado && <th className="p-4 w-12">Aprovar</th>}
                            <th className="p-4">Aluno(a)</th>
                            <th className="p-4">Patente Atual</th>
                            <th className="p-4 text-primary font-bold">Promoção Para</th>
                            <th className="p-4">Conceito</th>
                            <th className="p-4">Média Escolar</th>
                            <th className="p-4">Escola</th>
                            <th className="p-4">TAF</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {candidatosDaAba.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                    Nenhum aluno atingiu os requisitos mínimos para esta modalidade.
                                </td>
                            </tr>
                        )}
                        {candidatosDaAba.map((candidato, index) => {
                            const proximoCargo = getProximoCargo(candidato.aluno.cargoId);
                            const isSelecionado = selecionados[candidato.alunoId] || false;
                            const jaAprovado = candidato.resultado === 'APROVADO';

                            return (
                                <tr key={candidato.id} className={`transition-colors hover:bg-muted/30 ${isSelecionado ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                                    {!isFechado && (
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                disabled={jaAprovado || !proximoCargo}
                                                checked={isSelecionado || jaAprovado}
                                                onChange={() => toggleSelecao(candidato.alunoId)}
                                                className="w-5 h-5 rounded border-input text-primary focus:ring-ring bg-background"
                                            />
                                        </td>
                                    )}
                                    <td className="p-4">
                                        <div className="font-semibold text-foreground">{candidato.aluno.usuario.nome}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            Nasc: {new Date(candidato.aluno.usuario.dataNascimento).toLocaleDateString()}
                                            <span className="ml-2 font-bold opacity-60">#{index + 1} da fila</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium border border-border/50">
                                            {candidato.aluno.cargo?.nome}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-primary">
                                        {proximoCargo ? proximoCargo.nome : <span className="text-muted-foreground text-xs">Topo da Carreira</span>}
                                    </td>
                                    <td className="p-4 font-medium">{candidato.conceitoSnapshot.toFixed(1)}</td>
                                    <td className="p-4 font-medium">{candidato.mediaEscolarSnapshot.toFixed(1)}</td>
                                    <td className="p-4 font-medium">{candidato.tafSnapshot.toFixed(1)}</td>
                                    <td className="p-4">
                                        {(() => {
                                            const boletim = candidato.aluno.desempenhosEscolares?.[0];
                                            const situacao = boletim?.situacao || 'PENDENTE';

                                            if (situacao === 'APROVADO') {
                                                return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-md">Aprovado</span>;
                                            } else if (situacao === 'REPROVADO') {
                                                return <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-bold rounded-md">Reprovado</span>;
                                            } else {
                                                return <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold rounded-md">{situacao}</span>;
                                            }
                                        })()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {!isFechado && (
                <div className="p-6 bg-muted/30 border-t border-border flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-medium">
                        {Object.values(selecionados).filter(Boolean).length} aluno(s) selecionado(s) para promoção.
                    </span>
                    <button
                        onClick={handleEfetivar}
                        disabled={loading || Object.values(selecionados).filter(Boolean).length === 0}
                        className="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-bold py-2 px-6 rounded-lg shadow-sm transition-all"
                    >
                        {loading ? 'Processando...' : 'Efetivar Promoções'}
                    </button>
                </div>
            )}
        </div>
    );
}