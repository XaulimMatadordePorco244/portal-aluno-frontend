import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import SuspensoesClient from "./SuspensoesClient";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const dynamic = 'force-dynamic';

export default async function AdminSuspensoesPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const suspensoes = await prisma.suspensao.findMany({
    include: {
      tipo: {
        select: { titulo: true }
      },
      aluno: {
        select: {
          usuario: {
            select: { nome: true, nomeDeGuerra: true }
          },
          cargo: {
            select: { abreviacao: true }
          }
        }
      },
      quemLancou: {
        select: { nome: true }
      },
    },
    orderBy: {
      createdAt: 'desc' 
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Suspensões</h1>
          <p className="text-muted-foreground">
            Acompanhe o histórico de suspensões e verifique a ciência dos alunos.
          </p>
        </div>
        
        <Link href="/admin/suspensoes/nova">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nova Suspensão
          </Button>
        </Link>
      </div>

      <SuspensoesClient suspensoes={suspensoes} />
    </div>
  );
}