import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import prisma from '@/lib/prisma'
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth'
import { redirect } from 'next/navigation'
import TabelaGerenciador from './tabela-gerenciador'

export const metadata: Metadata = {
  title: 'Configuração TAF',
}

export default async function ConfigTafPage() {
  const user = await getCurrentUserWithRelations()
  
  if (!user || !canAccessAdminArea(user)) {
    redirect('/dashboard')
  }

  const regras = await prisma.tafTabela.findMany({
    where: { anoLetivo: 2025 },
    orderBy: { nota: 'desc' }
  })

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/taf">
                <ArrowLeft className="h-5 w-5" />
            </Link>
        </Button>
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                Critérios de Avaliação (2025)
            </h1>
            <p className="text-muted-foreground text-sm">
                Ajuste os valores de referência. Alterações aqui impactam novos lançamentos imediatamente.
            </p>
        </div>
      </div>

      <TabelaGerenciador regras={regras} />
    </div>
  )
}