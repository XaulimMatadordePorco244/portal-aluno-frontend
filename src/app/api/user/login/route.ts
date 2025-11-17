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


    const cleanedCpf = cpf.replace(/\D/g, '');

    const user = await prisma.usuario.findUnique({
      where: { cpf: cleanedCpf },
      include: { cargo: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não está definida');
      return NextResponse.json({ error: 'Erro de configuração do servidor' }, { status: 500 });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        nome: user.nome,
        nomeDeGuerra: user.nomeDeGuerra,
        cargoId: user.cargoId,
        cargo: user.cargo,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({ 
      message: 'Login bem-sucedido!',
      user: {
        id: user.id,
        nome: user.nome,
        nomeDeGuerra: user.nomeDeGuerra,
        role: user.role
      }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, 
      path: '/',
    });

    return response;

  } catch (error) {
    console.error("Erro no processo de login:", error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}