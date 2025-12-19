'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AnoSelector({ anoAtual }: { anoAtual: number }) {
  const router = useRouter()
  const anos = [2023, 2024, 2025, 2026, 2027]            

  const handleChange = (val: string) => {
    router.push(`/admin/taf/tabela?ano=${val}`)
  }

  return (
    <div className="w-[180px]">
      <Select value={String(anoAtual)} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o ano" />
        </SelectTrigger>
        <SelectContent>
          {anos.map((ano) => (
            <SelectItem key={ano} value={String(ano)}>
              Ano Letivo {ano}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}