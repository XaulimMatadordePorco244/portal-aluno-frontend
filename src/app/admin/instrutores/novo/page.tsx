import { InstrutorForm } from '../instrutor-form'
import { getAlmanaque } from '@/app/actions/antiguidade'

export const metadata = { title: 'Novo Instrutor' }

export default async function NovoInstrutorPage() {
  const resultadoAlmanaque = await getAlmanaque();
  const alunosBase = resultadoAlmanaque.success ? (resultadoAlmanaque.data || []) : [];

  const alunosMapeados = alunosBase.map(a => ({
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
      <div>
        <InstrutorForm alunosDisponiveis={alunosMapeados} />
      </div>
    </div>
  )
}