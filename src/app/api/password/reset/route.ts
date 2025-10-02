import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();


    if (!token || !password) {
      return NextResponse.json({ error: 'Dados incompletos. Token e senha são obrigatórios.' }, { status: 400 });
    }
     if (password.length < 6) {
        return NextResponse.json({ error: 'A senha deve ter no mínimo 6 caracteres.' }, { status: 400 });
    }


    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');


    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gte: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Token inválido ou expirado. Por favor, solicite um novo link.' }, { status: 400 });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return NextResponse.json({ message: 'Senha redefinida com sucesso.' });

  } catch (error) {
    console.error("Erro na rota /api/password/reset:", error);
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}