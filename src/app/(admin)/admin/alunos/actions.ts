"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getFullCurrentUser } from "@/lib/auth";
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { put } from "@vercel/blob"; 

export type AlunoState = {
    errors?: {
        nome?: string[];
        cpf?: string[];
        email?: string[];
        password?: string[];
        numero?: string[];
        nomeDeGuerra?: string[];
        companhia?: string[];
        cargo?: string[]; 
        fotoUrl?: string[]; 
    };
    message?: string;
} | undefined;

const AlunoSchema = z.object({
    nome: z.string().min(3, "O nome completo é obrigatório."),
    cpf: z.string().length(11, "O CPF deve ter 11 dígitos."),
    email: z.string().email("Formato de e-mail inválido.").optional().or(z.literal('')),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
    numero: z.string().min(1, "O número do aluno é obrigatório."),
    nomeDeGuerra: z.string().min(1, "O nome de guerra é obrigatório."),
    companhia: z.string().min(1, "A companhia é obrigatória."),
    cargo: z.string().min(1, "O cargo é obrigatório."),
    fotoUrl: z
        .instanceof(File)
        .refine((file) => file.size === 0 || file.type.startsWith("image/"), "O arquivo precisa ser uma imagem.")
        .optional(),
});

export async function createAluno(prevState: AlunoState, formData: FormData) {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return { message: "Acesso negado." };
    }

    const validatedFields = AlunoSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { nome, cpf, email, password, numero, nomeDeGuerra, companhia, cargo, fotoUrl } = validatedFields.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        let uploadedFotoUrl: string | null = null;

      
        if (fotoUrl && fotoUrl.size > 0) {

            const blob = await put(`alunos/${fotoUrl.name}`, fotoUrl, {
                access: 'public',
                addRandomSuffix: true,
            });
            uploadedFotoUrl = blob.url;
        }

        await prisma.user.create({
            data: {
                nome,
                cpf,
                email: email || null,
                password: hashedPassword,
                numero,
                nomeDeGuerra,
                companhia,
                cargo, // Agora vem do formulário
                fotoUrl: uploadedFotoUrl, // Salva a URL da foto
                status: "ATIVO",
                role: "ALUNO",
            },
        });
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: unknown }).code === 'P2002') {
            return { message: 'Já existe um usuário com este CPF.' };
        }
        console.error(error);
        return { message: "Ocorreu um erro ao criar o aluno." };
    }

    revalidatePath("/admin/alunos");
    redirect("/admin/alunos");
}