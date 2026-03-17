'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    criarCicloPromocao,
    gerarQuadroDeAcesso,
    apagarCicloPromocao,
    encerrarCicloPromocao
} from '@/app/actions/transicoes';

export interface CicloListagem {
    id: string;
    nome?: string;
    dataInicio?: Date | string;
    dataFim?: Date | string | null;
    status: string;
    _count: {
        candidatos: number;
    };
}
export default function CiclosListClient({ ciclosIniciais }: { ciclosIniciais: CicloListagem[] }) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleCriarCiclo = async () => {
        const nome = window.prompt('Digite o nome do novo Ciclo (ex: Promoções de Julho/2026):');
        if (!nome || nome.trim() === '') return;

        setIsCreating(true);
        const result = await criarCicloPromocao(nome);

        if (result.success) {
            router.push(`/admin/promocoes/${result.cicloId}`);
        } else {
            alert(result.message);
        }
        setIsCreating(false);
    };

    const handleGerarQuadro = async (cicloId: string) => {
        const confirmacao = confirm('Isto irá varrer a base de dados e criar o Quadro de Acesso. Deseja continuar?');
        if (!confirmacao) return;

        setLoadingId(cicloId);
        const result = await gerarQuadroDeAcesso(cicloId);

        if (result.success) {
            router.push(`/admin/promocoes/${cicloId}`);
        } else {
            alert(result.message);
        }
        setLoadingId(null);
    };

    const handleEncerrar = async (cicloId: string) => {
        const confirmacao = confirm('Tem a certeza que deseja encerrar este ciclo? Não poderá promover mais ninguém através dele.');
        if (!confirmacao) return;

        setLoadingId(`encerrar-${cicloId}`);
        const result = await encerrarCicloPromocao(cicloId);
        if (result.success) {
            router.refresh();
        } else {
            alert(result.message);
        }
        setLoadingId(null);
    };

    const handleApagar = async (cicloId: string) => {
        const confirmacao = confirm('ATENÇÃO: Tem a certeza que deseja apagar este ciclo permanentemente? Todo o quadro de acesso será apagado.');
        if (!confirmacao) return;

        setLoadingId(`apagar-${cicloId}`);
        const result = await apagarCicloPromocao(cicloId);
        if (result.success) {
            router.refresh();
        } else {
            alert(result.message);
        }
        setLoadingId(null);
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <button
                    onClick={handleCriarCiclo}
                    disabled={isCreating}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                    {isCreating ? 'A Criar...' : '+ Novo Ciclo de Promoção'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ciclosIniciais.length === 0 && (
                    <div className="col-span-full p-8 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border">
                        Nenhum ciclo de promoção registado. Clique no botão acima para começar.
                    </div>
                )}

                {ciclosIniciais.map((ciclo) => {
                    const isFechado = ciclo.status === 'FINALIZADO';
                    const temCandidatos = ciclo._count?.candidatos > 0 || 0;
                    const isProcessing = loadingId === ciclo.id || loadingId === `encerrar-${ciclo.id}` || loadingId === `apagar-${ciclo.id}`;

                    return (
                        <div key={ciclo.id} className="bg-card text-card-foreground border border-border rounded-xl shadow-sm p-6 flex flex-col justify-between transition-colors relative group">

                            <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!isFechado && (
                                    <button
                                        onClick={() => handleEncerrar(ciclo.id)}
                                        title="Encerrar Ciclo"
                                        className="p-1.5 text-muted-foreground hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    </button>
                                )}
                                <button
                                    onClick={() => handleApagar(ciclo.id)}
                                    title="Apagar Ciclo"
                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </button>
                            </div>

                            <div>
                                <div className="flex justify-between items-start mb-4 pr-16">
                                    <h2 className="text-xl font-bold line-clamp-2">{ciclo.nome}</h2>
                                </div>

                                <span className={`inline-flex px-2 py-1 mb-4 text-xs font-bold rounded-full ${isFechado
                                        ? 'bg-destructive/10 text-destructive'
                                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                    {isFechado ? 'FECHADO' : 'ABERTO'}
                                </span>

                                <p className="text-sm text-muted-foreground mb-6">
                                    {temCandidatos
                                        ? `${ciclo._count.candidatos} alunos no quadro de aptos.`
                                        : 'Quadro de alunos aptos ainda não gerado.'}
                                </p>
                            </div>

                            <div className="mt-auto">
                                {!temCandidatos && !isFechado ? (
                                    <button
                                        onClick={() => handleGerarQuadro(ciclo.id)}
                                        disabled={isProcessing}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
                                    >
                                        {isProcessing ? 'A processar...' : 'Gerar Quadro de Alunos Aptos'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => router.push(`/admin/promocoes/${ciclo.id}`)}
                                        className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-2 px-4 rounded transition-colors border border-border"
                                    >
                                        Ver Quadro de Acesso
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

