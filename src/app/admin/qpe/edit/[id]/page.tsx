import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditQPEForm from './edit-form';

export default async function EditItemPage({ 
    params,
    searchParams
}: { 
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { id } = await params;
    const { tipo } = await searchParams; 

    let item = null;

    if (tipo === 'SUSPENSAO') {
        const suspensao = await prisma.tipoDeSuspensao.findUnique({
            where: { id },
        });

        if (suspensao) {
            item = {
                ...suspensao,
                pontos: null,
                abertoCoordenacao: false,
                categoriaAberto: null,
                tipoRegisto: 'SUSPENSAO' as const,
            };
        }
    } 
    else {
        const anotacao = await prisma.tipoDeAnotacao.findUnique({
            where: { id },
        });

        if (anotacao) {
            item = {
                ...anotacao,
                tipoRegisto: 'ANOTACAO' as const,
            };
        }
    }

    if (!item) {
        notFound();
    }

    return <EditQPEForm item={item} />;
}