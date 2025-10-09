import { getCurrentUserWithRelations } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient'; 
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
    const user = await getCurrentUserWithRelations();

    if (!user) {
        redirect('/login');
    }

    const [qesItems, latestAnnotations] = await Promise.all([
       
        prisma.qES.findMany({ 
            take: 3,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.anotacao.findMany({
            where: { alunoId: user.id },
            include: { tipo: true },
            orderBy: { data: 'desc' },
            take: 3,
        })
    ]);

  
    return <DashboardClient 
                user={user} 
                qesItems={qesItems}
                latestAnnotations={latestAnnotations} 
            />;
}