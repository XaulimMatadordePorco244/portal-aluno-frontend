import prisma from "@/lib/prisma";
import { AtividadeForm } from "./atividade-form";

export const dynamic = 'force-dynamic';

async function getAlunosAtivos() {
  const alunos = await prisma.usuario.findMany({
    where: {
      role: 'ALUNO',
      status: 'ATIVO',
    },
    include: {
      perfilAluno: true
    },
    orderBy: {
      nome: 'asc'
    }
  });

  return alunos.map(aluno => ({
    id: aluno.id,
    nome: aluno.nome,
    nomeDeGuerra: aluno.perfilAluno?.nomeDeGuerra || null,
  }));
}

export default async function NovaAtividadePage() {
  const alunosAtivos = await getAlunosAtivos();

  return (
    <div className="space-y-6 ">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold">Nova Atividade</h1>
          <p className="text-muted-foreground">Crie uma nova tarefa e envie para os alunos.</p>
        </div>
      </div>

      <AtividadeForm alunosAtivos={alunosAtivos} />
    </div>
  );
}