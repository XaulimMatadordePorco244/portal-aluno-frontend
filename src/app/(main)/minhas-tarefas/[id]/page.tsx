import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserWithRelations } from "@/lib/auth";
import { ParecerForm } from "./ParecerForm"; 

async function getEtapaDetails(etapaId: string, userId: string) {
    const etapa = await prisma.etapaProcesso.findFirst({
        where: {
            id: etapaId,
            responsavelId: userId,
        },
        include: {
            processo: true 
        }
    });
    return etapa;
}

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
        const { id } = await params;
    
    const user = await getCurrentUserWithRelations();
    if (!user) {
        redirect('/login');
    }

    const etapa = await getEtapaDetails(id, user.id);

    if (!etapa) {
        notFound(); 
    }

    return <ParecerForm etapa={etapa} />;
}