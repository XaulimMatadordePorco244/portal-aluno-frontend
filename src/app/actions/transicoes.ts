"use server";

import prisma from "@/lib/prisma";
import { getCurrentUserWithRelations } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { criarNotificacao } from "@/actions/notificacoes";
import { MotivoPromocao, MotivoDespromocao } from "@prisma/client";
import { StatusAprovacao } from "@prisma/client";

function traduzirOperador(operador: string): string {
  switch (operador) {
    case "GTE":
      return "≥";
    case "LTE":
      return "≤";
    case "EQ":
      return "=";
    case "GT":
      return ">";
    case "LT":
      return "<";
    case "NEQ":
      return "≠";
    default:
      return operador;
  }
}

export type TipoTransicao = "PROMOCAO" | "DESPROMOCAO";

interface TransicaoInput {
  alunoIds: string[];
  tipo: TipoTransicao;
  cargoDestinoId?: string;
  motivo: MotivoPromocao | MotivoDespromocao;
  descricao?: string;
}

interface CandidatoAvaliado {
  cicloId: string;
  alunoId: string;
  modalidade: string;
  mediaEscolarSnapshot: number;
  conceitoSnapshot: number;
  tafSnapshot: number;
  cargoDestinoNome: string;
  dataReferencia: Date;
  motivoReprovacao: string | null;
  resultado: "APTO" | "INAPTO";
}

export async function processarTransicaoEmMassa(data: TransicaoInput) {
  const admin = await getCurrentUserWithRelations();

  if (!admin) {
    return { success: false, message: "Não autorizado" };
  }

  try {
    const todosCargos = await prisma.cargo.findMany({
      where: { tipo: { not: "CURSO" } },
      orderBy: { precedencia: "asc" },
    });

    const alunosBrutos = await prisma.perfilAluno.findMany({
      where: { id: { in: data.alunoIds } },
      include: { cargo: true, usuario: true },
    });

    const alunos = data.alunoIds
      .map((id) => alunosBrutos.find((a) => a.id === id))
      .filter((a): a is NonNullable<typeof a> => a !== undefined);

    const operations = [];
    const notificacoesPendentes = [];
    const dataReferencia = new Date();

    for (let i = 0; i < alunos.length; i++) {
      const aluno = alunos[i];
      let novoCargoId = null;
      const conceitoNovo = 7.0;
      const notaDesempate = 10 - i * 0.01;

      if (data.tipo === "PROMOCAO") {
        if (data.cargoDestinoId) {
          novoCargoId = data.cargoDestinoId;
        } else {
          const indexAtual = todosCargos.findIndex(
            (c) => c.id === aluno.cargoId,
          );
          if (indexAtual > 0) {
            novoCargoId = todosCargos[indexAtual - 1].id;
          }
        }
      } else {
        if (data.cargoDestinoId) {
          novoCargoId = data.cargoDestinoId;
        } else {
          const indexAtual = todosCargos.findIndex(
            (c) => c.id === aluno.cargoId,
          );
          if (indexAtual !== -1 && indexAtual < todosCargos.length - 1) {
            novoCargoId = todosCargos[indexAtual + 1].id;
          }
        }
      }

      if (!novoCargoId) continue;
      const cargoNovoObj = todosCargos.find((c) => c.id === novoCargoId);

      operations.push(
        prisma.cargoHistory.updateMany({
          where: {
            alunoId: aluno.id,
            status: "ATIVO",
          },
          data: {
            status: "FECHADO",
            dataFim: dataReferencia,
          },
        }),
      );

      operations.push(
        prisma.cargoHistory.create({
          data: {
            alunoId: aluno.id,
            cargoId: novoCargoId,
            cargoNomeSnapshot: cargoNovoObj?.nome || "Cargo Desconhecido",
            status: "ATIVO",
            tipoPromocao:
              data.tipo === "PROMOCAO" ? "MANUAL_OVERRIDE" : "RECLASSIFICACAO",
            dataInicio: dataReferencia,
            motivo: data.descricao
              ? `${data.motivo} - ${data.descricao}`
              : data.motivo,
          },
        }),
      );

      operations.push(
        prisma.perfilAluno.update({
          where: { id: aluno.id },
          data: {
            cargoId: novoCargoId,
            conceitoAtual: String(conceitoNovo),
            foraDeData: false,
            ...(data.tipo === "PROMOCAO" && {
              dataUltimaPromocao: dataReferencia,
              modalidadeUltimaPromocao: data.motivo,
              notaDesempatePromocao: notaDesempate,
            }),
          },
        }),
      );

      notificacoesPendentes.push({
        usuarioId: aluno.usuarioId,
        titulo:
          data.tipo === "PROMOCAO"
            ? "Promoção Realizada"
            : "Alteração de Cargo",
        mensagem: `Você foi ${data.tipo === "PROMOCAO" ? "promovido" : "rebaixado"} para o cargo de ${todosCargos.find((c) => c.id === novoCargoId)?.nome}.`,
        tipo: "SISTEMA" as const,
      });
    }

    await prisma.$transaction(operations);

    for (const notif of notificacoesPendentes) {
      await criarNotificacao(
        notif.usuarioId,
        notif.titulo,
        notif.mensagem,
        notif.tipo,
      );
    }

    revalidatePath("/admin/antiguidade");
    revalidatePath("/admin/promocao-manual");

    return {
      success: true,
      message: `${alunos.length} transições processadas com sucesso.`,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao processar transição em massa." };
  }
}

function getCategoriaVaga(nomeCargo: string): string | null {
  const nome = nomeCargo.toLowerCase();
  if (
    nome.includes("coronel") ||
    nome.includes("tenente-coronel") ||
    nome.includes("major")
  )
    return "superiores";
  if (nome.includes("capitão")) return "intermediarios";
  if (nome.includes("tenente")) return "subalternos";
  if (nome.includes("subtenente")) return "subtenentes";
  if (nome.includes("sargento")) return "sargentos";
  if (nome.includes("cabo")) return "cabos";
  if (nome.includes("soldado")) return "soldados";
  return null;
}

export async function calcularVagasDisponiveis() {
  const limites = await prisma.quadroVagasAntiguidade.findUnique({
    where: { id: "singleton" },
  });

  if (!limites) {
    throw new Error("Quadro de Vagas não foi configurado.");
  }

  const alunosAtivos = await prisma.perfilAluno.findMany({
    where: {
      usuario: { status: "ATIVO" },
      cargoId: { not: null },
    },
    include: { cargo: true },
  });

  const ocupadas = {
    superiores: 0,
    intermediarios: 0,
    subalternos: 0,
    subtenentes: 0,
    sargentos: 0,
    cabos: 0,
    soldados: 0,
  };

  alunosAtivos.forEach((aluno) => {
    if (aluno.cargo) {
      const categoria = getCategoriaVaga(
        aluno.cargo.nome,
      ) as keyof typeof ocupadas;
      if (categoria) {
        ocupadas[categoria]++;
      }
    }
  });

  return {
    superiores: Math.max(0, limites.superiores - ocupadas.superiores),
    intermediarios: Math.max(
      0,
      limites.intermediarios - ocupadas.intermediarios,
    ),
    subalternos: Math.max(0, limites.subalternos - ocupadas.subalternos),
    subtenentes: Math.max(0, limites.subtenentes - ocupadas.subtenentes),
    sargentos: Math.max(0, limites.sargentos - ocupadas.sargentos),
    cabos: Math.max(0, limites.cabos - ocupadas.cabos),
    soldados: Math.max(0, limites.soldados - ocupadas.soldados),
  };
}

export async function efetivarPromocoesDoCiclo(
  cicloId: string,
  promocoes: { alunoId: string; novoCargoId: string }[],
) {
  const admin = await getCurrentUserWithRelations();

  if (!admin) {
    return { success: false, message: "Não autorizado" };
  }

  try {
    const todosCargos = await prisma.cargo.findMany({
      where: { tipo: { not: "CURSO" } },
    });

    const dataReferencia = new Date();
    const operations = [];
    const notificacoesPendentes = [];

    for (let i = 0; i < promocoes.length; i++) {
      const p = promocoes[i];
      const cargoNovoObj = todosCargos.find((c) => c.id === p.novoCargoId);

      if (!cargoNovoObj) continue;

      const notaDesempate = 10 - i * 0.01;

      operations.push(
        prisma.cargoHistory.updateMany({
          where: {
            alunoId: p.alunoId,
            status: "ATIVO",
          },
          data: {
            status: "FECHADO",
            dataFim: dataReferencia,
          },
        }),
      );

      operations.push(
        prisma.cargoHistory.create({
          data: {
            alunoId: p.alunoId,
            cargoId: p.novoCargoId,
            cargoNomeSnapshot: cargoNovoObj.nome,
            status: "ATIVO",
            tipoPromocao: "AUTOMATICA",
            dataInicio: dataReferencia,
            cicloId: cicloId,
            motivo: "Promoção por Ciclo de Avaliação",
          },
        }),
      );

      operations.push(
        prisma.perfilAluno.update({
          where: { id: p.alunoId },
          data: {
            cargoId: p.novoCargoId,
            conceitoAtual: "7.0",
            foraDeData: false,
            dataUltimaPromocao: dataReferencia,
            modalidadeUltimaPromocao: "CICLO_PROMOCAO",
            notaDesempatePromocao: notaDesempate,
          },
        }),
      );

      notificacoesPendentes.push({
        usuarioId: p.alunoId,
        titulo: "Promoção Realizada",
        mensagem: `Parabéns! Você foi promovido para o cargo de ${cargoNovoObj.nome} no ciclo de avaliação atual.`,
        tipo: "SISTEMA" as const,
      });
    }

    operations.push(
      prisma.cicloPromocao.update({
        where: { id: cicloId },
        data: {
          status: "FECHADO",
          dataReferencia: dataReferencia,
        },
      }),
    );

    await prisma.$transaction(operations);

    revalidatePath("/admin/promocoes/ciclos");
    revalidatePath(`/admin/promocoes/ciclos/${cicloId}`);
    revalidatePath("/admin/antiguidade");

    return {
      success: true,
      message: "Ciclo finalizado e promoções efetivadas com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao efetivar ciclo:", error);
    return {
      success: false,
      message: "Erro ao efetivar as promoções do ciclo.",
    };
  }
}

export async function criarCicloPromocao(nome: string) {
  try {
    const novoCiclo = await prisma.cicloPromocao.create({
      data: {
        nome,
        status: "ABERTO",
        dataReferencia: new Date(),
      },
    });

    revalidatePath("/admin/promocoes/ciclos");
    return {
      success: true,
      cicloId: novoCiclo.id,
      message: "Ciclo criado com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao criar ciclo:", error);
    return { success: false, message: "Erro ao criar o ciclo de promoção." };
  }
}

function avaliarCondicao(
  valorAluno: number,
  operador: string,
  valorRegra: string,
): boolean {
  const reqNum = parseFloat(valorRegra);
  switch (operador) {
    case "GTE":
      return valorAluno >= reqNum;
    case "LTE":
      return valorAluno <= reqNum;
    case "EQ":
      return valorAluno === reqNum;
    case "NEQ":
      return valorAluno !== reqNum;
    default:
      return false;
  }
}

function normalizarModalidade(modalidade: string): string {
  if (!modalidade) return "";
  return modalidade
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[\s\-]+/g, "_"); // Troca espaços e hífens por underline
}

export async function gerarQuadroDeAcesso(cicloId: string) {
  try {
    await prisma.candidatoCiclo.deleteMany({ where: { cicloId } });

    const regrasPromocao = await prisma.regraPromocao.findMany({
      include: { requisitos: true, cargoDestino: true },
    });

    const modalidadesExistentes = Array.from(
      new Set(regrasPromocao.map((r) => normalizarModalidade(r.modalidade))),
    );

    const alunosAtivos = await prisma.perfilAluno.findMany({
      where: { usuario: { status: "ATIVO" }, status: "ATIVO" },
      include: {
        cargo: true,
        desempenhosEscolares: { orderBy: { anoLetivo: "desc" }, take: 1 },
        tafs: { orderBy: { dataRealizacao: "desc" }, take: 1 },
      },
    });

    const aptosParaVagas: CandidatoAvaliado[] = [];
    const inaptosGerais: CandidatoAvaliado[] = [];

    for (const aluno of alunosAtivos) {
      if (!aluno.cargoId) continue;

      const regrasDesteCargo = regrasPromocao.filter(
        (r) => r.cargoOrigemId === aluno.cargoId,
      );

      const media = aluno.desempenhosEscolares[0]?.mediaB1 || 0;
      const conceito = parseFloat(aluno.conceitoAtual || "10");
      const taf = aluno.tafs[0]?.mediaFinal || 0;
      const dataRef = aluno.dataUltimaPromocao || aluno.createdAt;
      const mesesNoCargo = Math.floor(
        (new Date().getTime() - new Date(dataRef).getTime()) /
          (1000 * 60 * 60 * 24 * 30.43),
      );

      // Alunos sem regras cadastradas no cargo atual entram como INAPTO nas modalidades
      if (regrasDesteCargo.length === 0) {
        for (const mod of modalidadesExistentes) {
          inaptosGerais.push({
            cicloId,
            alunoId: aluno.id,
            modalidade: mod,
            mediaEscolarSnapshot: media,
            conceitoSnapshot: conceito,
            tafSnapshot: taf,
            cargoDestinoNome: aluno.cargo?.nome || "Cargo Atual",
            dataReferencia: dataRef,
            motivoReprovacao:
              "Sem regra de promoção cadastrada para o cargo atual",
            resultado: "INAPTO",
          });
        }
        continue;
      }

      for (const regra of regrasDesteCargo) {
        let aprovadoNosRequisitos = true;
        const falhas: string[] = [];
        const resumoRequisitos: string[] = [];

        for (const req of regra.requisitos) {
          let valorTestado = 0;
          let nomeCriterio = "";
          let formatado = "";

          if (req.campo === "MEDIA_ESCOLAR") {
            valorTestado = media;
            nomeCriterio = "Média";
            formatado = media.toFixed(2);
          } else if (req.campo === "CONCEITO") {
            valorTestado = conceito;
            nomeCriterio = "Conceito";
            formatado = conceito.toFixed(2);
          } else if (req.campo === "TAF") {
            valorTestado = taf;
            nomeCriterio = "TAF";
            formatado = taf.toFixed(2);
          } else if (req.campo === "INTERSTICIO_MESES") {
            valorTestado = mesesNoCargo;
            nomeCriterio = "Interstício (Meses)";
            formatado = mesesNoCargo.toString();
          }

          let passou = false;
          if (req.campo === "SEM_NOTA_VERMELHA") {
            const temVermelha =
              (aluno.desempenhosEscolares[0]?.qtdNotasVermelhas || 0) > 0;
            passou = req.valor === "true" ? !temVermelha : true;
            resumoRequisitos.push(
              `Sem Notas Vermelhas: ${!temVermelha ? "Sim" : "Não"}`,
            );
          } else {
            passou = avaliarCondicao(valorTestado, req.operador, req.valor);
            resumoRequisitos.push(
              `${nomeCriterio}: ${formatado} (Req: ${traduzirOperador(req.operador)} ${req.valor})`,
            );
          }

          if (!passou && req.obrigatorio) {
            aprovadoNosRequisitos = false;
            falhas.push(`${nomeCriterio} falhou`);
          }
        }

        const modalidadeNormalizada = normalizarModalidade(regra.modalidade);

        const candidatoData: CandidatoAvaliado = {
          cicloId,
          alunoId: aluno.id,
          modalidade: modalidadeNormalizada,
          mediaEscolarSnapshot: media,
          conceitoSnapshot: conceito,
          tafSnapshot: taf,
          cargoDestinoNome: regra.cargoDestino.nome.toLowerCase(),
          dataReferencia: dataRef,
          motivoReprovacao: aprovadoNosRequisitos
            ? `Requisitos atingidos: ${resumoRequisitos.join(" | ")}`
            : `FALHOU: ${falhas.join(", ")}. Detalhes: ${resumoRequisitos.join(" | ")}`,
          resultado: aprovadoNosRequisitos ? "APTO" : "INAPTO",
        };

        if (aprovadoNosRequisitos) {
          aptosParaVagas.push(candidatoData);
        } else {
          inaptosGerais.push(candidatoData);
        }
      }
    }

    const vagas = await calcularVagasDisponiveis();
    const candidatosFinais: CandidatoAvaliado[] = [...inaptosGerais];

    for (const mod of modalidadesExistentes) {
      if (mod === "HONRA_AO_MERITO") continue;

      const aptosDestaModalidade = aptosParaVagas.filter(
        (c) => c.modalidade === mod,
      );

      // Limite de Vagas APENAS para Antiguidade. As outras modalidades são ilimitadas!
      if (mod === "ANTIGUIDADE") {
        aptosDestaModalidade.sort(
          (a, b) =>
            new Date(a.dataReferencia).getTime() -
            new Date(b.dataReferencia).getTime(),
        );

        // Tipagem 'Record<string, number>' resolve erro TS7053
        const vagasDaModalidade: Record<string, number> = { ...vagas };

        for (const cand of aptosDestaModalidade) {
          const cargoNomeClean = cand.cargoDestinoNome.toLowerCase().trim();

          // Uso do 'const' resolve aviso prefer-const do ESLint
          const chaveVaga = Object.keys(vagasDaModalidade).find(
            (k) =>
              k.toLowerCase() === cargoNomeClean ||
              k.toLowerCase() === `${cargoNomeClean}s` ||
              cargoNomeClean.includes(k.toLowerCase().replace(/s$/, "")),
          );

          const limite = chaveVaga ? vagasDaModalidade[chaveVaga] : 999;

          if (limite > 0) {
            if (chaveVaga) vagasDaModalidade[chaveVaga]--;
            cand.resultado = "APTO";
          } else {
            cand.resultado = "INAPTO";
            cand.motivoReprovacao = `Falta de vagas para ${cand.cargoDestinoNome}. ${cand.motivoReprovacao}`;
          }
          candidatosFinais.push(cand);
        }
      } else {
        aptosDestaModalidade.sort(
          (a, b) =>
            b.conceitoSnapshot - a.conceitoSnapshot ||
            b.mediaEscolarSnapshot - a.mediaEscolarSnapshot,
        );
        candidatosFinais.push(...aptosDestaModalidade);
      }
    }

    const aptosHonra = aptosParaVagas.filter(
      (c) => c.modalidade === "HONRA_AO_MERITO",
    );
    candidatosFinais.push(...aptosHonra);

    await prisma.candidatoCiclo.createMany({
      data: candidatosFinais.map((c) => ({
        cicloId: c.cicloId,
        alunoId: c.alunoId,
        modalidade: c.modalidade,
        mediaEscolarSnapshot: c.mediaEscolarSnapshot,
        conceitoSnapshot: c.conceitoSnapshot,
        tafSnapshot: c.tafSnapshot,
        resultado:
          c.resultado === "APTO"
            ? StatusAprovacao.PENDENTE
            : StatusAprovacao.REPROVADO,
        motivoReprovacao: c.motivoReprovacao,
      })),
      skipDuplicates: true,
    });

    await prisma.cicloPromocao.update({
      where: { id: cicloId },
      data: { status: "PROCESSANDO" },
    });
    revalidatePath(`/admin/promocoes/ciclos/${cicloId}`);
    return { success: true, message: "Quadro gerado com sucesso!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao gerar o quadro." };
  }
}

export async function encerrarCicloPromocao(cicloId: string) {
  try {
    await prisma.cicloPromocao.update({
      where: { id: cicloId },
      data: {
        status: "FECHADO",
      },
    });

    revalidatePath("/admin/promocoes/ciclos");
    revalidatePath(`/admin/promocoes/${cicloId}`);
    return { success: true, message: "Ciclo encerrado com sucesso!" };
  } catch (error) {
    console.error("Erro ao encerrar ciclo:", error);
    return { success: false, message: "Erro ao encerrar o ciclo." };
  }
}

export async function apagarCicloPromocao(cicloId: string) {
  try {
    await prisma.candidatoCiclo.deleteMany({
      where: { cicloId: cicloId },
    });

    await prisma.cicloPromocao.delete({
      where: { id: cicloId },
    });

    revalidatePath("/admin/promocoes/ciclos");
    return { success: true, message: "Ciclo apagado com sucesso!" };
  } catch (error) {
    console.error("Erro ao apagar ciclo:", error);
    return { success: false, message: "Erro ao apagar o ciclo de promoção." };
  }
}
