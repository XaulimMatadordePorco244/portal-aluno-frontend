import { getFullCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient'; 
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
  const user = await getFullCurrentUser();

  if (!user) {
    redirect('/login');
  }


  const qesItems = await prisma.qES.findMany({
    take: 3,
    orderBy: {
      dataInicio: 'desc', 
    },
  });

  return <DashboardClient user={user} qesItems={qesItems} />;
}