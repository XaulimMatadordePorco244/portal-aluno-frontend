"use server";

import prisma from "@/lib/prisma";
import { getCurrentUserWithRelations } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { criarNotificacao } from "@/actions/notificacoes";
import { MotivoPromocao, MotivoDespromocao } from "@prisma/client";

export type TipoTransicao = "PROMOCAO" | "DESPROMOCAO";

interface TransicaoInput {
  alunoIds: string[];
  tipo: TipoTransicao;
  cargoDestinoId?: string;
  motivo: MotivoPromocao | MotivoDespromocao;
  descricao?: string;
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
            status: "ATIVO" 
          },
          data: {
            status: "FECHADO",
            dataFim: dataReferencia
          }
        })
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