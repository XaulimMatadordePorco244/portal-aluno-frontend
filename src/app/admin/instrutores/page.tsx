import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PlusCircle, Edit, Power, PowerOff } from 'lucide-react'
import { alternarStatusInstrutor } from './actions'

export const metadata = { title: 'Gerenciar Instrutores' }

export default async function InstrutoresPage() {
  const instrutores = await prisma.instrutor.findMany({
    orderBy: { nome: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instrutores</h1>
          <p className="text-muted-foreground">Gerencie os instrutores da instituição.</p>
        </div>
        <Button asChild>
          <Link href="/admin/instrutores/novo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Instrutor
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Nome do Instrutor</th>
              <th className="px-4 py-3 font-medium w-32 text-center">Status</th>
              <th className="px-4 py-3 font-medium w-48 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {instrutores.map((instrutor) => (
              <tr key={instrutor.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-medium">{instrutor.nome}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${instrutor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {instrutor.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/instrutores/${instrutor.id}/editar`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <form action={async () => {
                    'use server'
                    await alternarStatusInstrutor(instrutor.id, instrutor.ativo)
                  }}>
                    <Button 
                      variant={instrutor.ativo ? "destructive" : "secondary"} 
                      size="sm" 
                      title={instrutor.ativo ? "Desativar" : "Ativar"}
                    >
                      {instrutor.ativo ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
            {instrutores.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum instrutor cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}