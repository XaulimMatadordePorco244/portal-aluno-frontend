import { PrismaClient } from '@prisma/client'
import { ListaChamada } from './lista-chamada'
import { ORDEM_ANTIGUIDADE } from '@/lib/regras'

const prisma = new PrismaClient()

export default async function LancamentoFrequenciaPage() {
  const alunosRaw = await prisma.perfilAluno.findMany({
    where: {
      usuario: { status: 'ATIVO' },
      status: 'ATIVO' 
    },
    select: {
      id: true,
      instrutores: { 
        select: { instrutorId: true }
      },
      numero: true,
      usuario: {
        select: { nome: true, nomeDeGuerra: true }
      },
      cargo: {
        select: { abreviacao: true }
      }
    },
    orderBy: ORDEM_ANTIGUIDADE
  })

  const alunos = alunosRaw.map(aluno => ({
    id: aluno.id,
    numero: aluno.numero,
    usuario: aluno.usuario,
    cargo: aluno.cargo,
    instrutoresIds: aluno.instrutores.map(i => i.instrutorId)
  }))

  const instrutores = await prisma.instrutor.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' }
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lançamento de Frequência</h1>
        <p className="text-muted-foreground">
          Selecione a data e o instrutor para realizar a chamada.
        </p>
      </div>

      <ListaChamada alunos={alunos} instrutores={instrutores} />
    </div>
  )
}