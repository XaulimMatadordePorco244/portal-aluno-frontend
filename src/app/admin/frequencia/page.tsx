import { Metadata } from 'next'
import { obterMapaFrequencia } from './actions'
import { MapaFrequenciaClient } from './mapa-client'

export const metadata: Metadata = { title: 'Controle de Frequência' }

// Definindo a tipagem correta para Next.js 15
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function FrequenciaPage({ searchParams }: PageProps) {
  // 1. Aguarde os parâmetros antes de usar
  const params = await searchParams
  
  const mesAtual = new Date().getMonth() + 1
  
  // 2. Agora acesse as propriedades do objeto 'params' (que já foi aguardado)
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
            {/* O formulário nativo GET funciona bem aqui */}
            <form className="flex gap-2">
                <select 
                    name="mes" 
                    defaultValue={mesSelecionado} 
                    className="border rounded p-2 text-sm bg-background"
                >
                    <option value="1">Janeiro</option>
                    <option value="2">Fevereiro</option>
                    <option value="3">Março</option>
                    <option value="4">Abril</option>
                    <option value="5">Maio</option>
                    <option value="6">Junho</option>
                    <option value="7">Julho</option>
                    <option value="8">Agosto</option>
                    <option value="9">Setembro</option>
                    <option value="10">Outubro</option>
                    <option value="11">Novembro</option>
                    <option value="12">Dezembro</option>
                </select>
                <select 
                    name="tipo" 
                    defaultValue={tipoSelecionado} 
                    className="border rounded p-2 text-sm bg-background"
                >
                    <option value="GERAL">Geral</option>
                    <option value="INST_MENDONCA">Inst. Mendonça</option>
                    <option value="INST_KAREN">Inst. Karen</option>
                    <option value="INST_JOSIANE">Inst. Josiane</option>
                    <option value="INST_CUNHA">Inst. Cunha</option>
                </select>
                <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm">
                    Filtrar
                </button>
            </form>
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