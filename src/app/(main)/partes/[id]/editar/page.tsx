import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import EditarParteForm from "./EditarParteForm"; 

export default async function EditarPartePage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) redirect("/auth/login");

    const parte = await prisma.parte.findUnique({
        where: { id },
    });

    if (!parte) notFound();

    if (parte.autorId !== user.userId || parte.status !== "RASCUNHO") {
        return (
            <div className="p-10 text-center text-red-500">
                Você não pode editar esta parte (ela não existe, não é sua, ou já foi enviada).
            </div>
        );
    }

    return (
        <div className="container max-w-2xl py-10">
            <h1 className="text-2xl font-bold mb-6">Editar Rascunho</h1>
            <EditarParteForm parte={parte} />
        </div>
    );
}