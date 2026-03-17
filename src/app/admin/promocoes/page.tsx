import Link from 'next/link';
import { History, ShieldAlert, GitMerge } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default async function HistoricoPromocoesPage() {
    // No futuro, aqui farás o fetch do histórico no Prisma
    // const historico = await prisma.historicoPromocao.findMany({...})

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Histórico de Promoções</h1>
                    <p className="text-slate-500 mt-1">
                        Registo de todas as promoções e despromoções da tropa.
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

            {/* Contentor provisório para a Tabela de Histórico */}
            <div className="bg-card border border-border rounded-xl shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-bold text-foreground">Sem registos no momento</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                    A tabela de histórico será renderizada aqui, exibindo o aluno, o cargo anterior, o novo cargo, o motivo e a data da ação.
                </p>
            </div>
        </div>
    );
}