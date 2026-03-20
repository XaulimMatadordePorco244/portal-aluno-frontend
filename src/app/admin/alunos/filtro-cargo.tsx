'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Cargo {
  id: string
  nome: string
}

export function FiltroCargo({ cargos, cargoAtual }: { cargos: Cargo[], cargoAtual: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'todos') {
      params.delete('cargoId')
    } else {
      params.set('cargoId', value)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <Select value={cargoAtual} onValueChange={handleValueChange}>
      <SelectTrigger className="h-8 w-40 md:w-[200px] text-xs md:text-sm">
        <SelectValue placeholder="Selecione um Cargo" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">Todos os Cargos</SelectItem>
        {cargos.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}