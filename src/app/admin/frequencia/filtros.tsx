'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function FrequenciaFiltros() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const mesAtual = String(new Date().getMonth() + 1)
  const mes = searchParams.get('mes') || mesAtual
  const tipo = searchParams.get('tipo') || 'GERAL'

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(key, value)
    router.push(`/admin/frequencia?${params.toString()}`)
  }

  return (
    <div className="flex gap-2">
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

      <Select value={tipo} onValueChange={(val) => handleFilterChange('tipo', val)}>
        <SelectTrigger className="w-[180px] bg-background">
           <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="GERAL">Geral</SelectItem>
            <SelectItem value="INST_MENDONCA">Inst. Mendonça</SelectItem>
            <SelectItem value="INST_KAREN">Inst. Karen</SelectItem>
            <SelectItem value="INST_JOSIANE">Inst. Josiane</SelectItem>
            <SelectItem value="INST_CUNHA">Inst. Cunha</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}