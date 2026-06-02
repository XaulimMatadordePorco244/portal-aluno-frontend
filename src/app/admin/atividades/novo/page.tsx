import prisma from "@/lib/prisma";
import { AtividadeForm } from "./atividade-form";

export const dynamic = 'force-dynamic';

async function getData() {
  const [alunosRaw, cargos, companhias] = await Promise.all([
    prisma.usuario.findMany({
      where: {
        role: 'ALUNO',
        status: 'ATIVO',
      },
      include: {
        perfilAluno: {
          include: {
            cargo: true,
            companhia: true
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    }),
    prisma.cargo.findMany({ orderBy: { precedencia: 'desc' } }),
    prisma.companhia.findMany({ orderBy: { nome: 'asc' } })
  ]);

  const alunosAtivos = alunosRaw.map(aluno => ({
    id: aluno.id,
    nome: aluno.nome,
    nomeDeGuerra: aluno.nomeDeGuerra || null,
    anoIngresso: aluno.perfilAluno?.anoIngresso || null,
    cargoId: aluno.perfilAluno?.cargoId || null,
    cargoAbreviacao: aluno.perfilAluno?.cargo?.abreviacao || 'S/C',
    companhiaId: aluno.perfilAluno?.companhiaId || null,
  }));

  return { alunosAtivos, cargos, companhias };
}

export default async function NovaAtividadePage() {
  const { alunosAtivos, cargos, companhias } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold">Nova Atividade</h1>
          <p className="text-muted-foreground">Crie uma nova tarefa e envie para os alunos.</p>
        </div>
      </div>

      <AtividadeForm 
        alunosAtivos={alunosAtivos} 
        cargos={cargos} 
        companhias={companhias} 
      />
    </div>
  );
}