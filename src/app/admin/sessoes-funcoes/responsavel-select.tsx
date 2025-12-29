'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

interface Opcao {
  id: string
  label: string
  value: string
}

interface ResponsavelSelectProps {
  valorInicial: string 
  opcoes: Opcao[]    
}

export function ResponsavelSelect({ valorInicial, opcoes }: ResponsavelSelectProps) {
  const [open, setOpen] = useState(false)
  
  const [selecionados, setSelecionados] = useState<string[]>(
    valorInicial ? valorInicial.split(' - ').filter(Boolean) : []
  )


  const valorParaSalvar = selecionados.join(' - ')

  const toggleSelection = (valor: string) => {
    setSelecionados(prev => 
      prev.includes(valor) 
        ? prev.filter(item => item !== valor) 
        : [...prev, valor]
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="responsaveis" value={valorParaSalvar} />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-auto min-h-10">
            {selecionados.length > 0 
              ? `${selecionados.length} selecionado(s)` 
              : "Selecionar responsáveis..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Buscar aluno..." />
            <CommandList>
              <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
              <CommandGroup max-height="300px">
                {opcoes.map((opcao) => (
                  <CommandItem key={opcao.id} value={opcao.label} onSelect={() => toggleSelection(opcao.value)}>
                    <Check className={`mr-2 h-4 w-4 ${selecionados.includes(opcao.value) ? "opacity-100" : "opacity-0"}`} />
                    {opcao.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2">
        {selecionados.map(nome => (
          <Badge key={nome} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
            {nome}
            <button 
              type="button" 
              onClick={() => toggleSelection(nome)}
              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}