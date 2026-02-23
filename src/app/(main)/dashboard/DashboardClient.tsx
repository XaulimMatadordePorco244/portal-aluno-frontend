"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, ExternalLink, FileText } from "lucide-react";
import { QES, Anotacao, TipoDeAnotacao, ComunicacaoInterna, Informativo, Escala } from '@prisma/client';
import Link from 'next/link';
import { UserWithRelations } from "@/lib/auth";

type AnotacaoWithType = Anotacao & {
  tipo: TipoDeAnotacao;
};

type RankingDataItem = {
  id: string;
  nomeDeGuerra: string | null | undefined;
  nome: string;
  conceitoAtual: string | null | undefined;
  rank: number;
  numero: string | null | undefined;
  cargo: { nome: string | null; abreviacao: string | null; } | null | undefined;
}

const UniversalListItem = ({ title, date, url }: { title: string; date: string, url: string }) => (
  <Link href={url} target="_blank" rel="noopener noreferrer" className="block border-b last:border-b-0 p-3 hover:bg-accent transition-colors">
    <div className="flex justify-between items-center gap-2">
      <div className="overflow-hidden">
        <p className="font-semibold text-foreground text-sm truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  </Link>
);

const AnnotationListItem = ({ title, date }: { title: string; date: string }) => (
  <div className="border-b last:border-b-0 p-3 hover:bg-accent flex justify-between items-center gap-2">
    <div className="overflow-hidden">
      <p className="font-semibold text-foreground text-sm truncate">{title}</p>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
    <Button variant="ghost" size="sm" className="shrink-0" disabled>Ver detalhes</Button>
  </div>
);

const DashboardCard = ({ title, children, linkText, linkHref = "#" }: { title: string; children: React.ReactNode; linkText: string; linkHref?: string; }) => (
  <div className="bg-card rounded-lg shadow-lg border flex flex-col h-full">
    <h2 className="text-lg font-bold text-center text-primary-foreground bg-primary p-3 rounded-t-lg shrink-0">
      {title}
    </h2>
    <div className="flex flex-col flex-1 min-h-[150px]">
      <div className="flex-1 w-full">
        {children}
      </div>
      <Link 
        href={linkHref} 
        className="p-3 mt-auto text-sm font-semibold text-primary hover:bg-accent text-center flex items-center justify-center rounded-b-lg border-t shrink-0 transition-colors"
      >
        {linkText} <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  </div>
);

const RankingListItem = ({ 
  rank, 
  nome, 
  conceito, 
  numero, 
  cargo, 
  isCurrentUser, 
  canViewGrade 
}: { 
  rank: number; 
  nome: React.ReactNode; 
  conceito: string | null | undefined; 
  numero: string | null | undefined; 
  cargo: string | null | undefined; 
  isCurrentUser?: boolean;
  canViewGrade?: boolean;
}) => (
  <div className={`border-b last:border-b-0 p-3 ${isCurrentUser ? 'bg-primary/10' : 'hover:bg-accent transition-colors'}`}>
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-3 overflow-hidden">
        <span className={`font-bold text-lg w-8 text-center shrink-0 ${isCurrentUser ? 'text-primary' : 'text-muted-foreground'}`}>{rank}º</span>
        <div className="overflow-hidden">
          <p className={`font-semibold truncate ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>{cargo} {nome}</p>
          <p className="text-xs text-muted-foreground">Nº {numero || 'N/A'}</p>
        </div>
      </div>
      {canViewGrade && (
        <div className="text-right shrink-0">
          <p className="font-bold text-primary font-mono">{conceito || '—'}</p>
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
  rankingData,
  latestCIs,
  latestInformativos,
  minhasEscalas
}: {
  user: UserWithRelations,
  qesItems: QES[],
  latestAnnotations: AnotacaoWithType[],
  rankingData: RankingDataItem[],
  latestCIs: ComunicacaoInterna[],
  latestInformativos: Informativo[],
  minhasEscalas: Escala[]
}) {
  const perfil = user.perfilAluno;
  const cargoAbreviacao = perfil?.cargo?.abreviacao || 'Usuário';
  const nomeExibicao = perfil?.nomeDeGuerra || user.nome;
  const currentUserCargoName = perfil?.cargo?.nome;

  return (
    <div >
      <h1 className="text-xl md:text-3xl font-bold text-foreground mb-6 wrap-break-words">
        Mural do Aluno - Bem-vindo, {cargoAbreviacao} {nomeExibicao}!
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">

        <DashboardCard title="Classificação Geral" linkText="Ver classificação completa" linkHref="/classification">
          {rankingData.length > 0 ? (
            rankingData.map(aluno => {
                const isCurrentUser = aluno.id === user.id;
                const isSameCargo = !!currentUserCargoName && aluno.cargo?.nome === currentUserCargoName;
                const canViewGrade = isCurrentUser || isSameCargo;

                let conceitoFormatado = aluno.conceitoAtual;
                
                if (aluno.conceitoAtual) {
                    const valorNumerico = parseFloat(String(aluno.conceitoAtual));
                    if (!isNaN(valorNumerico)) {
                        conceitoFormatado = valorNumerico.toFixed(2).replace('.', ',');
                    }
                }

                return (
                  <RankingListItem
                    key={aluno.id}
                    rank={aluno.rank}
                    nome={aluno.nomeDeGuerra || aluno.nome}
                    conceito={conceitoFormatado} 
                    numero={aluno.numero}
                    cargo={aluno.cargo?.abreviacao || 'S/ Cargo'}
                    isCurrentUser={isCurrentUser}
                    canViewGrade={canViewGrade}
                  />
                );
            })
          ) : (
            <div className="flex items-center justify-center h-full p-4 min-h-[100px]">
                <p className="text-center text-sm text-muted-foreground">Não há dados de classificação para seu cargo.</p>
            </div>
          )}
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
             <div className="flex items-center justify-center h-full p-4 min-h-[100px]">
                <p className="text-center text-sm text-muted-foreground">Nenhum QES publicado.</p>
             </div>
          )}
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
             <div className="flex items-center justify-center h-full p-4 min-h-[100px]">
                <p className="text-center text-sm text-muted-foreground">Nenhuma anotação recente.</p>
             </div>
          )}
        </DashboardCard>

        <DashboardCard
          title="Informativos"
          linkText="Ver todos os informativos"
          linkHref="/informativos"
        >
          {latestInformativos.length > 0 ? (
            <div>
              {latestInformativos.map(info => (
                <UniversalListItem
                  key={info.id}
                  title={info.titulo}
                  date={`Publicado em: ${new Date(info.dataPublicacao).toLocaleDateString('pt-BR')}`}
                  url={info.arquivoUrl || "/informativos"}
                />
              ))}
            </div>
          ) : (
             <div className="flex items-center justify-center h-full p-4 min-h-[100px]">
                <p className="text-center text-sm text-muted-foreground">Nenhum informativo recente.</p>
             </div>
          )}
        </DashboardCard>

        <DashboardCard
          title="Minhas Escalas"
          linkText="Ver todas as escalas"
          linkHref="/escalas?filtro=minhas"
        >
          {minhasEscalas.length > 0 ? (
            <div>
              {minhasEscalas.map((escala) => (
                <UniversalListItem
                  key={escala.id}
                  title={`Escala: ${escala.tipo}`}
                  date={`Data: ${new Date(escala.dataEscala).toLocaleDateString('pt-BR')}`}
                  url={escala.pdfUrl || "#"}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center min-h-[100px]">
              <p className="text-sm text-muted-foreground">
                Você não está escalado em nenhuma escala recente.
              </p>
            </div>
          )}
        </DashboardCard>

        <DashboardCard 
          title="Comunicações Internas" 
          linkText="Ver todas as comunicações" 
          linkHref="/comunicacoes-internas"
        >
          {latestCIs.length > 0 ? (
            <div>
              {latestCIs.map((ci) => (
                <UniversalListItem
                  key={ci.id}
                  title={`CI ${String(ci.numeroSequencial).padStart(3, '0')}/${ci.anoReferencia} - ${ci.titulo}`}
                  date={`Publicado em: ${new Date(ci.dataPublicacao).toLocaleDateString('pt-BR')}`}
                  url={ci.arquivoUrl}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center min-h-[100px]">
              <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma comunicação publicada este ano.</p>
            </div>
          )}
        </DashboardCard>

      </div>
    </div>
  );
}