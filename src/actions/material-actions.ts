"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { TipoInteracaoMaterial, Role } from "@prisma/client";
import { notificarTodosAlunosEscala } from "./push-actions"; 

export async function criarMaterialAuxiliar(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return { success: false, message: "Acesso negado." };

    const titulo = formData.get("titulo") as string;
    const descricao = formData.get("descricao") as string;
    const arquivos = formData.getAll("arquivos") as File[]; 

    if (!titulo || arquivos.length === 0) {
      return { success: false, message: "Título e pelo menos um arquivo são obrigatórios." };
    }

    const uploadsPromises = arquivos.map(async (file) => {
      const filename = `materiais/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: true,
      });

      return {
        nome: file.name,
        url: blob.url,
        tipo: file.type || "application/octet-stream",
        tamanho: file.size,
      };
    });

    const arquivosSalvos = await Promise.all(uploadsPromises);

    const novoMaterial = await prisma.materialAuxiliar.create({
      data: {
        titulo,
        descricao,
        arquivos: {
          create: arquivosSalvos,
        },
      },
    });

    const alunos = await prisma.usuario.findMany({
      where: { role: Role.ALUNO, status: "ATIVO" },
      select: { id: true }
    });

    if (alunos.length > 0) {
      const notificacoesData = alunos.map((aluno) => ({
        usuarioId: aluno.id,
        titulo: "Novo Material Auxiliar",
        mensagem: `O material "${titulo}" foi adicionado. Clique para acessar.`,
        link: `/aluno/materiais/${novoMaterial.id}`,
        lida: false,
      }));

      await prisma.notificacao.createMany({
        data: notificacoesData,
      });


      await notificarTodosAlunosEscala({
        titulo: "Novo Material Disponível 📚",
        mensagem: `${titulo} já está disponível para estudo.`,
        url: `/aluno/materiais/${novoMaterial.id}`,
        tag: `material-${novoMaterial.id}`
      });
    }

    revalidatePath("/admin/materiais");
    revalidatePath("/aluno/materiais");
    return { success: true, message: "Material criado e alunos notificados!" };

  } catch (error) {
    console.error("Erro ao criar material:", error);
    return { success: false, message: "Erro interno ao criar material." };
  }
}

export async function registrarInteracaoMaterial(
  materialId: string, 
  tipo: TipoInteracaoMaterial, 
  arquivoId?: string
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ALUNO") return { success: false };

    if (tipo === "VISUALIZACAO") {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const jaViuHoje = await prisma.interacaoMaterial.findFirst({
        where: {
          materialId,
          usuarioId: user.userId,
          tipo: "VISUALIZACAO",
          createdAt: { gte: hoje }
        }
      });

      if (jaViuHoje) return { success: true }; 
    }

    await prisma.interacaoMaterial.create({
      data: {
        tipo,
        materialId,
        usuarioId: user.userId,
        arquivoId: arquivoId || null,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao registrar interação:", error);
    return { success: false };
  }
}


export async function excluirMaterialAuxiliar(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return { success: false, message: "Acesso negado." };

    const material = await prisma.materialAuxiliar.findUnique({
      where: { id },
      include: { arquivos: true }
    });

    if (!material) return { success: false, message: "Material não encontrado." };

    const urlsParaDeletar = material.arquivos.map(arq => arq.url);
    if (urlsParaDeletar.length > 0) {
      await del(urlsParaDeletar).catch(e => console.error("Erro ao limpar Blob:", e));
    }

    await prisma.materialAuxiliar.delete({
      where: { id }
    });

    revalidatePath("/admin/materiais");
    revalidatePath("/aluno/materiais");
    return { success: true, message: "Material excluído com sucesso." };

  } catch (error) {
    console.error("Erro ao excluir material:", error);
    return { success: false, message: "Erro interno ao excluir material." };
  }
}