import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditQPEForm from './edit-form';


export default async function EditItemPage({ params }: { params: { id: string } }) {
  const { id } = params; 

  const item = await prisma.tipoDeAnotacao.findUnique({
    where: { id },
  });

   if (!item) {
    notFound();
  }

  return <EditQPEForm item={item} />;

  }
