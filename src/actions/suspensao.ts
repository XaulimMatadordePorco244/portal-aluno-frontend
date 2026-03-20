"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { getCurrentUserWithRelations } from "@/lib/auth";
import { recalcularConceitoAluno } from "@/lib/conceitoUtils";
import { criarNotificacao } from "@/actions/notificacoes";

const SuspensaoSchema = z.object({
  alunoId: z.string().cuid("Selecione um aluno."),
  tipoId: z.string().cuid("Selecione a infração."),
  data: z.string().min(1, "Data é obrigatória.").pipe(z.coerce.date()),
  dias: z.coerce.number({ message: "Digite um número válido para os dias." }).min(1, "Mínimo de 1 dia"),
  pontos: z.coerce.number({ message: "Digite um número válido para os pontos." }).max(0, "Os pontos devem ser negativos (ex: -5)"),
  detalhes: z.string().trim().min(5, "A descrição deve ter no mínimo 5 caracteres."),
  quemAplicouId: z.string().optional().nullable(),
  quemAplicouNome: z.string().optional().nullable(),
});

export async function createSuspensao(prevState: any, formData: FormData) {
  try {
    const user = await getCurrentUserWithRelations();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Acesso negado.");
    }

    const quemAplicouIdRaw = formData.get("quemAplicouId") as string;
    const quemAplicouNomeRaw = formData.get("quemAplicouNome") as string;

    let finalQuemAplicouId = null;
    let finalQuemAplicouNome = null;

    if (quemAplicouIdRaw === 'AUTOR_LOGADO') {
      finalQuemAplicouId = user.id;
    } else if (quemAplicouIdRaw) {
      finalQuemAplicouId = quemAplicouIdRaw;
    } else {
      finalQuemAplicouNome = quemAplicouNomeRaw || null;
    }

    const validatedFields = SuspensaoSchema.safeParse({
      alunoId: formData.get("alunoId"),
      data: formData.get("data"),
      tipoId: formData.get("tipoId"),
      dias: formData.get("dias"),
      pontos: formData.get("pontos"),
      detalhes: formData.get("detalhes"),
      quemAplicouId: finalQuemAplicouId,
      quemAplicouNome: finalQuemAplicouNome
    });

    if (!validatedFields.success) {
      return { success: false, errors: validatedFields.error.flatten().fieldErrors };
    }

    const { alunoId, data, dias, pontos, detalhes, quemAplicouId, quemAplicouNome, tipoId } = validatedFields.data;

    await prisma.suspensao.create({
      data: {
        alunoId,
        tipoId,
        dataOcorrencia: data,
        dias,
        pontosRetirados: pontos,
        detalhes,
        quemAplicouId,
        quemAplicouNome,
        quemLancouId: user.id
      }
    });

    await recalcularConceitoAluno(alunoId);

    const alunoInfo = await prisma.perfilAluno.findUnique({ where: { id: alunoId }, include: { usuario: true }});
    if (alunoInfo?.usuarioId) {
      await criarNotificacao(
        alunoInfo.usuarioId,
        "⚠️ Você foi Suspenso",
        `Foi registrada uma suspensão de ${dias} dia(s) no seu histórico. Verifique os detalhes.`,
        "/aluno/perfil"
      );
    }

    revalidatePath("/admin/suspensoes"); 
    revalidatePath(`/admin/alunos/${alunoId}`);
    revalidateTag("classificacao_geral");

    return { success: true, message: "Suspensão aplicada com sucesso!" };

  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro interno ao aplicar suspensão." };
  }
}

export async function marcarSuspensaoComoVisualizada(suspensaoId: string) {
  try {
    await prisma.suspensao.update({
      where: { id: suspensaoId },
      data: { visualizadoEm: new Date() }
    });
    
    revalidatePath("/aluno/perfil"); 
    revalidatePath("/admin/suspensoes");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao marcar suspensão como lida:", error);
    return { success: false };
  }
}

export async function deleteSuspensao(id: string) {
  try {
    const suspensao = await prisma.suspensao.findUnique({
      where: { id },
      select: { alunoId: true }
    });

    if (!suspensao) return { success: false, message: "Suspensão não encontrada." };

    await prisma.suspensao.delete({
      where: { id }
    });

    await recalcularConceitoAluno(suspensao.alunoId);

    revalidatePath("/admin/suspensoes");
    revalidatePath(`/admin/alunos/${suspensao.alunoId}`);
    revalidateTag("classificacao_geral");

    return { success: true, message: "Suspensão removida com sucesso!" };
  } catch (error) {
    console.error("Erro ao apagar suspensão:", error);
    return { success: false, message: "Erro interno ao apagar suspensão." };
  }
}

export async function updateSuspensao(id: string, formData: FormData) {
  try {
    const user = await getCurrentUserWithRelations();
    if (!user || user.role !== "ADMIN") throw new Error("Acesso negado.");

    const quemAplicouIdRaw = formData.get("quemAplicouId") as string;
    const quemAplicouNomeRaw = formData.get("quemAplicouNome") as string;

    let finalQuemAplicouId = null;
    let finalQuemAplicouNome = null;

    if (quemAplicouIdRaw === 'AUTOR_LOGADO') {
      finalQuemAplicouId = user.id;
    } else if (quemAplicouIdRaw) {
      finalQuemAplicouId = quemAplicouIdRaw;
    } else {
      finalQuemAplicouNome = quemAplicouNomeRaw || null;
    }

    const validatedFields = SuspensaoSchema.safeParse({
      alunoId: formData.get("alunoId"),
      data: formData.get("data"),
      tipoId: formData.get("tipoId"),
      dias: formData.get("dias"),
      pontos: formData.get("pontos"),
      detalhes: formData.get("detalhes"),
      quemAplicouId: finalQuemAplicouId,
      quemAplicouNome: finalQuemAplicouNome
    });

    if (!validatedFields.success) {
      return { success: false, errors: validatedFields.error.flatten().fieldErrors };
    }

    const { alunoId, data, dias, pontos, detalhes, quemAplicouId, quemAplicouNome, tipoId } = validatedFields.data;

    const suspensaoAntiga = await prisma.suspensao.findUnique({ where: { id }, select: { alunoId: true } });

    const suspensaoNova = await prisma.suspensao.update({
      where: { id },
      data: {
        alunoId,
        dataOcorrencia: data,
        dias,
        pontosRetirados: pontos,
        detalhes,
        tipoId,
        quemAplicouId,
        quemAplicouNome
      }
    });

    if (suspensaoAntiga && suspensaoAntiga.alunoId !== alunoId) {
      await recalcularConceitoAluno(suspensaoAntiga.alunoId);
      revalidatePath(`/admin/alunos/${suspensaoAntiga.alunoId}`);
    }
    
    await recalcularConceitoAluno(alunoId);

    revalidatePath("/admin/suspensoes");
    revalidatePath(`/admin/alunos/${alunoId}`);
    revalidateTag("classificacao_geral");
    
    return { success: true, message: "Suspensão atualizada com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar suspensão:", error);
    return { success: false, message: "Erro interno ao atualizar suspensão." };
  }
}