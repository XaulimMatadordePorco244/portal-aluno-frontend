import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AtividadesList } from "./atividades-list"; 

export const dynamic = 'force-dynamic';

async function getAtividadesDoAluno() {
    const user = await getCurrentUser();
    if (!user?.userId) return [];

    const tarefas = await prisma.atividadeAluno.findMany({
        where: {
            alunoId: user.userId,
        },
        include: {
            atividade: true, 
        },
        orderBy: [
            { status: 'asc' },
            { createdAt: 'desc' }
        ]
    });
    return tarefas;
}

export default async function MinhasTarefasPage() {
    const tarefas = await getAtividadesDoAluno();

    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <h1 className="text-3xl font-bold text-foreground">Minhas Tarefas</h1>
            </div>

            <AtividadesList atividadesIniciais={tarefas} />
        </div>
    );
}