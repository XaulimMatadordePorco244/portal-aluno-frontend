"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserWithRelations } from "@/lib/auth";
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { 
  AptidaoFisicaStatus, 
  GeneroUsuario, 
  tipagemSanguinea, 
  Role, 
  StatusUsuario,
  CargoHistoryStatus 
} from "@prisma/client";

const alunoSchema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos"),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
  rg: z.string().optional(),
  rgEstadoEmissor: z.string().optional(),
  dataNascimento: z.string().optional(),
  genero: z.nativeEnum(GeneroUsuario).optional(),
  telefone: z.string().optional(),

  numero: z.string().min(1, "Número obrigatório"),
  nomeDeGuerra: z.string().min(1, "Nome de guerra obrigatório"),
  companhiaId: z.string().min(1, "Companhia obrigatória"),
  cargoId: z.string().min(1, "Cargo obrigatório"),
  ingressoForaDeData: z.string().optional(),

  tipagemSanguinea: z.nativeEnum(tipagemSanguinea).optional(),
  aptidaoFisicaStatus: z.nativeEnum(AptidaoFisicaStatus).optional(),
  aptidaoFisicaObs: z.string().optional(),
  aptidaoFisicaLaudo: z.string().optional(), 

  escola: z.string().optional(),
  serieEscolar: z.string().optional(),
  endereco: z.string().optional(),

  
  termoResponsabilidadeAssinado: z.string().optional(), 
  fazCursoExterno: z.string().optional(), 
  cursoExternoDescricao: z.string().optional(),
});

export type AlunoState = {
  errors?: { [key: string]: string[] };
  message?: string;
} | undefined;

export async function createAluno(prevState: AlunoState, formData: FormData): Promise<AlunoState> {
  const user = await getCurrentUserWithRelations();
  if (!user || user.role !== 'ADMIN') return { message: "Acesso negado." };

  const rawData = Object.fromEntries(formData.entries());
  
  if (!rawData.email) delete rawData.email;
  if (!rawData.password) delete rawData.password;
  
  const validated = alunoSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Erro de validação nos campos.",
    };
  }

  const data = validated.data;
  const hashedPassword = await bcrypt.hash(data.password || "mudar123", 10);
  const conceitoInicial = data.ingressoForaDeData ? "6.0" : "7.0";

  try {
    await prisma.$transaction(async (tx) => {
      const novoUsuario = await tx.usuario.create({
        data: {
          nome: data.nome,
          cpf: data.cpf,
          email: data.email || null,
          password: hashedPassword,
          role: Role.ALUNO,
          status: StatusUsuario.ATIVO,
          rg: data.rg,
          rgEstadoEmissor: data.rgEstadoEmissor,
          dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : null,
          telefone: data.telefone,
          genero: data.genero,
        }
      });

      const novoPerfil = await tx.perfilAluno.create({
        data: {
          usuarioId: novoUsuario.id,
          numero: data.numero,
          nomeDeGuerra: data.nomeDeGuerra,
          companhiaId: data.companhiaId,
          cargoId: data.cargoId,
          conceitoInicial: conceitoInicial,
          conceitoAtual: conceitoInicial,
          anoIngresso: new Date().getFullYear(),
          foraDeData: !!data.ingressoForaDeData,
          
          tipagemSanguinea: data.tipagemSanguinea,
          aptidaoFisicaStatus: data.aptidaoFisicaStatus || AptidaoFisicaStatus.LIBERADO,
          aptidaoFisicaObs: data.aptidaoFisicaObs,
          aptidaoFisicaLaudo: !!data.aptidaoFisicaLaudo,
          
          escola: data.escola,
          serieEscolar: data.serieEscolar,
          endereco: data.endereco,
          
          termoResponsabilidadeAssinado: !!data.termoResponsabilidadeAssinado,
          fazCursoExterno: !!data.fazCursoExterno,
          cursoExternoDescricao: data.cursoExternoDescricao,
        }
      });

      if (data.cargoId) {
        const cargo = await tx.cargo.findUnique({ where: { id: data.cargoId } });
        if (cargo) {
            await tx.cargoHistory.create({
                data: {
                    alunoId: novoPerfil.id,
                    cargoId: data.cargoId,
                    cargoNomeSnapshot: cargo.nome,
                    conceitoInicial: parseFloat(conceitoInicial),
                    conceitoAtual: parseFloat(conceitoInicial),
                    status: CargoHistoryStatus.ATIVO,
                    motivo: "Ingresso na instituição"
                }
            });
        }
      }
    });

  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
        if (error.meta?.target?.includes('cpf')) return { message: 'CPF já cadastrado.' };
        if (error.meta?.target?.includes('numero')) return { message: 'Número já em uso.' };
    }
    return { message: "Erro ao salvar no banco de dados." };
  }

  revalidatePath("/admin/alunos");
  redirect("/admin/alunos");
}

export async function updateAluno(prevState: AlunoState, formData: FormData): Promise<AlunoState> {
  const id = formData.get("id") as string;
  if (!id) return { message: "ID não fornecido" };
  
  const rawData = Object.fromEntries(formData.entries());
  
  const updateSchema = alunoSchema.partial().extend({ id: z.string() });
  
  const validated = updateSchema.safeParse({ ...rawData, id });

  if (!validated.success) return { errors: validated.error.flatten().fieldErrors, message: "Erro de validação" };
  
  const data = validated.data;

  try {
     await prisma.$transaction(async (tx) => {
        await tx.usuario.update({
            where: { id },
            data: {
                nome: data.nome,
                email: data.email || undefined,
                rg: data.rg,
                rgEstadoEmissor: data.rgEstadoEmissor,
                dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : undefined,
                telefone: data.telefone,
                genero: data.genero,
                ...(data.password ? { password: await bcrypt.hash(data.password, 10) } : {})
            }
        });

        await tx.perfilAluno.update({
            where: { usuarioId: id },
            data: {
                numero: data.numero,
                nomeDeGuerra: data.nomeDeGuerra,
                companhiaId: data.companhiaId,
                cargoId: data.cargoId, 
                
                tipagemSanguinea: data.tipagemSanguinea,
                aptidaoFisicaStatus: data.aptidaoFisicaStatus,
                aptidaoFisicaObs: data.aptidaoFisicaObs,
                aptidaoFisicaLaudo: data.aptidaoFisicaLaudo !== undefined ? !!data.aptidaoFisicaLaudo : undefined,

                escola: data.escola,
                serieEscolar: data.serieEscolar,
                endereco: data.endereco,

                termoResponsabilidadeAssinado: data.termoResponsabilidadeAssinado !== undefined ? !!data.termoResponsabilidadeAssinado : undefined,
                fazCursoExterno: data.fazCursoExterno !== undefined ? !!data.fazCursoExterno : undefined,
                cursoExternoDescricao: data.cursoExternoDescricao,
            }
        });
     });
  } catch(error) {
      console.error(error);
      return { message: "Erro ao atualizar dados." };
  }

  revalidatePath("/admin/alunos");
  redirect("/admin/alunos");
}

export async function deleteAluno(id: string) {
  const user = await getCurrentUserWithRelations();
  if (!user || user.role !== 'ADMIN') {
    throw new Error("Acesso negado.");
  }

  if (!id) {
    throw new Error("ID do aluno não fornecido.");
  }

  try {
    const usuarioAlvo = await prisma.usuario.findUnique({
        where: { id },
        include: { perfilAluno: true }
    });

    if (!usuarioAlvo) {
        throw new Error("Aluno não encontrado.");
    }

    await prisma.$transaction(async (tx) => {
        if (usuarioAlvo.perfilAluno) {
            const perfilId = usuarioAlvo.perfilAluno.id;

            await tx.anotacao.deleteMany({ where: { alunoId: perfilId } });

            await tx.escalaItem.deleteMany({ where: { alunoId: perfilId } });

            await tx.feedback.deleteMany({ where: { alunoId: perfilId } });
            
        
        }

        await tx.usuario.delete({
            where: { id }
        });
    });

    revalidatePath("/admin/alunos");
    return { success: true, message: "Aluno excluído com sucesso." };

  } catch (error: any) {
    console.error("Erro ao deletar aluno:", error);
    if (error.code === 'P2003') {
        return { success: false, message: "Não é possível excluir: O aluno possui registros vinculados (ex: Responsável, CIs, etc)." };
    }
    return { success: false, message: "Erro ao excluir o aluno." };
  }
}