import Link from 'next/link';
import { History, ShieldAlert, GitMerge } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import prisma from '@/lib/prisma'; // Certifique-se de que o caminho do seu prisma está correto

export default async function HistoricoPromocoesPage() {
    // Busca o histórico ordenado dos mais recentes para os mais antigos
    const historico = await prisma.cargoHistory.findMany({
        orderBy: {
            dataInicio: 'desc'
        },
        include: {
            cargo: true, // Para pegar a abreviação/nome do cargo
            aluno: {
                include: {
                    usuario: true // Para pegar o nome/nomeDeGuerra do aluno
                }
            }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Histórico de Promoções</h1>
                    <p className="text-slate-500 mt-1">
                        Registo de todas as promoções, reclassificações e inserções da tropa.
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" asChild>
                        <Link href="/admin/promocoes/ciclos">
                            <GitMerge className="mr-2 h-4 w-4" />
                            Ciclos de Promoção
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/promocoes/manual">
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Ação Manual (Exceções)
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Verificação se o histórico está vazio */}
            {historico.length === 0 ? (
                <div className="bg-card border border-border rounded-xl shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-bold text-foreground">Sem registos no momento</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        Nenhuma movimentação de cargo foi registrada no sistema até o momento.
                    </p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Data</th>
                                    <th className="px-6 py-4 font-semibold">Aluno</th>
                                    <th className="px-6 py-4 font-semibold">Novo Cargo</th>
                                    <th className="px-6 py-4 font-semibold">Modalidade</th>
                                    <th className="px-6 py-4 font-semibold">Motivo</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {historico.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                        {/* Data de Início formatada para o padrão BR */}
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                            {new Date(item.dataInicio).toLocaleDateString('pt-BR')}
                                        </td>
                                        
                                        {/* Nome do Aluno */}
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {item.aluno.usuario.nomeDeGuerra || item.aluno.usuario.nome}
                                        </td>
                                        
                                        {/* Cargo Assumido */}
                                        <td className="px-6 py-4">
                                            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md font-semibold text-xs border border-primary/20">
                                                {item.cargo.abreviacao}
                                            </span>
                                        </td>
                                        
                                        {/* Tipo de Promoção */}
                                        <td className="px-6 py-4">
                                            {item.tipoPromocao.replace('_', ' ')}
                                        </td>
                                        
                                        {/* Motivo com Tooltip para textos longos */}
                                        <td className="px-6 py-4 max-w-[200px] truncate text-muted-foreground" title={item.motivo || "Não informado"}>
                                            {item.motivo || "-"}
                                        </td>
                                        
                                        {/* Status do Bloco de Histórico */}
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                                item.status === 'ATIVO' 
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' 
                                                    : item.status === 'FECHADO' 
                                                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700' 
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}