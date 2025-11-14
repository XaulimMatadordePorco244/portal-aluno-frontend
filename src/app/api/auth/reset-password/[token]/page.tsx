

import { ResetPasswordForm } from './ResetPasswordForm';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import Link from 'next/link';

export default async function ResetPasswordPage({ 
    params 
}: { 
    params: Promise<{ token: string }> 
}) {
  
    const { token } = await params;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.usuario.findFirst({
        where: {
            passwordResetToken: hashedToken,
            passwordResetExpires: {
                gte: new Date(), 
            },
        },
    });

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-2xl font-bold text-destructive">Link Inválido ou Expirado</h1>
                <p className="text-muted-foreground mt-2">
                    O link de recuperação de senha que você utilizou não é mais válido. Por favor, solicite um novo.
                </p>
                <Link href="/forgot-password" className="mt-4 text-sm text-primary hover:underline">
                    Solicitar novo link
                </Link>
            </div>
        );
    }

    return <ResetPasswordForm token={token} />;
}