
"use client";

import { Button } from "@/components/ui/Button"; 
import { ArrowRight, Download, Eye, MoreHorizontal } from "lucide-react";


interface User {
  nome: string;
  cargo: string;

}


const UniversalListItem = ({ title, date }: { title: string; date: string }) => (
    <div className="border-b p-3 hover:bg-gray-50 flex justify-between items-center">
        <div>
            <p className="font-semibold text-gray-800 text-sm">{title}</p>
            <p className="text-xs text-gray-500">{date}</p>
        </div>
        <div className="flex gap-1">
            <Button variant="ghost" size="icon" aria-label="Visualizar"><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" aria-label="Baixar"><Download className="h-4 w-4" /></Button>
        </div>
    </div>
);

const AnnotationListItem = ({ title, date }: { title: string; date: string }) => (
    <div className="border-b p-3 hover:bg-gray-50 flex justify-between items-center">
        <div>
            <p className="font-semibold text-gray-800 text-sm">{title}</p>
            <p className="text-xs text-gray-500">{date}</p>
        </div>
        <Button variant="ghost" size="sm">
            Ver detalhes <MoreHorizontal className="ml-2 h-4 w-4" />
        </Button>
    </div>
);

const RankingListItem = ({ rank, nome, numero, cargo, isCurrentUser }: { rank: number; nome: string; numero: string; cargo: string; isCurrentUser?: boolean }) => (
    <div className={`border-b p-3 ${isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className={`font-bold text-lg w-8 text-center ${isCurrentUser ? 'text-blue-700' : 'text-gray-600'}`}>
                    {rank}º
                </span>
                <div>
                    <p className={`font-semibold ${isCurrentUser ? 'text-blue-800' : 'text-gray-800'}`}>{nome}</p>
                    <p className="text-xs text-gray-500">{cargo} - Nº {numero}</p>
                </div>
            </div>
        </div>
    </div>
);

const DashboardCard = ({ title, children, linkText, linkHref = "#" }: { title: string; children: React.ReactNode; linkText: string; linkHref?: string; }) => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
        <h2 className="text-lg font-bold text-center text-white bg-slate-700 p-3 rounded-t-lg">
            {title}
        </h2>
        <div className="flex-grow flex flex-col">
            <div className="flex-grow">
                {children}
            </div>
            <a href={linkHref} className="p-3 text-sm font-semibold text-blue-600 hover:bg-gray-100 text-center flex items-center justify-center rounded-b-lg">
                {linkText} <ArrowRight className="ml-2 h-4 w-4"/>
            </a>
        </div>
    </div>
);


//
export default function DashboardClient({ user }: { user: User }) {

  const alunoAtual = { rank: 15, nome: user.nome, numero: "2024-015", cargo: user.cargo };

  return (
    <div className="container mx-auto py-8">
      {}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Mural do Aluno - Bem-vindo, {user.cargo} {user.nome}!
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <DashboardCard title="Classificação Geral" linkText="Ver classificação completa" linkHref="classification">
            <RankingListItem rank={alunoAtual.rank - 1} nome="Fulano de Tal" numero="2024-010" cargo="Aluno Soldado" />
            <RankingListItem rank={alunoAtual.rank} nome={alunoAtual.nome} numero={alunoAtual.numero} cargo={alunoAtual.cargo} isCurrentUser={true} />
            <RankingListItem rank={alunoAtual.rank + 1} nome="Ciclano da Silva" numero="2024-021" cargo="Aluno Soldado" />
        </DashboardCard>

        {}
        <DashboardCard title="QES - Quadro de Estudo Semanal" linkText="Ver todos os QES">
            <UniversalListItem title="QES - 09/09 a 15/09" date="Publicado em: 08/09/2025" />
            <UniversalListItem title="QES - 02/09 a 08/09" date="Publicado em: 01/09/2025" />
            <UniversalListItem title="QES - 26/08 a 01/09" date="Publicado em: 25/08/2025" />
        </DashboardCard>

        <DashboardCard title="Informativos" linkText="Ver todos os informativos">
            <UniversalListItem title="Atualização do Regulamento de Uniformes" date="Publicado em: 03/09/2025" />
            <UniversalListItem title="Inscrições para o Desfile de 7 de Setembro" date="Publicado em: 01/09/2025" />
            <UniversalListItem title="Alteração de Horário - Aula de Sábado" date="Publicado em: 30/08/2025" />
        </DashboardCard>
        
        <DashboardCard title="Minhas Escalas" linkText="Ver todas as escalas">
            <UniversalListItem title="EVENTO: Desfile Cívico" date="07/09/2025 - 08:00h" />
            <UniversalListItem title="AULA: Ordem Unida" date="13/09/2025 - 14:00h" />
            <UniversalListItem title="SERVIÇO: Guarda do Quartel" date="14/09/2025 - 07:00h" />
        </DashboardCard>

        <DashboardCard title="Comunicações Internas" linkText="Ver todas as comunicações">
            <UniversalListItem title="CI Nº 12/2025 - Documentos" date="Publicado em: 02/09/2025" />
            <UniversalListItem title="CI Nº 11/2025 - Vacinação" date="Publicado em: 28/08/2025" />
            <UniversalListItem title="CI Nº 10/2025 - Convocação" date="Publicado em: 20/08/2025" />
        </DashboardCard>
        
        <DashboardCard title="Últimas Anotações" linkText="Ver todas as anotações" linkHref="/evaluations">
             <AnnotationListItem title="Elogio: Apresentação Pessoal" date="Recebido em: 05/09/2025" />
             <AnnotationListItem title="FO-: Esquecer material" date="Recebido em: 03/09/2025" />
             <AnnotationListItem title="FO+: Proatividade" date="Recebido em: 01/09/2025" />
        </DashboardCard>

      </div>
    </div>
  );
}