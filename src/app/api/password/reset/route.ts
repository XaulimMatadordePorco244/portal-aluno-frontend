import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { z } from 'zod'; 

const resetSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = resetSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0] || 'Erro na validação';
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.usuario.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gte: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado. Solicite uma nova recuperação.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        tokenVersion: { increment: 1 },
      },
    });

    return NextResponse.json({ message: 'Senha redefinida com sucesso!' });

  } catch (error) {
    console.error("Erro no reset de senha:", error);
    return NextResponse.json(
      { error: 'Erro interno ao redefinir senha.' },
      { status: 500 }
    );
  }
}