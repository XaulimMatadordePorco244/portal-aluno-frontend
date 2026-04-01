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
        },
        suspensoes: { select: { pontosRetirados: true } } 
      }
    });

    const processedData = alunos.map((aluno) => {
      let elogios = 0;
      let punicoes = 0;
      let foPos = 0;
      let foNeg = 0;

      const anotacoes = aluno.historicoCargos[0]?.anotacoes || [];
      for (const a of anotacoes) {
        const pts = Number(a.pontos);
        if (pts > 0.5) elogios++;
        else if (pts < -0.3) punicoes++;
        else if (pts === 0.5) foPos++;
        else if (pts === -0.3) foNeg++;
      }

      let totalSuspensoes = 0;
      const suspensoes = aluno.suspensoes || [];
      for (const s of suspensoes) {
        totalSuspensoes++;
      }

      const conceitoAtualCalculado = Number(aluno.conceitoAtual) || 0;

      return {
        dadosCalculados: {
          id: aluno.id,
          numero: aluno.numero,
          nome: aluno.usuario.nome,
          nomeDeGuerra: aluno.usuario.nomeDeGuerra || aluno.usuario.nome.split(' ')[0],
          cargo: aluno.cargo?.abreviacao || '',
          precedencia: aluno.cargo?.precedencia || 999,
          totalElogios: elogios,
          totalPunicoes: punicoes,
          totalFoPos: foPos,
          totalFoNeg: foNeg,
          totalSuspensoes: totalSuspensoes, 
          conceitoAtual: conceitoAtualCalculado 
        }
      };
    });

    processedData.sort((a, b) => {
      if (a.dadosCalculados.precedencia !== b.dadosCalculados.precedencia) {
        return a.dadosCalculados.precedencia - b.dadosCalculados.precedencia;
      }
      if (b.dadosCalculados.conceitoAtual !== a.dadosCalculados.conceitoAtual) {
        return b.dadosCalculados.conceitoAtual - a.dadosCalculados.conceitoAtual;
      }
      return a.dadosCalculados.nome.localeCompare(b.dadosCalculados.nome);
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
            <CalendarDays className="w-4 h-4" />
            <span>Atualizado: <strong>{dataAtualizacao}</strong></span>
          </div>
          <ExtratoButton dados={finalData} dataAtualizacao={dataAtualizacao} />
        </div>
      </div>

      <ClassificacaoTable data={finalData} />
    </div>
  );
}