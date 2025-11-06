"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserWithRelations } from "@/lib/auth";
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { put, del } from "@vercel/blob";
import { Prisma } from "@prisma/client"; 

export type AlunoState = {
  errors?: {
    nome?: string[];
    cpf?: string[];
    email?: string[];
    password?: string[];
    numero?: string[];
    nomeDeGuerra?: string[];
    companhia?: string[];
    cargoNome?: string[];
    cargoOutro?: string[];
    fotoUrl?: string[];
  };
  message?: string;
} | undefined;

const baseAlunoSchema = z.object({
  nome: z.string().min(3, "O nome completo é obrigatório."),
  cpf: z.string().length(11, "O CPF deve ter 11 dígitos."),
  email: z.string().email("Formato de e-mail inválido.").optional().or(z.literal('')),
  numero: z.string().min(1, "O número do aluno é obrigatório."),
  nomeDeGuerra: z.string().min(1, "O nome de guerra é obrigatório."),
  companhia: z.string().min(1, "A companhia é obrigatória."),
  cargoNome: z.string().min(1, "O cargo é obrigatório."), 
  cargoOutro: z.string().optional(),
  ingressoForaDeData: z.string().optional(),
  fotoUrl: z
    .instanceof(File)
    .refine((file) => !file || file.size === 0 || file.type.startsWith("image/"), "O arquivo precisa ser uma imagem.")
    .optional(),
}).refine(data => {
  if (data.cargoNome === 'OUTRO') {
    return !!data.cargoOutro && data.cargoOutro.length > 0;
  }
  return true;
}, {
  message: "O campo 'Outro Cargo' é obrigatório quando 'Outro' é selecionado.",
  path: ["cargoOutro"],
});



const UpdateAlunoSchema = baseAlunoSchema.extend({
  id: z.string(),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres.").optional().or(z.literal('')),
});



const CreateAlunoSchema = baseAlunoSchema.extend({
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
});

export async function createAluno(prevState: AlunoState, formData: FormData) {
  const user = await getCurrentUserWithRelations();
  if (!user || user.role !== 'ADMIN') {
    return { message: "Acesso negado." };
  }

  const validatedFields = CreateAlunoSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  
  const { cargoNome, cargoOutro, fotoUrl, password, ingressoForaDeData, ...data } = validatedFields.data;
  const finalCargoNome = cargoNome === 'OUTRO' ? cargoOutro! : cargoNome;
  const conceitoInicial = ingressoForaDeData === 'on' ? '6.0' : '7.0';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let uploadedFotoUrl: string | null = null;

    if (fotoUrl && fotoUrl.size > 0) {
      const blob = await put(`alunos/${fotoUrl.name}`, fotoUrl, { access: 'public', addRandomSuffix: true });
      uploadedFotoUrl = blob.url;
    }

    await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        cargo: { connect: { nome: finalCargoNome } },
        conceito: conceitoInicial,
        fotoUrl: uploadedFotoUrl,
        status: "ATIVO", 
        role: "ALUNO",     
      },
    });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: unknown }).code === 'P2002') {
      return { message: 'Já existe um usuário com este CPF ou Número.' };
    }
    console.error("Erro ao criar aluno:", error);
    return { message: "Ocorreu um erro ao criar o aluno." };
  }

  revalidatePath("/admin/alunos");
  redirect("/admin/alunos");
}


export async function updateAluno(prevState: AlunoState, formData: FormData) {
  const user = await getCurrentUserWithRelations();
  if (!user || user.role !== 'ADMIN') {
    return { message: "Acesso negado." };
  }

  const formObject = Object.fromEntries(formData.entries());

  if (!formObject.id) formObject.id = formData.get('id') as string;

  const validatedFields = UpdateAlunoSchema.safeParse(formObject);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  
  const { id, password, fotoUrl, cargoNome, cargoOutro, ...dataToUpdateRaw } = validatedFields.data;
  
  try {
    const alunoAtual = await prisma.user.findUnique({ where: { id }, include: { cargo: true } });
    if (!alunoAtual) {
      return { message: "Aluno não encontrado." };
    }
    

    const dataForPrisma: Prisma.UserUpdateInput = {
      ...dataToUpdateRaw, 
    };


    if (password) {
      dataForPrisma.password = await bcrypt.hash(password, 10);
    }


    if (fotoUrl && fotoUrl.size > 0) {
      if (alunoAtual.fotoUrl) {
        await del(alunoAtual.fotoUrl);
      }
      const blob = await put(`alunos/${fotoUrl.name}`, fotoUrl, { access: 'public', addRandomSuffix: true });
      dataForPrisma.fotoUrl = blob.url;
    }


    const finalCargoNome = cargoNome === 'OUTRO' ? cargoOutro! : cargoNome;
       if (alunoAtual.cargo?.nome !== finalCargoNome) {
      dataForPrisma.cargo = {
        connect: {
          nome: finalCargoNome, 
        },
      };

      dataForPrisma.conceito = '7.0';
      await prisma.anotacao.deleteMany({ where: { alunoId: id } });
    }

  
    await prisma.user.update({
      where: { id },
      data: dataForPrisma,
    });

  } catch (error: unknown) {
    console.error("Erro ao atualizar o aluno:", error);
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: unknown }).code === 'P2002') {
        return { message: 'Já existe um usuário com este CPF ou Número.' };
    }
    return { message: "Ocorreu um erro ao atualizar o aluno." };
  }

  revalidatePath("/admin/alunos");
  redirect("/admin/alunos");
}


export async function deleteAluno(formData: FormData) {
  const user = await getCurrentUserWithRelations();
  if (!user || user.role !== 'ADMIN') {
    throw new Error("Acesso negado.");
  }

  const id = formData.get('id') as string;
  const fotoUrl = formData.get('fotoUrl') as string | null;

  if (!id) {
    throw new Error("ID do aluno não fornecido.");
  }

  try {
    if (fotoUrl) {
      await del(fotoUrl);
    }
    
    await prisma.anotacao.deleteMany({ where: { alunoId: id } });
    await prisma.user.delete({ where: { id } });

    revalidatePath("/admin/alunos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar aluno:", error);
    return { success: false, message: "Erro ao deletar o aluno." };
  }
}