import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  Star,
  History,
  TrendingUp,
  Trophy,
  CalendarDays,
  Users,
  Award,
  AlertCircle
} from 'lucide-react';
import CargoTimeline from '@/components/cargos/CargoTimeline';
import CargoBreadcrumb from '@/components/cargos/CargoBreadcrumb';
import prisma from '@/lib/prisma';
import { getCurrentUserWithRelations } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Meu Histórico de Cargos',
  description: 'Acompanhe sua trajetória e evolução na instituição',
};

function StatCard({
  title,
  value,
  icon: Icon,
  suffix,
  trend
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  suffix?: React.ReactNode;
  trend?: 'positive' | 'neutral' | 'negative';
}) {
  const trendColor = trend === 'positive' ? 'text-green-600 dark:text-green-500' :
    trend === 'negative' ? 'text-red-600 dark:text-red-500' :
      'text-foreground';

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 transition-all hover:bg-accent/5">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-xs sm:text-sm font-medium text-muted-foreground truncate pr-2">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
      <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
        <div className={`text-xl sm:text-2xl font-bold ${trendColor}`}>{value}</div>
        {suffix && <span className="text-xs text-muted-foreground whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  );
}

export default async function AlunoCargosPage() {
  const user = await getCurrentUserWithRelations();

  if (!user || !user.perfilAluno) {
    redirect('/login');
  }

  const alunoId = user.perfilAluno.id;

  const aluno = await prisma.perfilAluno.findUnique({
    where: { id: alunoId },
    include: {
      cargo: true,
      funcao: true,
      companhia: true,
      historicoCargos: {
        include: {
          cargo: true,
          anotacoes: {
            include: {
              tipo: true,
              autor: {
                select: {
                  nome: true,
                  role: true
                }
              }
            },
            orderBy: { data: 'desc' }
          }
        },
        orderBy: { dataInicio: 'desc' }
      }
    }
  });

  if (!aluno) {
    redirect('/dashboard');
  }

  const historico = aluno.historicoCargos;
  const cargoAtual = historico.find(h => h.status === 'ATIVO');
  const primeiroCargo = historico[historico.length - 1];

  const tempoNoCargoAtual = cargoAtual
    ? Math.floor((new Date().getTime() - new Date(cargoAtual.dataInicio).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalAnotacoes = historico.reduce((total, periodo) => total + periodo.anotacoes.length, 0);
  const anotacoesPositivas = historico.reduce((total, periodo) =>
    total + periodo.anotacoes.filter(a => a.pontos > 0).length, 0
  );

  const evolucaoConceitoRaw = cargoAtual && primeiroCargo
    ? ((cargoAtual.conceitoAtual - primeiroCargo.conceitoInicial) / primeiroCargo.conceitoInicial) * 100
    : 0;

  const evolucaoConceito = evolucaoConceitoRaw.toFixed(1);

  const conceitoRaw = user.perfilAluno.conceitoAtual;
  const conceitoAtual = conceitoRaw ? parseFloat(conceitoRaw.toString()) : 7.0;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="mb-4">
        <CargoBreadcrumb />
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex flex-wrap items-center gap-2">
                  {user.nome}
                  {user.perfilAluno.nomeDeGuerra && (
                    <span className="text-lg sm:text-xl font-normal text-muted-foreground whitespace-nowrap">
                      &quot;{user.perfilAluno.nomeDeGuerra}&quot;
                    </span>
                  )}
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground mt-1">
                  Nº {user.perfilAluno.numero}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-transparent hover:border-border transition-colors">
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="font-semibold">Cia:</span>
                  <span className="truncate max-w-[150px]">{user.perfilAluno.companhia?.nome || 'Não atribuída'}</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-transparent hover:border-border transition-colors">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  <span className="font-semibold">Ingresso:</span>
                  <span>{user.perfilAluno.anoIngresso || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
              <StatCard
                title="Cargo Atual"
                value={user.perfilAluno.cargo?.nome || 'Não definido'}
                icon={Star}
              />
              <StatCard
                title="Conceito"
                value={conceitoAtual.toFixed(1)}
                icon={Trophy}
                trend={conceitoAtual >= 7.0 ? 'positive' : 'negative'}
              />
              <StatCard
                title="Dias no Cargo"
                value={tempoNoCargoAtual}
                icon={CalendarDays}
                suffix="dias"
              />
              <StatCard
                title="Evolução"
                value={evolucaoConceito}
                icon={TrendingUp}
                suffix="%"
                trend={evolucaoConceitoRaw > 0 ? 'positive' : evolucaoConceitoRaw < 0 ? 'negative' : 'neutral'}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total de Cargos"
          value={historico.filter(h => h.status !== 'REVERTIDO').length}
          icon={History}
        />
        <StatCard
          title="Anotações Recebidas"
          value={totalAnotacoes}
          icon={Award}
          suffix={
            <span className={`ml-2 px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold ${anotacoesPositivas > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'}`}>
              +{anotacoesPositivas} positivas
            </span>
          }
        />
        <StatCard
          title="Período Ativo"
          value={historico.length > 0
            ? Math.floor((new Date().getTime() - new Date(historico[historico.length - 1].dataInicio).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
            : 0
          }
          icon={History}
          suffix="meses"
        />
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-4 sm:p-6 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <h3 className="font-semibold leading-none tracking-tight">Linha do Tempo</h3>
            </div>
            <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-primary text-primary-foreground shadow">
              {historico.length} períodos
            </span>
          </div>
        </div>
        <div className="p-4 sm:p-6 pt-2">
          <CargoTimeline
            alunoId={alunoId}
            isAdmin={false}
          />

          {historico.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground bg-accent/20 rounded-lg border border-dashed mt-4">
              <AlertCircle className="h-10 w-10 mb-3 opacity-50" />
              <h4 className="text-lg font-medium text-foreground">Histórico em branco</h4>
              <p className="text-sm max-w-sm mt-1">
                Você ainda não possui histórico de cargos registrado. Entre em contato com a administração.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}