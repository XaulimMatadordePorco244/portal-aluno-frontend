import { getCurrentUserWithRelations, canAccessAdminArea } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Users, AlertTriangle, GraduationCap,
    Megaphone, Medal, Cake,
    ClipboardCheck, Activity, ArrowRight, FileBadge
} from "lucide-react";

async function getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const anoAtual = new Date().getFullYear();
    const mesAtual = today.getMonth();
    const alunosDesatualizadosCount = await prisma.perfilAluno.count({
        where: {
            usuario: {
                status: 'ATIVO',
                role: 'ALUNO'
            },
            OR: [
                { serieEscolar: null },
                {
                    serieEscolar: { not: 'CONCLUIDO' },
                    OR: [
                        { anoLetivoAtualizado: { lt: anoAtual } },
                        { escolaId: null },
                        { turno: null }
                    ]
                }
            ]
        }
    });

    const [
        totalAlunos,
        faltasHoje,
        ciclosAbertos,
        riscoEscolar,
        processosAtivos,
        promocoesPendentes,
        todosUsuarios
    ] = await prisma.$transaction([
        prisma.usuario.count({ where: { role: 'ALUNO', status: 'ATIVO' } }),
        prisma.frequencia.count({ where: { data: { gte: today }, status: 'FALTA' } }),
        prisma.cicloPromocao.count({ where: { status: 'ABERTO' } }),
        prisma.desempenhoEscolar.count({ where: { anoLetivo: anoAtual, qtdNotasVermelhas: { gt: 0 } } }),
        prisma.parte.count({ where: { status: { notIn: ['DEFERIDO', 'INDEFERIDO', 'RASCUNHO'] } } }),
        prisma.candidatoCiclo.count({ where: { resultado: 'PENDENTE' } }),
        prisma.usuario.findMany(
            {
                where: { status: 'ATIVO', dataNascimento: { not: null } },
                select: {
                    id: true, nome: true, fotoUrl: true, dataNascimento: true, nomeDeGuerra: true,
                    perfilAluno: {
                        select: { cargo: { select: { abreviacao: true } } }
                    }
                }
            }
        )
                
    ]);

    const tafsRegistrados = await prisma.tafDesempenho.groupBy({
        by: ['alunoId'],
        where: { anoLetivo: anoAtual }
    });
    const tafsPendentes = Math.max(0, totalAlunos - tafsRegistrados.length);

    const notasRegistradas = await prisma.desempenhoEscolar.count({
        where: { anoLetivo: anoAtual }
    });
    const notasPendentes = Math.max(0, totalAlunos - notasRegistradas);

    const aniversariantesMes = todosUsuarios
        .filter(u => u.dataNascimento?.getMonth() === mesAtual)
        .sort((a, b) => (a.dataNascimento?.getDate() || 0) - (b.dataNascimento?.getDate() || 0));

    return {
        totalAlunos, faltasHoje, ciclosAbertos, riscoEscolar,
        processosAtivos, tafsPendentes, notasPendentes, promocoesPendentes,
        aniversariantesMes: aniversariantesMes.slice(0, 6),
        alunosDesatualizadosCount
    };
}

export default async function AdminDashboardPage() {
    const user = await getCurrentUserWithRelations();
    if (!canAccessAdminArea(user)) redirect('/');

    const stats = await getDashboardStats();
    const nomeMesAtual = format(new Date(), "MMMM", { locale: ptBR });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Painel Operacional</h1>
                    <p className="text-muted-foreground">
                        Resumo administrativo — {format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/comunicacoes/new"><Megaphone className="w-4 h-4 mr-2" /> Publicar CI</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/escalas/new"><ClipboardCheck className="w-4 h-4 mr-2" /> Nova Escala</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/qes/new"><FileBadge className="w-4 h-4 mr-2" /> Publicar QES</Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href="/admin/classificacao-geral"><Medal className="w-4 h-4 mr-2" /> Extrato Classificação</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Processos Ativos</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.processosAtivos}</div>
                        <p className="text-xs text-muted-foreground mt-1">Partes em andamento geral</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Efetivo Faltoso (Hoje)</CardTitle>
                        <Users className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {stats.faltasHoje} <span className="text-sm text-muted-foreground font-normal">/ {stats.totalAlunos}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Ausências confirmadas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Ciclos de Promoção</CardTitle>
                        <GraduationCap className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.ciclosAbertos}</div>
                        <p className="text-xs text-muted-foreground mt-1">Ciclos abertos no sistema</p>
                    </CardContent>
                </Card>

                <Card className={stats.riscoEscolar > 0 ? "border-yellow-500/30 bg-yellow-500/5" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Risco Escolar</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.riscoEscolar}</div>
                        <p className="text-xs text-muted-foreground mt-1">Alunos com notas vermelhas</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                <Card className="lg:col-span-2 flex flex-col border-primary/20 shadow-sm">
                    <CardHeader className="bg-primary/5 rounded-t-lg border-b">
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5 text-primary" />
                            Painel de Pendências Ativas
                        </CardTitle>
                        <CardDescription>Ações requeridas que demandam sua atenção ou preenchimento.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <div className="divide-y">

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold flex items-center gap-2">
                                        Testes de Aptidão Física (TAF)
                                        {stats.tafsPendentes > 0 && <Badge variant="destructive" className="h-5 px-1.5">{stats.tafsPendentes}</Badge>}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Alunos sem registro de TAF cadastrado para o ano letivo atual.
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="mt-2 sm:mt-0 text-primary shrink-0">
                                    <Link href="/admin/taf">Ver todos <ArrowRight className="w-4 h-4 ml-2" /></Link>
                                </Button>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold flex items-center gap-2">
                                        Desempenho Escolar (Boletins)
                                        {stats.notasPendentes > 0 && <Badge variant="destructive" className="h-5 px-1.5">{stats.notasPendentes}</Badge>}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Alunos sem boletim iniciado no ano letivo atual.
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="mt-2 sm:mt-0 text-primary shrink-0">
                                    <Link href="/admin/desempenho">Ver todos <ArrowRight className="w-4 h-4 ml-2" /></Link>
                                </Button>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold flex items-center gap-2">
                                        Atualização de Dados Escolares
                                        {stats.alunosDesatualizadosCount > 0 && (
                                            <Badge variant="destructive" className="h-5 px-1.5">
                                                {stats.alunosDesatualizadosCount}
                                            </Badge>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Alunos com dados escolares pendentes ou referentes a anos anteriores.
                                    </p>
                                </div>

                                <Button variant="ghost" size="sm" asChild className="mt-2 sm:mt-0 text-primary shrink-0">
                                    <Link href="/admin/dados-escolares">
                                        Ver todos <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold flex items-center gap-2">
                                        Aprovações de Promoção
                                        {stats.promocoesPendentes > 0 && <Badge variant="destructive" className="h-5 px-1.5">{stats.promocoesPendentes}</Badge>}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Candidatos com status pendente de aprovação nos ciclos abertos.
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="mt-2 sm:mt-0 text-primary shrink-0">
                                    <Link href="/admin/promocoes">Ver todos <ArrowRight className="w-4 h-4 ml-2" /></Link>
                                </Button>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold flex items-center gap-2">
                                        Partes e Processos
                                        {stats.processosAtivos > 0 && <Badge variant="secondary" className="h-5 px-1.5">{stats.processosAtivos}</Badge>}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Documentos que ainda não foram finalizados (deferidos/indeferidos).
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="mt-2 sm:mt-0 text-primary shrink-0">
                                    <Link href="/admin/partes">Ver todos <ArrowRight className="w-4 h-4 ml-2" /></Link>
                                </Button>
                            </div>

                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Cake className="w-5 h-5 text-orange-500" />
                            Aniversariantes
                        </CardTitle>
                        <CardDescription className="capitalize">
                            Nascidos no mês de {nomeMesAtual}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {stats.aniversariantesMes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center h-40 opacity-50">
                                <Cake className="w-10 h-10 mb-2 text-muted-foreground" />
                                <p className="text-sm">Nenhum aniversariante<br />este mês.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {stats.aniversariantesMes.map((usuario) => {
                                    const dia = usuario.dataNascimento ? format(usuario.dataNascimento, "dd") : "--";
                                    const nomeGuerra = usuario.nomeDeGuerra || usuario.nome.split(' ')[0];
                                    const cargo = usuario.perfilAluno?.cargo?.abreviacao || '';

                                    return (
                                        <div key={usuario.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border shadow-sm group-hover:scale-105 transition-transform">
                                                    <AvatarImage src={usuario.fotoUrl || undefined} />
                                                    <AvatarFallback>{usuario.nome.substring(0, 2)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        {cargo} {nomeGuerra}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                                                        {usuario.nome}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30">
                                                Dia {dia}
                                            </Badge>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="pt-2 border-t">
                        <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                            <Link href="/admin/alunos">Ver cadastro completo <ArrowRight className="ml-2 w-3 h-3" /></Link>
                        </Button>
                    </CardFooter>
                </Card>

            </div>
        </div>
    );
}