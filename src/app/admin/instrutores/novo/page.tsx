import prisma from '@/lib/prisma'
import { InstrutorForm } from '../instrutor-form'

export const metadata = { title: 'Novo Instrutor' }

export default async function NovoInstrutorPage() {
  const alunos = await prisma.perfilAluno.findMany({
    where: { status: 'ATIVO' },
    include: { usuario: { select: { nome: true, nomeDeGuerra: true } } },
    orderBy: { usuario: { nome: 'asc' } }
  });

  const alunosMapeados = alunos.map(a => ({
    id: a.id,
    nome: a.usuario.nomeDeGuerra || a.usuario.nome,
    numero: a.numero
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Instrutor</h1>
        <p className="text-muted-foreground">Cadastre um novo instrutor no sistema e vincule alunos.</p>
      </div>
      <div className="border rounded-lg bg-card p-6 shadow-sm">
        <InstrutorForm alunosDisponiveis={alunosMapeados} />
      </div>
    </div>
  )
}