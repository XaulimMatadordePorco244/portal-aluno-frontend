import { getCurrentUserWithRelations, canAccessAdminArea } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileSearch, Users, Activity, AlertTriangle, BrainCircuit, TrendingUp, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

async function getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
        partesPendentes,
        totalAlunos,
        ocorrenciasHoje,
        ultimasAnotacoes,
        ultimasPunicoes
    ] = await prisma.$transaction([
        // 1. Contagem de Partes
        prisma.parte.count({ where: { status: 'AGUARDANDO_COORDENACAO' } }),
        
        // 2. Total de Alunos Ativos
        prisma.usuario.count({ where: { role: 'ALUNO', status: 'ATIVO' } }),
        
        // 3. Ocorrências Hoje
        prisma.anotacao.count({ 
            where: { 
                createdAt: { gte: today } 
            } 
        }),

        // 4. Feed: Últimas 5 anotações gerais
        prisma.anotacao.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                tipo: true,
                autor: { 
                    include: { 
                        perfilAluno: { include: { cargo: true } } 
                    } 
                },
                aluno: { // Relação: Anotacao -> PerfilAluno
                    include: { 
                        usuario: true, 
                        cargo: true 
                    } 
                }  
            }
        }),

        // 5. Substituindo "Conceito" (que não existe no banco) por "Últimas Punições"
        prisma.anotacao.findMany({
            take: 5,
            where: { pontos: { lt: 0 } }, // Apenas anotações negativas
            orderBy: { createdAt: 'desc' },
            include: {
                tipo: true,
                aluno: { 
                    include: { 
                        usuario: true, 
                        cargo: true 
                    } 
                }
            }
        })
    ]);

    return { partesPendentes, totalAlunos, ocorrenciasHoje, ultimasAnotacoes, ultimasPunicoes };
}

// Helper seguro para formatar nome
const formatarNomeGuerra = (perfil: any, nomeUsuario: string) => {
    if (perfil?.cargo?.abreviacao && perfil?.nomeDeGuerra) {
        return `${perfil.cargo.abreviacao} ${perfil.nomeDeGuerra}`;
    }
    return nomeUsuario.split(' ')[0];
};

export default async function AdminDashboardPage() {
    const user = await getCurrentUserWithRelations();

    if (!canAccessAdminArea(user)) {
        redirect('/');
    }

    const stats = await getDashboardStats();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Visão geral do dia {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/anotacoes/new">
                        <Button>Lançar Ocorrência</Button>
                    </Link>
                </div>
            </div>

            {/* KPIs - Indicadores Superiores */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Partes Pendentes</CardTitle>
                        <FileSearch className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.partesPendentes}</div>
                        <p className="text-xs text-muted-foreground">Requerem sua análise</p>
                        {stats.partesPendentes > 0 && (
                             <Link href="/admin/partes" className="text-xs text-primary hover:underline mt-1 block">Resolver agora &rarr;</Link>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ocorrências Hoje</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.ocorrenciasHoje}</div>
                        <p className="text-xs text-muted-foreground">Registros nas últimas 24h</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Efetivo de Alunos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalAlunos}</div>
                        <p className="text-xs text-muted-foreground">Alunos ativos no sistema</p>
                    </CardContent>
                </Card>

                <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-primary">Status do Sistema</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-bold text-primary">Operacional</div>
                        <p className="text-xs text-muted-foreground">Todas as funções ativas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Grid Principal - Feed e Riscos */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                
                {/* Coluna Esquerda: Feed de Ocorrências (Maior) */}
                <Card className="lg:col-span-4 h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Últimas Ocorrências</CardTitle>
                        <CardDescription>Movimentações recentes registradas no batalhão.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-6">
                            {stats.ultimasAnotacoes.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma ocorrência registrada recentemente.</p>
                            ) : (
                                stats.ultimasAnotacoes.map((anotacao) => (
                                    <div key={anotacao.id} className="flex items-start gap-4">
                                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${Number(anotacao.pontos) >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <div className="space-y-1 w-full">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-medium leading-none">
                                                    {anotacao.tipo.titulo}
                                                </p>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                    {format(new Date(anotacao.createdAt), "HH:mm")}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {formatarNomeGuerra(anotacao.aluno, anotacao.aluno?.usuario?.nome || 'Aluno')}
                                            </p>
                                            <div className="flex items-center gap-2 pt-1">
                                                <Badge variant={Number(anotacao.pontos) >= 0 ? "secondary" : "destructive"} className="text-[10px] h-5 px-1.5">
                                                    {Number(anotacao.pontos) > 0 ? '+' : ''}{Number(anotacao.pontos)} pts
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground">
                                                    por {formatarNomeGuerra(anotacao.autor?.perfilAluno, anotacao.autor.nome)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Coluna Direita: Últimas Punições (Menor) */}
                <Card className="lg:col-span-3 h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Punições Recentes
                        </CardTitle>
                        <CardDescription>
                            Últimas infrações registradas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.ultimasPunicoes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                                    <TrendingUp className="h-8 w-8 mb-2 opacity-20" />
                                    <p className="text-sm">Tudo tranquilo por enquanto.</p>
                                </div>
                            ) : (
                                stats.ultimasPunicoes.map((anotacao) => (
                                    <Link href={`/admin/alunos/${anotacao.aluno.id}`} key={anotacao.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                                                    {anotacao.aluno.nomeDeGuerra?.substring(0, 2) || "AL"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="grid gap-0.5">
                                                <p className="text-sm font-medium leading-none">
                                                    {anotacao.aluno.cargo?.abreviacao} {anotacao.aluno.nomeDeGuerra}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {anotacao.tipo.titulo}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="font-bold text-sm text-red-600 dark:text-red-400">
                                            {Number(anotacao.pontos)}
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                        {stats.ultimasPunicoes.length > 0 && (
                            <div className="mt-4 pt-4 border-t text-center">
                                <Link href="/admin/classificacao-geral" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                    Ver classificação completa &rarr;
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Seção "Em Breve" - Inteligência do Sistema */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 opacity-80">
                    <BrainCircuit className="h-5 w-5" /> Inteligência do Sistema (Em Breve)
                </h2>
                <div className="grid gap-4 md:grid-cols-3 opacity-60 pointer-events-none select-none grayscale-[0.5]">
                    {/* Card Fake 1 */}
                    <Card className="border-dashed bg-muted/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                                Promoções
                                <Clock className="h-4 w-4" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3 Alunos</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Cumprem requisitos para promoção de cargo.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card Fake 2 */}
                    <Card className="border-dashed bg-muted/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                                Pendências TAF
                                <AlertCircle className="h-4 w-4" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12 Pendentes</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Notas de Teste Físico não lançadas no prazo.
                            </p>
                        </CardContent>
                    </Card>

                     {/* Card Fake 3 */}
                     <Card className="border-dashed bg-muted/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                                Padrões Detectados
                                <BrainCircuit className="h-4 w-4" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-semibold">Atrasos Recorrentes</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                5 alunos apresentaram atrasos &gt;3x na semana.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}