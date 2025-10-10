import { getCurrentUserWithRelations, UserWithRelations } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import prisma from '@/lib/prisma';

async function getRankingSnippet(user: UserWithRelations) {
    if (!user.cargoId) {
        return { rankingData: [], currentUserRank: null };
    }

    const peers = await prisma.user.findMany({
        where: {
            cargoId: user.cargoId,
            status: 'Ativo',
        },
        orderBy: {
            conceito: 'desc',
        },
        select: {
            id: true,
            nomeDeGuerra: true,
            nome: true,
            numero: true,
            conceito: true,
            cargo: { select: { nome: true, abreviacao: true } },
        }
    });

    const userIndex = peers.findIndex(p => p.id === user.id);
    if (userIndex === -1) {
        return { rankingData: [], currentUserRank: null };
    }
    const currentUserRank = userIndex + 1;

    let startIndex;
    if (userIndex === 0) {
        startIndex = 0;
    } else {
        startIndex = userIndex - 1;
    }

    const rankingSnippet = peers.slice(startIndex, startIndex + 3);

    const rankingData = rankingSnippet.map((peer, index) => ({
        ...peer,
        rank: startIndex + index + 1,
    }));

    return { rankingData, currentUserRank };
}

export default async function DashboardPage() {
    const user = await getCurrentUserWithRelations();

    if (!user) {
        redirect('/login');
    }

    const [qesItems, latestAnnotations, { rankingData }] = await Promise.all([
        prisma.qES.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.anotacao.findMany({
            where: { alunoId: user.id },
            include: { tipo: true },
            orderBy: { data: 'desc' },
            take: 3,
        }),
        getRankingSnippet(user)
    ]);

    return <DashboardClient
        user={user}
        qesItems={qesItems}
        latestAnnotations={latestAnnotations}
        rankingData={rankingData}
    />;
}