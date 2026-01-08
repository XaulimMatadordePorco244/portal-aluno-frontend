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

    const cleanCpf = cpf.replace(/\D/g, '');

    const user = await prisma.usuario.findUnique({ 
      where: { cpf: cleanCpf } 
    });

    const genericMessage = 'Se o CPF estiver cadastrado, você receberá um link no e-mail associado.';

    if (!user || !user.email) {
      delay(1000); 
      return NextResponse.json({ message: genericMessage });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    const passwordResetExpires = new Date(Date.now() + 3600 * 1000); 

    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    const { error } = await resend.emails.send({
      from: 'Guarda Mirim De Naviraí <no-reply@gmnaviraims.com.br>', 
      to: user.email,
      subject: 'Redefinição de Senha',
      react: ResetPasswordEmail({ resetLink: resetUrl }),
    });

    if (error) {
      console.error('Erro Resend:', error);
      return NextResponse.json({ error: 'Erro ao enviar e-mail.' }, { status: 500 });
    }

    const maskEmail = (email: string) => {
        const [local, domain] = email.split('@');
        if (!local || !domain) return 'email***@***';
        const visible = local.length > 2 ? local.substring(0, 2) : local.substring(0, 1);
        return `${visible}***@${domain}`;
    };

    return NextResponse.json({ 
      message: genericMessage, 
      detail: `E-mail enviado para: ${maskEmail(user.email)}` 
    });

  } catch (error) {
    console.error("Erro rota request-reset:", error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}

function delay(arg0: number) {
  throw new Error('Function not implemented.');
}
