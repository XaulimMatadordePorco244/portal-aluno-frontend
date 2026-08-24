"use client";
import { useState, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";
import { efetivarPromocoesDoCiclo } from "@/app/actions/transicoes";
import { toast } from "sonner";

export interface CargoListagem {
  id: string;
  nome: string;
  abreviacao: string;
  precedencia: number;
}

export interface CandidatoListagem {
  id: string;
  alunoId: string;
  modalidade: string;
  resultado: string | null;
  conceitoSnapshot: number;
  mediaEscolarSnapshot: number;
  tafSnapshot: number;
  motivoReprovacao: string | null;
  aluno: {
    id: string;
    cargoId: string | null;
    cargo: CargoListagem | null;
    usuario: { id: string; nome: string; nomeDeGuerra: string | null };
  };
}

export interface CicloListagem {
  id: string;
  nome: string | null;
  status: string;
  candidatos: CandidatoListagem[];
}

interface QuadroAcessoClientProps {
  ciclo: CicloListagem;
  cargos: CargoListagem[];
}

export default function QuadroAcessoClient({
  ciclo,
  cargos,
}: QuadroAcessoClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<
    "ANTIGUIDADE" | "MERITO_ESCOLAR" | "HONRA_AO_MERITO"
  >("ANTIGUIDADE");
  const [statusFiltro, setStatusFiltro] = useState<"APTO" | "INAPTO">("APTO");
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({});

  const isFechado = ciclo.status === "FECHADO";

  const candidatosExibidos = useMemo(() => {
    const statusNoBanco = statusFiltro === "APTO" ? "PENDENTE" : "REPROVADO";
    return ciclo.candidatos.filter(
      (c) => c.modalidade === abaAtiva && c.resultado === statusNoBanco,
    );
  }, [ciclo.candidatos, abaAtiva, statusFiltro]);

  // Separação dos alunos por transição de cargos ordenados por antiguidade
  const candidatosAgrupados = useMemo(() => {
    const gruposMap = new Map<
      string,
      {
        grupoNome: string;
        precedencia: number;
        listaAlunos: CandidatoListagem[];
      }
    >();

    candidatosExibidos.forEach((cand) => {
      const cargoAtual = cand.aluno.cargo;
      const cargoDestino = cargoAtual
        ? cargos
            .filter((c) => c.precedencia < cargoAtual.precedencia)
            .sort((a, b) => b.precedencia - a.precedencia)[0]
        : null;

      const chaveGrupo = cargoAtual
        ? `${cargoAtual.nome} ➔ ${cargoDestino?.nome || "Fim de Quadro"}`
        : "Sem Cargo Definido";

      if (!gruposMap.has(chaveGrupo)) {
        gruposMap.set(chaveGrupo, {
          grupoNome: chaveGrupo,
          precedencia: cargoAtual?.precedencia || 9999, // Ordenação pelo nível do cargo
          listaAlunos: [],
        });
      }
      gruposMap.get(chaveGrupo)!.listaAlunos.push(cand);
    });

    // Retorna um array ordenado pela precedência (antiguidade)
    return Array.from(gruposMap.values()).sort(
      (a, b) => a.precedencia - b.precedencia,
    );
  }, [candidatosExibidos, cargos]);

  const handleToggleSelect = (id: string) => {
    setSelecionados((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEfetivar = async () => {
    const promocoesParaEfetivar = Object.keys(selecionados)
      .filter((id) => selecionados[id])
      .map((id) => {
        const cand = ciclo.candidatos.find((c) => c.id === id);
        if (!cand) return null;
        const cargoAtual = cand.aluno.cargo;
        const cargoDestino = cargoAtual
          ? cargos
              .filter((c) => c.precedencia < cargoAtual.precedencia)
              .sort((a, b) => b.precedencia - a.precedencia)[0]
          : null;
        return { alunoId: cand.alunoId, novoCargoId: cargoDestino?.id || "" };
      })
      .filter(
        (p): p is { alunoId: string; novoCargoId: string } =>
          p !== null && p.novoCargoId !== "",
      );

    if (promocoesParaEfetivar.length === 0) return;
    setLoading(true);
    try {
      const res = await efetivarPromocoesDoCiclo(
        ciclo.id,
        promocoesParaEfetivar,
      );
      if (res.success) {
        toast.success("Promoções efetivadas!");
        setSelecionados({});
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-border">
        {(["ANTIGUIDADE", "MERITO_ESCOLAR", "HONRA_AO_MERITO"] as const).map(
          (mod) => (
            <button
              key={mod}
              onClick={() => {
                setAbaAtiva(mod);
                setSelecionados({});
              }}
              className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 -mb-px ${
                abaAtiva === mod
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {mod.replace(/_/g, " ")}
            </button>
          ),
        )}
      </div>

      <div className="flex justify-between items-center bg-muted/40 p-3 rounded-lg border border-border">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFiltro("APTO")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              statusFiltro === "APTO"
                ? "bg-emerald-500 text-white shadow"
                : "bg-transparent text-muted-foreground hover:bg-muted"
            }`}
          >
            Aptos (
            {
              ciclo.candidatos.filter(
                (c) => c.modalidade === abaAtiva && c.resultado === "PENDENTE",
              ).length
            }
            )
          </button>
          <button
            onClick={() => setStatusFiltro("INAPTO")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              statusFiltro === "INAPTO"
                ? "bg-destructive text-destructive-foreground shadow"
                : "bg-transparent text-muted-foreground hover:bg-muted"
            }`}
          >
            Inaptos (
            {
              ciclo.candidatos.filter(
                (c) => c.modalidade === abaAtiva && c.resultado === "REPROVADO",
              ).length
            }
            )
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-medium uppercase text-xs border-b border-border">
              {!isFechado && statusFiltro === "APTO" && (
                <th className="p-4 w-12">✔</th>
              )}
              <th className="p-4">Aluno</th>
              <th className="p-4 text-center">Média Escolar</th>
              <th className="p-4 text-center">Conceito</th>
              <th className="p-4 text-center">Média TAF</th>
              <th className="p-4 text-left w-2/5">Parecer / Comparativo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {candidatosAgrupados.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  Nenhum aluno {statusFiltro.toLowerCase()} nesta modalidade.
                </td>
              </tr>
            ) : (
              candidatosAgrupados.map(({ grupoNome, listaAlunos }) => (
                <Fragment key="{grupoNome}">
                  <tr className="bg-muted/60 font-bold text-xs text-primary uppercase">
                    <td colSpan={6} className="px-4 py-3 bg-primary/5">
                      Promoção: {grupoNome} ({listaAlunos.length}{" "}
                      {statusFiltro === "APTO" ? "aptos" : "inaptos"})
                    </td>
                  </tr>
                  {listaAlunos.map((candidato) => (
                    <tr key={candidato.id} className="hover:bg-muted/30">
                      {!isFechado && statusFiltro === "APTO" && (
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={!!selecionados[candidato.id]}
                            onChange={() => handleToggleSelect(candidato.id)}
                            className="h-4 w-4 rounded text-primary"
                          />
                        </td>
                      )}
                      <td className="p-4 font-medium uppercase text-xs">
                        {candidato.aluno.cargo?.abreviacao || "AL"} GM{" "}
                        {candidato.aluno.usuario.nomeDeGuerra ||
                          candidato.aluno.usuario.nome}
                      </td>
                      <td className="p-4 text-center font-mono text-xs">
                        {candidato.mediaEscolarSnapshot.toFixed(2)}
                      </td>
                      <td className="p-4 text-center font-mono text-xs text-blue-600 font-bold">
                        {candidato.conceitoSnapshot.toFixed(2)}
                      </td>
                      <td className="p-4 text-center font-mono text-xs">
                        {candidato.tafSnapshot.toFixed(2)}
                      </td>
                      <td className="p-4 text-left">
                        <div
                          className={`text-[11px] font-bold uppercase mb-1 ${statusFiltro === "APTO" ? "text-emerald-600" : "text-destructive"}`}
                        >
                          {statusFiltro === "APTO" ? "✔ APTO" : "✖ INAPTO"}
                        </div>
                        {candidato.motivoReprovacao && (
                          <div className="text-[11px] text-muted-foreground leading-tight">
                            {candidato.motivoReprovacao}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {statusFiltro === "APTO" && !isFechado && (
        <div className="p-4 bg-muted/50 border border-border rounded-lg flex justify-between items-center shadow-sm">
          <span className="text-sm text-muted-foreground">
            <strong>
              {Object.values(selecionados).filter(Boolean).length}
            </strong>{" "}
            aluno(s) selecionado(s).
          </span>
          <button
            onClick={handleEfetivar}
            disabled={
              loading ||
              Object.values(selecionados).filter(Boolean).length === 0
            }
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-2 px-6 rounded-lg transition-all"
          >
            {loading ? "Processando..." : "Efetivar Promoções"}
          </button>
        </div>
      )}
    </div>
  );
}
