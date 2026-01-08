import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';
import ResetPasswordEmail from '@/emails/ResetPasswordEmail';
import { headers } from 'next/headers';

const resend = new Resend(process.env.RESEND_API_KEY);

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; 
const MAX_ATTEMPTS = 3; 

const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    if (!local || !domain) return 'email***@***';
    const visibleLength = local.length > 3 ? 3 : 1;
    const visiblePart = local.substring(0, visibleLength);
    return `${visiblePart}******@${domain}`;
};

export async function POST(req: Request) {
  try {
    const { cpf } = await req.json();
    const headersList = await headers();
    
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    if (!cpf) {
      return NextResponse.json({ error: 'CPF é obrigatório.' }, { status: 400 });
    }

    const cleanCpf = cpf.replace(/\D/g, '');

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW);

    const attempts = await prisma.passwordResetAttempt.count({
      where: {
        createdAt: { gte: windowStart },
        OR: [
          { ip: ip },
          { identifier: cleanCpf }
        ]
      }
    });

    if (attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.' }, 
        { status: 429 } 
      );
    }

    await prisma.passwordResetAttempt.create({
      data: {
        ip,
        identifier: cleanCpf
      }
    });

    const user = await prisma.usuario.findUnique({ 
      where: { cpf: cleanCpf } 
    });

    if (!user || !user.email) {
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      return NextResponse.json(
        { error: 'E-mail de recuperação não cadastrado, entre em contato com a coordenação.' }, 
        { status: 404 } 
      );
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
      from: 'Guarda Mirim Naviraí <sistema@gmnaviraims.com.br>',
      to: user.email,
      subject: 'Recuperação de Senha',
      react: ResetPasswordEmail({ resetLink: resetUrl }),
    });

    if (error) {
      console.error('Erro Resend:', error);
      return NextResponse.json({ error: 'Erro ao enviar e-mail.' }, { status: 500 });
    }

    return NextResponse.json({ 
      maskedEmail: maskEmail(user.email) 
    });

  } catch (error) {
    console.error("Erro rota request-reset:", error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}