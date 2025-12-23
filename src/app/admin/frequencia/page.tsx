import { Metadata } from 'next'
import { obterMapaFrequencia } from './actions'
import { MapaFrequenciaClient } from './mapa-client'
import { FrequenciaFiltros } from './filtros' 
import { Button } from '@/components/ui/Button'
import { CheckSquare } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Controle de Frequência' }

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function FrequenciaPage({ searchParams }: PageProps) {
  const params = await searchParams
  
  const mesAtual = new Date().getMonth() + 1
  const mesSelecionado = Number(params.mes) || mesAtual
  const tipoSelecionado = (params.tipo as string) || 'GERAL'

  const dados = await obterMapaFrequencia(mesSelecionado, 2025, tipoSelecionado)

  return (
    <div className="p-6 max-w-[100vw] space-y-6 h-screen flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mapa de Frequência</h1>
          <p className="text-muted-foreground">Gerenciamento de presenças e faltas.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
            <FrequenciaFiltros />

            <Button asChild>
                <Link href="/admin/frequencia/lancamento">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Realizar Chamada
                </Link>
            </Button>
        </div>
      </div>


      <div className="border rounded-lg bg-card flex-1 overflow-auto relative shadow-sm">
        <MapaFrequenciaClient 
            alunos={dados.alunos} 
            frequencias={dados.frequencias} 
            datas={dados.datas} 
            tipo={tipoSelecionado}
        />
      </div>
    </div>
  )
}