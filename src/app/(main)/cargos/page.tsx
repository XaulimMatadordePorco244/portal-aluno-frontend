import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  Star,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity
} from 'lucide-react';
import CargoBreadcrumb from '@/components/cargos/CargoBreadcrumb';
import CargoHistoryDashboard from '@/components/cargos/CargoHistoryDashboard'; 
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
  const valueColor = 
    trend === 'positive' ? 'text-green-600' :
    trend === 'negative' ? 'text-red-600' :
    'text-foreground';

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-row items-center justify-between pb-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground/50" />
      </div>
      <div className="flex items-baseline gap-1">
        <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
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
      companhia: true,
      historicoCargos: {
        include: {
          cargo: true,
          anotacoes: {
            include: { tipo: true },
            orderBy: { data: 'desc' }
          }
        },
        orderBy: { dataInicio: 'desc' }
      }
    }
  });

  if (!aluno) redirect('/dashboard');

  const historicoBruto = aluno.historicoCargos;
  
  const historicoProcessado = historicoBruto.map(fase => {
    const stats = {
      elogio: { count: 0, points: 0 },
      punicao: { count: 0, points: 0 },
      foPositivo: { count: 0, points: 0 },
      foNegativo: { count: 0, points: 0 }
    };

    let somaPontosFase = 0;

    fase.anotacoes.forEach(anotacao => {
      const pontos = anotacao.pontos ?? 0;
      somaPontosFase += pontos;

      if (pontos > 0.5) {
        stats.elogio.count++;
        stats.elogio.points += pontos;
      }
      if (pontos < -0.3) {
        stats.punicao.count++;
        stats.punicao.points += pontos;
      }
      if (pontos === 0.5) {
        stats.foPositivo.count++;
        stats.foPositivo.points += pontos;
      }
      if (pontos === -0.3) {
        stats.foNegativo.count++;
        stats.foNegativo.points += pontos;
      }
    });

    const conceitoInicialFase = Number(fase.conceitoInicial || 0);
    const conceitoFinalFase = conceitoInicialFase + somaPontosFase;

    return {
      ...fase,
      balanco: {
        elogios: stats.elogio,
        punicoes: stats.punicao,
        foPos: stats.foPositivo,
        foNeg: stats.foNegativo,
        conceitoFinal: conceitoFinalFase.toFixed(2),
        conceitoInicial: conceitoInicialFase.toFixed(2)
      },
      anotacoes: fase.anotacoes.map(a => ({
        ...a,
        tipo: { ...a.tipo, nome: a.tipo.titulo }
      }))
    };
  });

  const faseAtual = historicoProcessado.length > 0 ? historicoProcessado[0] : null;

  const pontosPositivosAtual = faseAtual 
    ? (faseAtual.balanco.elogios.points + faseAtual.balanco.foPos.points)
    : 0;

  const pontosNegativosAtual = faseAtual
    ? (faseAtual.balanco.punicoes.points + faseAtual.balanco.foNeg.points)
    : 0;

  const saldoAtual = pontosPositivosAtual + pontosNegativosAtual;

  const conceitoAtual = aluno.conceitoAtual ? Number(aluno.conceitoAtual) : 0;
  
  let IconTrend = Minus;
  let trendType: 'positive' | 'negative' | 'neutral' = 'neutral';
  
  if (saldoAtual > 0) {
    IconTrend = TrendingUp;
    trendType = 'positive';
  } else if (saldoAtual < 0) {
    IconTrend = TrendingDown;
    trendType = 'negative';
  }
  const evolucaoTexto = `${saldoAtual > 0 ? '+' : ''}${saldoAtual.toFixed(2).replace('.', ',')}`;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      
      <div className="space-y-6">
        <div className="mb-2">
           <CargoBreadcrumb />
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  {user.nome}
                </h1>
                <div className="text-sm text-muted-foreground">
                    Cia. {aluno.companhia?.nome || 'N/A'} • Turma {aluno.anoIngresso || 'N/A'} • Nº {aluno.numero}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
                title="Patente Atual"
                value={aluno.cargo?.abreviacao || aluno.cargo?.nome || '—'}
                icon={Star}
            />
            <StatCard
                title="Conceito Atual"
                value={conceitoAtual.toFixed(2).replace('.', ',')}
                icon={Trophy}
                trend={conceitoAtual >= 7 ? 'positive' : 'negative'}
            />
            <StatCard
                title="Pontos Positivos (Atual)"
                value={`+${pontosPositivosAtual.toFixed(2)}`}
                icon={Activity}
                trend="positive"
            />
            <StatCard
                title="Pontos Negativos (Atual)"
                value={pontosNegativosAtual.toFixed(2)}
                icon={Activity}
                trend="negative"
            />
            <StatCard
                title="Evolução Atual"
                value={evolucaoTexto}
                icon={IconTrend}
                trend={trendType}
            />
        </div>
      </div>

      <div className="border-t"></div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Histórico Detalhado</h2>
        {historicoProcessado.length > 0 ? (
           <CargoHistoryDashboard historico={historicoProcessado} />
        ) : (
           <div className="py-12 text-center border rounded-xl border-dashed">
              <p className="text-muted-foreground">Histórico não iniciado.</p>
           </div>
        )}
      </div>

    </div>
  );
}