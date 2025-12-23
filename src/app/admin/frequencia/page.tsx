import { Metadata } from 'next'
import { obterMapaFrequencia } from './actions'
import { MapaFrequenciaClient } from './mapa-client'
import { FrequenciaFiltros } from './filtros'

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
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mapa de Frequência</h1>
          <p className="text-muted-foreground">Gerenciamento de presenças e faltas.</p>
        </div>
        
        <div className="flex gap-2">
          
           <FrequenciaFiltros />
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-card">
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