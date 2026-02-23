'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/Input' 
import { Search } from 'lucide-react'


interface FilterProps {
  companhias: { id: string; abreviacao: string }[]
}

export default function BoletimFiltros({ companhias }: FilterProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    replace(`${pathname}?${params.toString()}`)
  }

  const handleCiaChange = (ciaId: string) => {
    const params = new URLSearchParams(searchParams)
    if (ciaId && ciaId !== 'todas') {
      params.set('cia', ciaId)
    } else {
      params.delete('cia')
    }
    replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nome de guerra ou matrícula..." 
          className="pl-8"
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="w-full md:w-48">
        <select 
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(e) => handleCiaChange(e.target.value)}
          defaultValue={searchParams.get('cia')?.toString() || 'todas'}
        >
          <option value="todas">Todas as Cias</option>
          {companhias.map((cia) => (
            <option key={cia.id} value={cia.id}>
              {cia.abreviacao}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}