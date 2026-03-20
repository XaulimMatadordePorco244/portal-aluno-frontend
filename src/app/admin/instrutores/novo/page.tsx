import { InstrutorForm } from '../instrutor-form'

export const metadata = { title: 'Novo Instrutor' }

export default function NovoInstrutorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Instrutor</h1>
        <p className="text-muted-foreground">Cadastre um novo instrutor no sistema.</p>
      </div>
      <div className="border rounded-lg bg-card p-6 shadow-sm">
        <InstrutorForm />
      </div>
    </div>
  )
}