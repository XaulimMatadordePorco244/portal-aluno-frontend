import { InstrutorForm } from '../instrutor-form'
import { ORDEM_ANTIGUIDADE } from '@/lib/regras'
import prisma from '@/lib/prisma'

export const metadata = { title: 'Novo Instrutor' }

export default async function NovoInstrutorPage() {
  const alunos = await prisma.perfilAluno.findMany({
    where: { 
      status: 'ATIVO',
      usuario: { status: 'ATIVO' }
    },
    select: {
      id: true,
      numero: true,
      usuario: { select: { nome: true, nomeDeGuerra: true } },
      cargo: { select: { abreviacao: true } }
    },
    orderBy: ORDEM_ANTIGUIDADE
  });

  const alunosMapeados = alunos.map(a => ({
    id: a.id,
    nome: a.usuario.nomeDeGuerra || a.usuario.nome,
    numero: a.numero,
    cargoAbreviacao: a.cargo?.abreviacao || null
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Instrutor</h1>
        <p className="text-muted-foreground">Cadastre um novo instrutor no sistema.</p>
      </div>
      <div className="border rounded-lg bg-card p-6 shadow-sm">
        <InstrutorForm alunosDisponiveis={alunosMapeados} />
      </div>
    </div>
  )
}