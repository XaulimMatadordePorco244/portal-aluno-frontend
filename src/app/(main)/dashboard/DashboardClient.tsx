"use client";

import { Button } from "@/components/ui/Button"; 
import { ArrowRight, MoreHorizontal, ExternalLink } from "lucide-react";
import { QES, User as PrismaUser, Cargo, Anotacao, TipoDeAnotacao } from '@prisma/client'; 
import Link from 'next/link';


type UserWithCargo = PrismaUser & {
    cargo: Cargo | null;
};

type AnotacaoWithType = Anotacao & {
    tipo: TipoDeAnotacao;
};

const UniversalListItem = ({ title, date, url }: { title: string; date: string, url: string }) => (
    <Link href={url} target="_blank" rel="noopener noreferrer" className="block border-b last:border-b-0 p-3 hover:bg-accent">
        <div className="flex justify-between items-center">
            <div>
                <p className="font-semibold text-foreground text-sm truncate">{title}</p>
                <p className="text-xs text-muted-foreground">{date}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
    </Link>
);

const AnnotationListItem = ({ title, date }: { title: string; date: string }) => (
    <div className="border-b p-3 hover:bg-accent flex justify-between items-center">
        <div>
            <p className="font-semibold text-foreground text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
        </div>
        <Button variant="ghost" size="sm">
            Ver detalhes <MoreHorizontal className="ml-2 h-4 w-4" />
        </Button>
    </div>
);

const RankingListItem = ({ rank, nome, numero, cargo, isCurrentUser }: { rank: number; nome: React.ReactNode; numero: string | null; cargo: string | null; isCurrentUser?: boolean }) => (
    <div className={`border-b p-3 ${isCurrentUser ? 'bg-primary/10' : 'hover:bg-accent'}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className={`font-bold text-lg w-8 text-center ${isCurrentUser ? 'text-primary' : 'text-muted-foreground'}`}>{rank}º</span>
                <div>
                    <p className={`font-semibold ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>{nome}</p>
                    <p className="text-xs text-muted-foreground">{cargo} - Nº {numero || 'N/A'}</p>
                </div>
            </div>
        </div>
    </div>
);

const DashboardCard = ({ title, children, linkText, linkHref = "#" }: { title: string; children: React.ReactNode; linkText: string; linkHref?: string; }) => (
    <div className="bg-card rounded-lg shadow-lg border flex flex-col">
        <h2 className="text-lg font-bold text-center text-primary-foreground bg-primary p-3 rounded-t-lg">{title}</h2>
        <div className="flex-grow flex flex-col">
            <div className="flex-grow">{children}</div>
            <Link href={linkHref} className="p-3 text-sm font-semibold text-primary hover:bg-accent text-center flex items-center justify-center rounded-b-lg">
                {linkText} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </div>
    </div>
);



export default function DashboardClient({ user, qesItems, latestAnnotations }: { user: UserWithCargo, qesItems: QES[], latestAnnotations: AnotacaoWithType[] }) {
    
    const cargoAbreviacao = user.cargo?.abreviacao || '';

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">
                Mural do Aluno - Bem-vindo, {cargoAbreviacao} {user.nomeDeGuerra}!
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard title="Classificação Geral" linkText="Ver classificação completa" linkHref="/classification">
                    <RankingListItem rank={14} nome="Fulano de Tal" numero="2024-010" cargo="Aluno Soldado" />
                    <RankingListItem rank={15} nome={user.nomeDeGuerra || user.nome} numero={user.numero} cargo={user.cargo?.nome || 'N/A'} isCurrentUser={true} />
                    <RankingListItem rank={16} nome="Ciclano da Silva" numero="2024-021" cargo="Aluno Soldado" />
                </DashboardCard>

                <DashboardCard title="QES - Quadro de Estudo Semanal" linkText="Ver todos os QES" linkHref="/qes">
                    {qesItems.length > 0 ? (
                        <div>
                            {qesItems.map(qes => (
                                <UniversalListItem
                                    key={qes.id}
                                    title={qes.titulo}
                                    date={`Publicado em: ${new Date(qes.createdAt).toLocaleDateString('pt-BR')}`}
                                    url={qes.arquivoUrl}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-muted-foreground p-4">Nenhum QES publicado.</p>
                    )}
                </DashboardCard>

                               <DashboardCard title="Informativos" linkText="Ver todos os informativos">
                    <UniversalListItem title="Atualização do Regulamento de Uniformes" date="Publicado em: 03/09/2025" url="#" />
                    <UniversalListItem title="Inscrições para o Desfile de 7 de Setembro" date="Publicado em: 01/09/2025" url="#" />
                </DashboardCard>

                <DashboardCard title="Minhas Escalas" linkText="Ver todas as escalas">
                    <UniversalListItem title="EVENTO: Desfile Cívico" date="07/09/2025 - 08:00h" url="#" />
                    <UniversalListItem title="AULA: Ordem Unida" date="13/09/2025 - 14:00h" url="#" />
                </DashboardCard>

                <DashboardCard title="Comunicações Internas" linkText="Ver todas as comunicações">
                    <UniversalListItem title="CI Nº 12/2025 - Documentos" date="Publicado em: 02/09/2025" url="#" />
                    <UniversalListItem title="CI Nº 11/2025 - Vacinação" date="Publicado em: 28/08/2025" url="#" />
                </DashboardCard>

                <DashboardCard title="Últimas Anotações" linkText="Ver todas as anotações" linkHref="/evaluations">
                    <AnnotationListItem title="Elogio: Apresentação Pessoal" date="Recebido em: 05/09/2025" />
                    <AnnotationListItem title="FO-: Esquecer material" date="Recebido em: 03/09/2025" />
                </DashboardCard>
            </div>
        </div>
    );
}