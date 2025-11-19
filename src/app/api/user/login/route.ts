import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { cpf, password } = await req.json();


    if (!cpf || !password) {
      return NextResponse.json(
        { error: 'CPF e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const user = await prisma.usuario.findUnique({
      where: { cpf },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }


    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error('A variável de ambiente JWT_SECRET não está definida.');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, nome: user.nome }, 
      secret,
      { expiresIn: '1d' } 
    );

     const cookieStore = await cookies(); 
    
    cookieStore.set('auth_token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict', 
      maxAge: 60 * 60 * 24 , 
      path: '/', 
    });


    let redirectUrl = '/dashboard';

    switch (user.role) {
      case 'ADMIN':
        redirectUrl = '/admin';
        break;

      default:
        redirectUrl = '/dashboard';
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Login realizado com sucesso.',
      user: userWithoutPassword,
      redirectUrl
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao processar o login.' },
      { status: 500 }
    );
  }
}