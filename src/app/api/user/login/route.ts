// src/app/api/user/login/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cpf, password } = body;

    if (!cpf || !password) {
      return NextResponse.json({ error: 'CPF e senha são obrigatórios' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { cpf } });
    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("A variável de ambiente JWT_SECRET não está definida.");
    }
    
    const token = jwt.sign(
      { userId: user.id, nome: user.nome },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return NextResponse.json({ message: 'Login bem-sucedido!', token });
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}