"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserWithRelations } from "@/lib/auth";
import { recalcularConceitoAluno } from "@/lib/conceitoUtils";

import { criarNotificacao } from "@/actions/notificacoes"; 
import { enviarNotificacaoPush } from "@/actions/push-actions";

export interface FormState {
  errors?: {
    alunoIds?: string[];
    tipoId?: string[];
    data?: string[];
    pontos?: string[];
    detalhes?: string[];
    quemAnotouId?: string[];
    quemAnotouNome?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
}

const AnotacaoSchema = z.object({
  alunoIds: z.array(z.string().cuid()).min(1, "Selecione pelo menos um aluno."),
  tipoId: z.string().min(1, "Selecione o tipo de anotação."),
  data: z.string().min(1, "Data é obrigatória.").pipe(z.coerce.date()),
  pontos: z.string().min(1, "Pontos são obrigatórios.").pipe(z.coerce.number()),
  detalhes: z.string().trim().min(3, "A descrição deve ter no mínimo 3 caracteres."),
  quemAnotouId: z.string().optional().nullable(),
  quemAnotouNome: z.string().optional().nullable(),
});

const UpdateAnotacaoSchema = AnotacaoSchema.omit({ alunoIds: true });

async function checkAdminPermission() {
  const user = await getCurrentUserWithRelations();
  const allowedRoles = ["ADMIN", "INSTRUTOR"];
  
  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error("Acesso negado.");
  }
  return user;
}

export async function createAnotacao(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const user = await checkAdminPermission();

    const alunoIds = formData.getAll("alunoIds") as string[];
    const quemAnotouIdRaw = formData.get("quemAnotouId") as string;
    const quemAnotouNomeRaw = formData.get("quemAnotouNome") as string;

    let finalQuemAnotouId: string | null = null;
    let finalQuemAnotouNome: string | null = null;

    if (quemAnotouIdRaw === 'AUTOR_LOGADO') {
      finalQuemAnotouId = user.id;
    } else if (quemAnotouIdRaw) {
      finalQuemAnotouId = quemAnotouIdRaw;
    } else {
      finalQuemAnotouNome = quemAnotouNomeRaw || null;
    }
    
    const validatedFields = AnotacaoSchema.safeParse({
      alunoIds,
      tipoId: formData.get("tipoId"),
      data: formData.get("data"),
      pontos: formData.get("pontos"),
      detalhes: formData.get("detalhes"),
      quemAnotouId: finalQuemAnotouId,
      quemAnotouNome: finalQuemAnotouNome
    });

    if (!validatedFields.success) {
      return { 
        success: false, 
        errors: validatedFields.error.flatten().fieldErrors 
      };
    }

    const { tipoId, data, pontos: pontosFormulario, detalhes, quemAnotouId, quemAnotouNome } = validatedFields.data;

    const usuariosParaNotificar: string[] = [];

    for (const alunoId of alunoIds) {
      const alunoInfo = await prisma.perfilAluno.findUnique({
        where: { id: alunoId },
        include: { usuario: true } 
      });

      if (!alunoInfo) continue;

      if (alunoInfo.usuario?.id) {
        usuariosParaNotificar.push(alunoInfo.usuario.id);
      }

      const ultimaPromocao = await prisma.cargoHistory.findFirst({
        where: { alunoId: alunoId },
        orderBy: { dataInicio: "desc" }
      });

      if (ultimaPromocao) {
        const dataPromocao = new Date(ultimaPromocao.dataInicio);
        const dataLancamento = new Date(data);
        dataPromocao.setHours(0, 0, 0, 0);
        dataLancamento.setHours(0, 0, 0, 0);

        if (dataLancamento < dataPromocao) {
          const nome = alunoInfo.nomeDeGuerra || "Aluno";
          return { 
            success: false, 
            message: `BLOQUEADO: A data (${dataLancamento.toLocaleDateString()}) é anterior à promoção de ${nome}.` 
          };
        }
      }
    }

    const tipoAnotacao = await prisma.tipoDeAnotacao.findUnique({
      where: { id: tipoId },
    });

    if (!tipoAnotacao) {
        return { success: false, message: "Tipo de anotação inválido." }; 
    }

    let pontosFinais = pontosFormulario;
    
    if (tipoAnotacao.abertoCoordenacao) {
      if (tipoAnotacao.categoriaAberto === "ELOGIO" && pontosFinais <= 0) 
        return { success: false, message: "Elogios devem ter pontuação positiva." }; 
      if (tipoAnotacao.categoriaAberto === "PUNICAO" && pontosFinais >= 0) 
        return { success: false, message: "Punições devem ter pontuação negativa." }; 
    } else {
      pontosFinais = Number(tipoAnotacao.pontos) || 0;
    }

    const anotacoesDataPromises = alunoIds.map(async (alunoId) => {
      const blocoCargo = await prisma.cargoHistory.findFirst({
        where: {
          alunoId: alunoId,
          dataInicio: { lte: data }, 
          OR: [
            { dataFim: { gte: data } },
            { dataFim: null }          
          ]
        },
        select: { id: true } 
      });

      return {
        alunoId,
        tipoId,
        data,
        pontos: pontosFinais,
        detalhes,
        autorId: user.id,
        quemAnotouId: quemAnotouId || user.id,
        quemAnotouNome: quemAnotouNome,
        blocoCargoId: blocoCargo?.id || null 
      };
    });

    const anotacoesData = await Promise.all(anotacoesDataPromises);

    await prisma.$transaction(
      anotacoesData.map(data => prisma.anotacao.create({ data }))
    );

    await Promise.allSettled(
      alunoIds.map(id => recalcularConceitoAluno(id))
    );

    try {
      const linkNotif = "/anotacoes"; 

      for (const usuarioId of usuariosParaNotificar) {
        await criarNotificacao(
          usuarioId, 
          "Nova Anotação", 
          `Foi registada uma nova anotação (${tipoAnotacao.titulo}) no seu histórico.`, 
          linkNotif
        );
        
        const naoLidasCount = await prisma.notificacao.count({
          where: { 
            usuarioId: usuarioId, 
            lida: false, 
            titulo: "Nova Anotação" 
          }
        });

        let pushTitulo = "Nova Anotação";
        let pushMensagem = `Foi registada uma nova anotação (${tipoAnotacao.titulo}).`;

        if (naoLidasCount > 1) {
          pushTitulo = `${naoLidasCount} Novas Anotações`;
          pushMensagem = `Você possui ${naoLidasCount} anotações não lidas no portal. Clique para ver os detalhes.`;
        }

        await enviarNotificacaoPush(usuarioId, {
          titulo: pushTitulo,
          mensagem: pushMensagem,
          url: linkNotif,
          tag: "alerta-anotacao"
        });
      }
    } catch (notifError) {
      console.error("Anotação salva, mas erro ao enviar notificações:", notifError);
    }

  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro interno ao criar anotação." }; 
  }

  revalidatePath("/admin/anotacoes");
  revalidatePath("/admin/classificacao-geral");
  revalidatePath("/admin/alunos");
  
  return { success: true, message: "Anotação registada com sucesso!" }; 
}

export async function updateAnotacao(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const user = await checkAdminPermission();

    const quemAnotouIdRaw = formData.get("quemAnotouId") as string;
    const quemAnotouNomeRaw = formData.get("quemAnotouNome") as string;

    let finalQuemAnotouId: string | null = null;
    let finalQuemAnotouNome: string | null = null;

    if (quemAnotouIdRaw === 'AUTOR_LOGADO') {
      finalQuemAnotouId = user.id;
    } else if (quemAnotouIdRaw) {
      finalQuemAnotouId = quemAnotouIdRaw;
    } else {
      finalQuemAnotouNome = quemAnotouNomeRaw || null;
    }

    const validatedFields = UpdateAnotacaoSchema.safeParse({
        tipoId: formData.get("tipoId"),
        data: formData.get("data"),
        pontos: formData.get("pontos"),
        detalhes: formData.get("detalhes"),
        quemAnotouId: finalQuemAnotouId,
        quemAnotouNome: finalQuemAnotouNome
    });

    if (!validatedFields.success) {
        return { 
          success: false, 
          errors: validatedFields.error.flatten().fieldErrors 
        };
    }

    const { tipoId, data, pontos, detalhes, quemAnotouId, quemAnotouNome } = validatedFields.data;

    const anotacaoExistente = await prisma.anotacao.findUnique({
        where: { id },
        select: { alunoId: true }
    });

    if (!anotacaoExistente) return { success: false, message: "Anotação não encontrada." }; // <-- Corrigido

    await prisma.anotacao.update({
        where: { id },
        data: {
            tipoId,
            data,
            pontos,
            detalhes,
            quemAnotouId: quemAnotouId || null,
            quemAnotouNome: quemAnotouNome || null
        }
    });

    await recalcularConceitoAluno(anotacaoExistente.alunoId);

    revalidatePath(`/admin/alunos/${anotacaoExistente.alunoId}`);
    revalidatePath("/admin/classificacao-geral");

    return { success: true, message: "Anotação atualizada com sucesso." };

  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao atualizar anotação." };
  }
}

export async function deleteAnotacao(anotacaoId: string, alunoId?: string) {
  try {
    await checkAdminPermission();

    let targetAlunoId = alunoId;

    if (!targetAlunoId) {
        const anotacao = await prisma.anotacao.findUnique({ 
            where: { id: anotacaoId }, 
            select: { alunoId: true } 
        });
        if (anotacao) targetAlunoId = anotacao.alunoId;
    }

    await prisma.anotacao.delete({
        where: { id: anotacaoId }
    });


    if (targetAlunoId) {
        const aluno = await prisma.perfilAluno.findUnique({ 
          where: { id: targetAlunoId }, 
          select: { usuarioId: true } 
        });

        if (aluno?.usuarioId) {
          const ultimaNotificacaoAnotacao = await prisma.notificacao.findFirst({
            where: { 
              usuarioId: aluno.usuarioId, 
              titulo: "Nova Anotação", 
              lida: false 
            },
            orderBy: { createdAt: 'desc' }
          });

          if (ultimaNotificacaoAnotacao) {
             await prisma.notificacao.delete({ 
               where: { id: ultimaNotificacaoAnotacao.id } 
             });
          }
        }

        await recalcularConceitoAluno(targetAlunoId);
        revalidatePath(`/admin/alunos/${targetAlunoId}`);
    }

    revalidatePath("/admin/classificacao-geral");
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao excluir anotação." };
  }
}