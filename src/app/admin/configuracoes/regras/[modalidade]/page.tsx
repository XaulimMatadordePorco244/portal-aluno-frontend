import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { 
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import RegrasPromocaoForm from '@/components/admin/configuracoes/RegrasPromocaoForm';
import { Clock, GraduationCap, Star, AlertTriangle } from 'lucide-react';

const MAPA_MODALIDADES: Record<string, { titulo: string, dbKey: string, icon: any, desc: string }> = {
    'antiguidade': {
        titulo: 'Promoção por Antiguidade',
        dbKey: 'ANTIGUIDADE',
        icon: Clock,
        desc: 'Regras baseadas em tempo de serviço e comportamento (Conceito).'
    },
    'merito-escolar': {
        titulo: 'Promoção por Mérito Escolar',
        dbKey: 'MERITO_ESCOLAR',
        icon: GraduationCap,
        desc: 'Regras baseadas no boletim da escola regular e TAF.'
    },
    'honra-ao-merito': {
        titulo: 'Promoção por Honra ao Mérito',
        dbKey: 'HONRA_AO_MERITO',
        icon: Star,
        desc: 'Regras para alunos destaque geral.'
    }
};

export async function generateMetadata({ params }: { params: Promise<{ modalidade: string }> }): Promise<Metadata> {
    const { modalidade } = await params;
    const info = MAPA_MODALIDADES[modalidade];
    return {
        title: info ? `Configurar ${info.titulo}` : 'Configuração',
    };
}

export default async function RegrasModalidadePage({ 
    params 
}: { 
    params: Promise<{ modalidade: string }> 
}) {
    const { modalidade } = await params;
    const user = await getCurrentUserWithRelations();

    if (!user || !canAccessAdminArea(user)) redirect('/dashboard');
    
    const info = MAPA_MODALIDADES[modalidade];
    if (!info) notFound(); 

    const Icon = info.icon;

    const cargos = await prisma.cargo.findMany({
        orderBy: { precedencia: 'asc' },
        where: { tipo: { not: 'CURSO' } }
    });

    const regrasSalvas = await prisma.regraPromocao.findMany({
        where: { modalidade: info.dbKey }
    });

    return (
        <div className="container mx-auto py-8 space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/admin/configuracoes">Configurações</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{info.titulo}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-start gap-4 border-b pb-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{info.titulo}</h1>
                    <p className="text-muted-foreground text-lg">{info.desc}</p>
                </div>
            </div>

            {modalidade === 'merito-escolar' && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-md flex gap-3 text-sm text-amber-800 dark:text-amber-200">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p>Lembrete do Regulamento: Para Mérito Escolar, além da média, o aluno não pode possuir nota vermelha (abaixo de 6.0) em nenhuma disciplina isolada.</p>
                </div>
            )}

            <div className="bg-card border rounded-lg p-6">
                <RegrasPromocaoForm 
                    cargos={cargos}
                    regrasIniciais={regrasSalvas}
                    modalidadeKey={info.dbKey}
                />
            </div>
        </div>
    );
}