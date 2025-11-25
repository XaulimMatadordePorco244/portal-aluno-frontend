import { getCurrentUserWithRelations, UserWithRelations } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import prisma from '@/lib/prisma';

async function getRankingSnippet(user: UserWithRelations) {
  if (!user.perfilAluno?.cargoId) {
    return { rankingData: [], currentUserRank: null };
  }

  const peers = await prisma.usuario.findMany({
    where: {
      status: 'ATIVO',
      role: 'ALUNO',
      perfilAluno: {
        cargoId: user.perfilAluno.cargoId,
      },
    },
    orderBy: {
      perfilAluno: {
        conceitoAtual: 'desc',
      },
    },
    include: {
      perfilAluno: {
        include: {
          cargo: true
        }
      }
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
    id: peer.id,
    nome: peer.nome,
    nomeDeGuerra: peer.perfilAluno?.nomeDeGuerra,
    numero: peer.perfilAluno?.numero,
    conceitoAtual: peer.perfilAluno?.conceitoAtual,
    cargo: peer.perfilAluno?.cargo,
    rank: startIndex + index + 1,
  }));

  return { rankingData, currentUserRank };
}

export default async function DashboardPage() {
  const user = await getCurrentUserWithRelations();

  if (!user) {
    redirect('/login');
  }

  const profileId = user.perfilAluno?.id;

  
  const [
    qesItems, 
    latestAnnotations, 
    { rankingData }, 
    latestCIs, 
    latestInformativos,
    minhasEscalas 
  ] = await Promise.all([
    
    prisma.qES.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    }),
    
    
    profileId ? prisma.anotacao.findMany({
      where: { alunoId: profileId },
      include: { tipo: true },
      orderBy: { data: 'desc' },
      take: 3,
    }) : [],
    
  
    getRankingSnippet(user),
    

    prisma.comunicacaoInterna.findMany({
      take: 3,
      orderBy: [
        { anoReferencia: 'desc' },
        { numeroSequencial: 'desc' }
      ],
    }),
    
    prisma.informativo.findMany({
      take: 3,
      orderBy: { dataPublicacao: 'desc' }
    }),

  
    profileId ? prisma.escala.findMany({
      where: {
        status: 'PUBLICADA',
        itens: {
          some: {
            alunoId: profileId 
          }
        }
      },
      take: 3,
      orderBy: { dataEscala: 'desc' }
    }) : []
  ]);

  return (
    <DashboardClient
      user={user}
      qesItems={qesItems}
      latestAnnotations={latestAnnotations}
      rankingData={rankingData}
      latestCIs={latestCIs}
      latestInformativos={latestInformativos}
      minhasEscalas={minhasEscalas} 
    />
  );
}