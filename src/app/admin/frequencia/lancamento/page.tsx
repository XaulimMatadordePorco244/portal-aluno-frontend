import { PrismaClient } from '@prisma/client'
import { ListaChamada } from './lista-chamada'

const prisma = new PrismaClient()

export default async function LancamentoFrequenciaPage() {
const alunos = await prisma.perfilAluno.findMany({
    orderBy: {
      nomeDeGuerra: 'asc'
    },
    include: {
      usuario: { 
        select: { nome: true } 
      }
    }
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lançamento de Frequência</h1>
        <p className="text-muted-foreground">
          Selecione a data e o tipo de instrução para realizar a chamada.
        </p>
      </div>

      <ListaChamada alunos={alunos} />
    </div>
  )
}