"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { QES, Anotacao, TipoDeAnotacao } from '@prisma/client';
import Link from 'next/link';
import { UserWithRelations } from "@/lib/auth";

type AnotacaoWithType = Anotacao & {
    tipo: TipoDeAnotacao;
};

type RankingDataItem = {
    id: string;
    nomeDeGuerra: string | null;
    nome: string;
    conceito: string | null;
    rank: number;
    numero: string | null;
    cargo: { nome: string | null; abreviacao: string | null; } | null;
}

const UniversalListItem = ({ title, date, url }: { title: string; date: string, url: string }) => (<Link href={url} target="_blank" rel="noopener noreferrer" className="block border-b last:border-b-0 p-3 hover:bg-accent"><div className="flex justify-between items-center"><div><p className="font-semibold text-foreground text-sm truncate">{title}</p><p className="text-xs text-muted-foreground">{date}</p></div><ExternalLink className="h-4 w-4 text-muted-foreground" /></div></Link>);
const AnnotationListItem = ({ title, date }: { title: string; date: string }) => (<div className="border-b last:border-b-0 p-3 hover:bg-accent flex justify-between items-center"><div><p className="font-semibold text-foreground text-sm">{title}</p><p className="text-xs text-muted-foreground">{date}</p></div><Button variant="ghost" size="sm" disabled>Ver detalhes</Button></div>);
const DashboardCard = ({ title, children, linkText, linkHref = "#" }: { title: string; children: React.ReactNode; linkText: string; linkHref?: string; }) => (<div className="bg-card rounded-lg shadow-lg border flex flex-col"><h2 className="text-lg font-bold text-center text-primary-foreground bg-primary p-3 rounded-t-lg">{title}</h2><div className="flex-grow flex flex-col"><div className="flex-grow">{children}</div><Link href={linkHref} className="p-3 text-sm font-semibold text-primary hover:bg-accent text-center flex items-center justify-center rounded-b-lg">{linkText} <ArrowRight className="ml-2 h-4 w-4" /></Link></div></div>);

const RankingListItem = ({ rank, nome, conceito, numero, cargo, isCurrentUser }: { rank: number; nome: React.ReactNode; conceito: string | null; numero: string | null; cargo: string | null; isCurrentUser?: boolean }) => (
    <div className={`border-b last:border-b-0 p-3 ${isCurrentUser ? 'bg-primary/10' : 'hover:bg-accent'}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className={`font-bold text-lg w-8 text-center ${isCurrentUser ? 'text-primary' : 'text-muted-foreground'}`}>{rank}º</span>
                <div>
                    <p className={`font-semibold ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>{cargo} {nome}</p>
                    <p className="text-xs text-muted-foreground">Nº {numero || 'N/A'}</p>
                </div>
            </div>
            {isCurrentUser && (
                <div className="text-right">
                    <p className="font-bold text-primary">{conceito}</p>
                    <p className="text-xs text-muted-foreground">Conceito</p>
                </div>
            )}
        </div>
    </div>
);


export default function DashboardClient({
    user,
    qesItems,
    latestAnnotations,
    rankingData
}: {
    user: UserWithRelations,
    qesItems: QES[],
    latestAnnotations: AnotacaoWithType[],
    rankingData: RankingDataItem[]
}) {
    const cargoAbreviacao = user.cargo?.abreviacao || '';

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">
                Mural do Aluno - Bem-vindo, {cargoAbreviacao} {user.nomeDeGuerra}!
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <DashboardCard title="Classificação Geral" linkText="Ver classificação completa" linkHref="/classification">
                    {rankingData.length > 0 ? (
                        rankingData.map(aluno => (
                            <RankingListItem
                                key={aluno.id}
                                rank={aluno.rank}
                                nome={aluno.nomeDeGuerra || aluno.nome}
                                conceito={aluno.conceito}
                                numero={aluno.numero}
                                cargo={aluno.cargo?.abreviacao || 'S/ Cargo'}
                                isCurrentUser={aluno.id === user.id}
                            />
                        ))
                    ) : (
                        <p className="text-center text-sm text-muted-foreground p-4">Não há dados de classificação para seu cargo.</p>
                    )}
                </DashboardCard>

                <DashboardCard title="QES - Quadro de Estudo Semanal" linkText="Ver todos os QES" linkHref="/qes">
                    {qesItems.length > 0 ? (
                        <div>{qesItems.map(qes => (<UniversalListItem key={qes.id} title={qes.titulo} date={`Publicado em: ${new Date(qes.createdAt).toLocaleDateString('pt-BR')}`} url={qes.arquivoUrl} />))}</div>
                    ) : (<p className="text-center text-sm text-muted-foreground p-4">Nenhum QES publicado.</p>)}
                </DashboardCard>

                <DashboardCard title="Últimas Anotações" linkText="Ver todas as anotações" linkHref="/anotacoes">
                    {latestAnnotations.length > 0 ? (
                        <div>
                            {latestAnnotations.map(anotacao => (
                                <AnnotationListItem
                                    key={anotacao.id}
                                    title={anotacao.tipo.titulo}
                                    date={`Recebido em: ${new Date(anotacao.data).toLocaleDateString('pt-BR')}`}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-muted-foreground p-4">Nenhuma anotação recente.</p>
                    )}
                </DashboardCard>

                <DashboardCard title="Informativos" linkText="Ver todos os informativos"><UniversalListItem title="Atualização do Regulamento de Uniformes" date="Publicado em: 03/09/2025" url="#" /></DashboardCard>
                <DashboardCard title="Minhas Escalas" linkText="Ver todas as escalas" linkHref="/escalas"><UniversalListItem title="EVENTO: Desfile Cívico" date="07/09/2025 - 08:00h" url="#" /></DashboardCard>
                <DashboardCard title="Comunicações Internas" linkText="Ver todas as comunicações"><UniversalListItem title="CI Nº 12/2025 - Documentos" date="Publicado em: 02/09/2025" url="#" /></DashboardCard>
            </div>
        </div>
    );
}