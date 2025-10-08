import { getCurrentUserWithRelations  } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient'; 
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
    const user = await getCurrentUserWithRelations();

  if (!user) {
    redirect('/login');
  }


  const qesItems = await prisma.qES.findMany({
    take: 3,
    orderBy: {
      createdAt: 'desc', 
    },
  });


  const userWithCargo = {
    ...user,
    cargo: 'cargo' in user ? (user as any).cargo : (user.funcao && 'cargo' in user.funcao ? (user.funcao as any).cargo : ''), 
  };

  return <DashboardClient user={userWithCargo} qesItems={qesItems} />;
}