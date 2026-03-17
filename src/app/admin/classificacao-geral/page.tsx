import { BarChart3, CalendarDays } from "lucide-react";
import prisma from "@/lib/prisma";
import { ClassificacaoTable, ClassificacaoItem } from "@/components/admin/ClassificacaoTable";
import { Metadata } from "next";
import { ExtratoButton } from "./extrato-button";
import { unstable_cache } from "next/cache";

export const metadata: Metadata = {
  title: "Classificação Geral | Admin",
};

const getRankingCacheado = unstable_cache(
  async () => {
    const alunos = await prisma.perfilAluno.findMany({
      where: {
        usuario: {
          status: 'ATIVO'
        },
        status: 'ATIVO',
        cargoId: { not: null }
      },
      include: {
        usuario: { select: { nome: true, nomeDeGuerra: true } },
        cargo: true,
        historicoCargos: {
          where: { status: 'ATIVO' },
          select: {
            conceitoInicial: true,
            anotacoes: { select: { pontos: true } }
          }
        }
      }
    });

    const processedData = alunos.map((aluno) => {
      let elogios = 0;
      let punicoes = 0;
      let foPos = 0;
      let foNeg = 0;
      let somaTotalAnotacoes = 0;

      const blocoAtivo = aluno.historicoCargos[0];
      const anotacoesValidas = blocoAtivo?.anotacoes || [];

      const rawInicial = blocoAtivo?.conceitoInicial ?? aluno.conceitoInicial;
      const conceitoInicial = rawInicial
        ? parseFloat(String(rawInicial).replace(',', '.'))
        : 10.0;

      for (const anotacao of anotacoesValidas) {
        const pontos = Number(anotacao.pontos);
        somaTotalAnotacoes += pontos;

        if (pontos > 0.5) elogios += pontos;
        else if (pontos < -0.3) punicoes += pontos;
        else if (pontos === 0.5) foPos += pontos;
        else if (pontos === -0.3) foNeg += pontos;
      }

      return {
        rawAluno: aluno,
        dadosCalculados: {
          id: aluno.id,
          posicao: 0,
          numero: aluno.numero,
          nome: aluno.usuario.nome,
          nomeDeGuerra: aluno.usuario.nomeDeGuerra || "S/N",
          cargo: aluno.cargo?.nome || "Sem Cargo",
          precedencia: aluno.cargo?.precedencia || 999,
          totalElogios: elogios,
          totalPunicoes: punicoes,
          totalFoPos: foPos,
          totalFoNeg: foNeg,
          conceitoAtual: conceitoInicial + somaTotalAnotacoes
        }
      };
    });

    processedData.sort((a, b) => {
      const precA = a.rawAluno.cargo?.precedencia || 999;
      const precB = b.rawAluno.cargo?.precedencia || 999;
      if (precA !== precB) return precA - precB;
      return b.dadosCalculados.conceitoAtual - a.dadosCalculados.conceitoAtual;
    });

    const rankingMap: Record<string, number> = {};
    const finalData: ClassificacaoItem[] = processedData.map(item => {
      const cargoKey = item.dadosCalculados.cargo;
      if (!rankingMap[cargoKey]) rankingMap[cargoKey] = 1;
      else rankingMap[cargoKey]++;

      return {
        ...item.dadosCalculados,
        posicao: rankingMap[cargoKey]
      };
    });

    return finalData;
  },
  ["ranking-classificacao-geral-key"],
  {
    tags: ["classificacao_geral"],
    revalidate: 86400
  }
);

export default async function ClassificacaoGeralPage() {
  const finalData = await getRankingCacheado();

  const dataAtualizacao = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="container mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-foreground" />
          <h1 className="text-3xl font-bold text-foreground">Classificação Geral</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded-lg">
            <CalendarDays className="h-4 w-4" />
            <span>Atualizado em: {dataAtualizacao}</span>
          </div>
          <ExtratoButton dados={finalData} dataAtualizacao={dataAtualizacao} />
        </div>
      </div>

      <ClassificacaoTable data={finalData} />
    </div>
  );
}