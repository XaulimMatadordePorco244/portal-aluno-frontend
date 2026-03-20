import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import SuspensaoForm from "@/components/admin/suspensao/SuspensaoForm";

export const dynamic = 'force-dynamic';

export default async function EditarSuspensaoPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const resolvedParams = await params;
  const suspensaoId = resolvedParams.id;

  const suspensao = await prisma.suspensao.findUnique({
    where: { id: suspensaoId }
  });

  if (!suspensao) {
    redirect("/admin/suspensoes");
  }

  const alunos = await prisma.usuario.findMany({
    where: { role: "ALUNO", status: "ATIVO" },
    include: { perfilAluno: { include: { cargo: true } } },
    orderBy: { nome: "asc" }
  });

  const usuarios = await prisma.usuario.findMany({
    where: { role: { not: "ALUNO" }, status: "ATIVO" },
    orderBy: { nome: "asc" }
  });

  const tipos = await prisma.tipoDeSuspensao.findMany({
    orderBy: { titulo: 'asc' }
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Suspensão</h1>
        <p className="text-muted-foreground">
          Modifique os dados da suspensão. As alterações vão refletir automaticamente no conceito do aluno.
        </p>
      </div>

      <SuspensaoForm 
        alunos={alunos} 
        usuarios={usuarios} 
        tipos={tipos} 
        initialData={suspensao} 
      />
    </div>
  );
}