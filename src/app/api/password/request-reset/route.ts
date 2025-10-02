import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';
import ResetPasswordEmail from '@/emails/ResetPasswordEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

 
    if (!user) {
      return NextResponse.json({ message: 'Se um e-mail cadastrado corresponder, um link de recuperação será enviado.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    

    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');


    const passwordResetExpires = new Date(Date.now() + 3600 * 1000); 

    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });


    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;


    try {
      await resend.emails.send({
        from: 'Portal do Aluno <nao-responda@seudominio.com>',
        to: user.email as string,
        subject: 'Recuperação de Senha - Portal do Aluno',
        react: ResetPasswordEmail({ resetLink: resetUrl }),
      });
    } catch (emailError) {
      console.error("Falha ao enviar e-mail:", emailError);
    }

    return NextResponse.json({ message: 'Se um e-mail cadastrado corresponder, um link de recuperação será enviado.' });

  } catch (error) {
    console.error("Erro na rota request-reset:", error);
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}