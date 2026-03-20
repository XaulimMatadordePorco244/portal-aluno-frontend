'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface Instrutor {
  id: string;
  nome: string;
}

interface FrequenciaFiltrosProps {
  instrutores: Instrutor[];
}

export function FrequenciaFiltros({ instrutores = [] }: FrequenciaFiltrosProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const dataAtual = new Date()
  const mesAtual = String(dataAtual.getMonth() + 1)
  const anoAtual = String(dataAtual.getFullYear())

  const mes = searchParams.get('mes') || mesAtual
  const ano = searchParams.get('ano') || anoAtual
  const tipo = searchParams.get('tipo') || 'GERAL'
  const semana = searchParams.get('semana') || 'TODAS'

  const anosDisponiveis = Array.from(
    { length: Math.max(2, dataAtual.getFullYear() - 2024 + 2) }, 
    (_, i) => String(2024 + i)
  )

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(key, value)
    router.push(`/admin/frequencia?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Select value={ano} onValueChange={(val) => handleFilterChange('ano', val)}>
        <SelectTrigger className="w-[100px] bg-background">
           <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
            {anosDisponiveis.map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
        </SelectContent>
      </Select>

      <Select value={mes} onValueChange={(val) => handleFilterChange('mes', val)}>
        <SelectTrigger className="w-[140px] bg-background">
           <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="1">Janeiro</SelectItem>
            <SelectItem value="2">Fevereiro</SelectItem>
            <SelectItem value="3">Março</SelectItem>
            <SelectItem value="4">Abril</SelectItem>
            <SelectItem value="5">Maio</SelectItem>
            <SelectItem value="6">Junho</SelectItem>
            <SelectItem value="7">Julho</SelectItem>
            <SelectItem value="8">Agosto</SelectItem>
            <SelectItem value="9">Setembro</SelectItem>
            <SelectItem value="10">Outubro</SelectItem>
            <SelectItem value="11">Novembro</SelectItem>
            <SelectItem value="12">Dezembro</SelectItem>
        </SelectContent>
      </Select>

      <Select value={semana} onValueChange={(val) => handleFilterChange('semana', val)}>
        <SelectTrigger className="w-40 bg-background">
           <SelectValue placeholder="Semana" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="TODAS">Mês Completo</SelectItem>
            <SelectItem value="1">Semana 1 (Dias 1 a 7)</SelectItem>
            <SelectItem value="2">Semana 2 (Dias 8 a 14)</SelectItem>
            <SelectItem value="3">Semana 3 (Dias 15 a 21)</SelectItem>
            <SelectItem value="4">Semana 4 (Dias 22 a 28)</SelectItem>
            <SelectItem value="5">Semana 5 (Dias 29+)</SelectItem>
        </SelectContent>
      </Select>

      <Select value={tipo} onValueChange={(val) => handleFilterChange('tipo', val)}>
        <SelectTrigger className="w-[180px] bg-background">
           <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="GERAL">GERAL</SelectItem>
            
            {instrutores.map(instrutor => (
               <SelectItem key={instrutor.id} value={instrutor.id}>
                  INST. {instrutor.nome}
               </SelectItem>
            ))}
            
        </SelectContent>
      </Select>
    </div>
  )
}