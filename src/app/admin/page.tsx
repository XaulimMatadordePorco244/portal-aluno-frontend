import { getCurrentUserWithRelations, canAccessAdminArea } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSearch, Users } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/Button";

async function getDashboardStats() {
    const [partesPendentes, totalAlunos] = await prisma.$transaction([
        prisma.parte.count({ where: { status: 'ENVIADA' } }),
        prisma.user.count({ where: { role: 'ALUNO' } }),
    ]);
    return { partesPendentes, totalAlunos };
}

export default async function AdminDashboardPage() {
    const user = await getCurrentUserWithRelations();

    if (!canAccessAdminArea(user)) {
        redirect('/');
    }

    const stats = await getDashboardStats();

    
    const displayName = user
        ? (user.role === 'ADMIN' ? user.nome : (user.nomeDeGuerra || user.nome))
        : '';

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Administrativo</h1>
            <p className="text-muted-foreground mb-8">
                   Bem-vindo(a), {displayName}. Aqui está um resumo do sistema.
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Processos Pendentes</CardTitle>
                        <FileSearch className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.partesPendentes}</div>
                        <p className="text-xs text-muted-foreground">
                            Aguardando sua análise.
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalAlunos}</div>
                        <p className="text-xs text-muted-foreground">
                            Alunos ativos no sistema.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                 <h2 className="text-2xl font-bold mb-4">Ações Rápidas</h2>
                 <div className="flex gap-4">
                    <Link href="/admin/partes">
                        <Button>Ver Processos Pendentes</Button>
                    </Link>
                 </div>
            </div>
        </div>
    );
}