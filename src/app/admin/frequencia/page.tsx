import { Metadata } from 'next'
import { obterMapaFrequencia } from './actions'
import { MapaFrequenciaClient } from './mapa-client'
import { FrequenciaFiltros } from './filtros'
import { Button } from '@/components/ui/Button'
import { CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { Download } from 'lucide-react'

export const metadata: Metadata = { title: 'Controle de Frequência' }

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function FrequenciaPage({ searchParams }: PageProps) {
  const params = await searchParams

  const anoAtual = new Date().getFullYear()
  const anoSelecionado = Number(params.ano) || anoAtual
  const mesAtual = new Date().getMonth() + 1
  const mesSelecionado = Number(params.mes) || mesAtual
  const tipoSelecionado = (params.tipo as string) || 'GERAL'
  const semanaSelecionada = (params.semana as string) || 'TODAS'

  const dados = await obterMapaFrequencia(mesSelecionado, anoSelecionado, tipoSelecionado)

  let datasFiltradas = dados.datas
  if (semanaSelecionada !== 'TODAS') {
    datasFiltradas = dados.datas.filter((dataIso: string) => {
      const dia = parseInt(dataIso.split('-')[2], 10)

      if (semanaSelecionada === '1') return dia >= 1 && dia <= 7
      if (semanaSelecionada === '2') return dia >= 8 && dia <= 14
      if (semanaSelecionada === '3') return dia >= 15 && dia <= 21
      if (semanaSelecionada === '4') return dia >= 22 && dia <= 28
      if (semanaSelecionada === '5') return dia >= 29

      return true
    })
  }

  return (
    <div className=" space-y-6 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mapa de Frequência</h1>
          <p className="text-muted-foreground">Gerenciamento de presenças e faltas.</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <FrequenciaFiltros />

          <Button variant="outline" asChild>
            <a href={`/api/exportar-frequencia-excel?ano=${anoSelecionado}`} download>
              <Download className="mr-2 h-4 w-4" />
              Exportar {anoSelecionado}
            </a>
          </Button>

          <Button asChild>
            <Link href={`/admin/frequencia/lancamento?mes=${mesSelecionado}&ano=${anoSelecionado}&tipo=${tipoSelecionado}&semana=${semanaSelecionada}`}>
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
          datas={datasFiltradas}
          tipo={tipoSelecionado}
        />
      </div>
    </div>
  )
}