"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserWithRelations } from "@/lib/auth";
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { put, del } from "@vercel/blob"; 
import { 
  AptidaoFisicaStatus, 
  GeneroUsuario, 
  tipagemSanguinea, 
  Role, 
  StatusUsuario,
  CargoHistoryStatus,
  SerieEscolar 
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
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;


export async function createAluno(prevState: AlunoState, formData: FormData): Promise<AlunoState> {
  const user = await getCurrentUserWithRelations();
  if (!user || user.role !== 'ADMIN') return { message: "Acesso negado." };

  const rawData = Object.fromEntries(formData.entries());
  
  const fotoPerfil = formData.get("fotoPerfil") as File | null;

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
    let fotoUrl: string | null = null;

    if (fotoPerfil && fotoPerfil.size > 0) {
      const filename = `alunos/${Date.now()}-${fotoPerfil.name}`; 
      const blob = await put(filename, fotoPerfil, {
        access: 'public',
        addRandomSuffix: true
      });
      fotoUrl = blob.url;
    }

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
          fotoUrl: fotoUrl, 
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
          
          escolaId: data.escola,
          serieEscolar: data.serieEscolar as SerieEscolar | undefined,
          
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

  } catch (error: unknown) {
    console.error("Erro ao criar aluno:", error);
    
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } };
      if (prismaError.code === 'P2002') {
        if (prismaError.meta?.target?.includes('cpf')) {
          return { message: 'CPF já cadastrado.' };
        }
        if (prismaError.meta?.target?.includes('numero')) {
          return { message: 'Número já em uso.' };
        }
      }
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
  const fotoPerfil = formData.get("fotoPerfil") as File | null; 
  
  const updateSchema = alunoSchema.partial().extend({ id: z.string() });
  
  const validated = updateSchema.safeParse({ ...rawData, id });

  if (!validated.success) {
    return { 
      errors: validated.error.flatten().fieldErrors, 
      message: "Erro de validação" 
    };
  }
  
  const data = validated.data;

  try {
     const alunoAtual = await prisma.usuario.findUnique({ where: { id } });
     
     let novaFotoUrl: string | undefined = undefined;

     if (fotoPerfil && fotoPerfil.size > 0) {
        if (alunoAtual?.fotoUrl) {
            await del(alunoAtual.fotoUrl).catch(err => console.error("Erro ao deletar foto antiga:", err));
        }

        const filename = `alunos/${Date.now()}-${fotoPerfil.name}`;
        const blob = await put(filename, fotoPerfil, {
            access: 'public',
            addRandomSuffix: true
        });
        novaFotoUrl = blob.url;
     }

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
                fotoUrl: novaFotoUrl,
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

                escolaId: data.escola,
                serieEscolar: data.serieEscolar as SerieEscolar | undefined,
                
                endereco: data.endereco,

                termoResponsabilidadeAssinado: data.termoResponsabilidadeAssinado !== undefined ? !!data.termoResponsabilidadeAssinado : undefined,
                fazCursoExterno: data.fazCursoExterno !== undefined ? !!data.fazCursoExterno : undefined,
                cursoExternoDescricao: data.cursoExternoDescricao,
            }
        });
     });
  } catch (error: unknown) {
      console.error("Erro ao atualizar aluno:", error);
      return { message: "Erro ao atualizar dados." };
  }

  revalidatePath("/admin/alunos");
  redirect("/admin/alunos");
}

export async function inativarAluno(id: string) {
  const user = await getCurrentUserWithRelations();
  if (!user || user.role !== 'ADMIN') {
    return { success: false, message: "Acesso negado." };
  }

  try {
    const usuarioAlvo = await prisma.usuario.findUnique({
        where: { id },
        include: { perfilAluno: true }
    });

    if (!usuarioAlvo) {
        return { success: false, message: "Aluno não encontrado." };
    }

    await prisma.$transaction(async (tx) => {
        await tx.usuario.update({
            where: { id },
            data: { status: StatusUsuario.INATIVO }
        });

        if (usuarioAlvo.perfilAluno) {
            await tx.cargoHistory.updateMany({
                where: { 
                    alunoId: usuarioAlvo.perfilAluno.id,
                    status: CargoHistoryStatus.ATIVO
                },
                data: { 
                    status: CargoHistoryStatus.FECHADO,
                    dataFim: new Date(),
                    motivo: "Desligamento / Inativação da Instituição"
                }
            });
        }
    });

    revalidatePath("/admin/alunos");
    return { success: true, message: "Aluno desligado e histórico preservado com sucesso." };

  } catch (error: unknown) {
    console.error("Erro ao inativar aluno:", error);
    return { success: false, message: "Erro interno ao tentar inativar o aluno." };
  }
}

export async function reativarAluno(id: string, modo: 'ZERAR' | 'RESTAURAR') {
  const user = await getCurrentUserWithRelations();
  if (!user || user.role !== 'ADMIN') {
    return { success: false, message: "Acesso negado." };
  }

  try {
    const usuarioAlvo = await prisma.usuario.findUnique({
      where: { id },
      include: { perfilAluno: true }
    });

    if (!usuarioAlvo || !usuarioAlvo.perfilAluno) {
      return { success: false, message: "Aluno não encontrado." };
    }

    const perfilId = usuarioAlvo.perfilAluno.id;

    await prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id },
        data: { status: StatusUsuario.ATIVO }
      });

      if (modo === 'RESTAURAR') {
        const ultimoBloco = await tx.cargoHistory.findFirst({
          where: { alunoId: perfilId, status: CargoHistoryStatus.FECHADO },
          orderBy: { dataInicio: 'desc' }
        });

        if (ultimoBloco) {
          await tx.cargoHistory.update({
            where: { id: ultimoBloco.id },
            data: {
              status: CargoHistoryStatus.ATIVO,
              dataFim: null,
              motivo: ultimoBloco.motivo ? ultimoBloco.motivo + " | Reativado" : "Reativado"
            }
          });
          
          await tx.perfilAluno.update({
            where: { id: perfilId },
            data: { cargoId: ultimoBloco.cargoId }
          });
        }
      } 
      else if (modo === 'ZERAR') {
        const cargoBase = await tx.cargo.findFirst({
          orderBy: { precedencia: 'asc' }
        });

        if (cargoBase) {
          await tx.cargoHistory.create({
            data: {
              alunoId: perfilId,
              cargoId: cargoBase.id,
              cargoNomeSnapshot: cargoBase.nome,
              conceitoInicial: 7.0,
              conceitoAtual: 7.0,
              status: CargoHistoryStatus.ATIVO,
              motivo: "Reativado (Reinício de Carreira)"
            }
          });

          await tx.perfilAluno.update({
            where: { id: perfilId },
            data: { 
              cargoId: cargoBase.id,
              conceitoInicial: "7.0",
              conceitoAtual: "7.0"
            }
          });
        }
      }
    });

    revalidatePath("/admin/alunos");
    return { 
      success: true, 
      message: `Aluno reativado com sucesso (${modo === 'ZERAR' ? 'Carreira Reiniciada' : 'Histórico Restaurado'}).` 
    };

  } catch (error) {
    console.error("Erro ao reativar aluno:", error);
    return { success: false, message: "Erro interno ao tentar reativar o aluno." };
  }
}