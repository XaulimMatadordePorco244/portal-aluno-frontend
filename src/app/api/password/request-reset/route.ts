import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';
import ResetPasswordEmail from '@/emails/ResetPasswordEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { cpf } = await req.json();

    if (!cpf) {
      return NextResponse.json({ error: 'CPF é obrigatório.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { cpf } });


    if (!user || !user.email) {
      return NextResponse.json({ message: 'Se o CPF estiver em nosso sistema, um link será enviado para o e-mail associado.' });
    }


    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 3600 * 1000); 

   
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;

    await resend.emails.send({
      from: 'Portal do Aluno <onboarding@resend.dev>', 
      to: user.email,
      subject: 'Recuperação de Senha - Portal do Aluno',
      react: ResetPasswordEmail({ resetLink: resetUrl }),
    });
    
 
    const maskEmail = (email: string) => {
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 2) {
            return `${localPart.slice(0, 1)}***@${domain}`;
        }
        return `${localPart.slice(0, 2)}***@${domain}`;
    };


    return NextResponse.json({ message: `Um link foi enviado para o e-mail: ${maskEmail(user.email)}` });

  } catch (error) {
    console.error("Erro na rota request-reset:", error);
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}