// src/app/api/user/create/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cpf, password, nome, numero, cargo } = body;

    if (!cpf || !password || !nome) {
      return NextResponse.json({ error: 'CPF, senha e nome são obrigatórios' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { cpf } });
    if (existingUser) {
      return NextResponse.json({ error: 'Um usuário com este CPF já existe' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        cpf,
        password: hashedPassword,
        nome,
        numero,
        cargo,
      },
    });

    const  userWithoutPassword  = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}