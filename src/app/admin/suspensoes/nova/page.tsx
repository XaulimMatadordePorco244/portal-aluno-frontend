import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

import SuspensaoForm from "@/components/admin/suspensao/SuspensaoForm";

export const dynamic = 'force-dynamic';

export default async function NovaSuspensaoPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
        redirect("/login");
    }

    const alunos = await prisma.usuario.findMany({
        where: {
            role: "ALUNO",
            status: "ATIVO"
        },
        include: {
            perfilAluno: {
                include: {
                    cargo: true
                }
            }
        },
        orderBy: {
            nome: "asc"
        }
    });

    const usuarios = await prisma.usuario.findMany({
        where: {
            role: { not: "ALUNO" },
            status: "ATIVO"
        },
        orderBy: {
            nome: "asc"
        }
    });

    const tipos = await prisma.tipoDeSuspensao.findMany({
        orderBy: { titulo: 'asc' }
    });

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Lançar Nova Suspensão</h1>
                <p className="text-muted-foreground">
                    Preencha os dados abaixo para aplicar uma suspensão disciplinar. O aluno será notificado e deverá declarar ciência.
                </p>
            </div>

            <SuspensaoForm
                alunos={alunos}
                usuarios={usuarios}
                tipos={tipos}
            />
        </div>
    );
}