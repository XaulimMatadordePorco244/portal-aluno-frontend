"use client"

import * as React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/Input"

interface CIFiltersProps {
  assuntosDisponiveis: string[]
}

export function CIFilters({ assuntosDisponiveis }: CIFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [open, setOpen] = React.useState(false)

  const currentSubject = searchParams.get("assunto")
  const currentDate = searchParams.get("data")

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex flex-col gap-2 w-full sm:w-[300px]">
        <span className="text-sm font-medium text-muted-foreground">Filtrar por Assunto</span>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {currentSubject
                ? assuntosDisponiveis.find((assunto) => assunto === currentSubject)
                : "Todos os assuntos..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Buscar assunto..." />
              <CommandList>
                <CommandEmpty>Nenhum assunto encontrado.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      updateFilter("assunto", null)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !currentSubject ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Todos os assuntos
                  </CommandItem>

                  {assuntosDisponiveis.map((assunto) => (
                    <CommandItem
                      key={assunto}
                      value={assunto}
                      onSelect={(currentValue) => {
                        const newValue = currentValue === currentSubject ? null : currentValue
                        updateFilter("assunto", newValue)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          currentSubject === assunto ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {assunto}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <span className="text-sm font-medium text-muted-foreground">Mês de Referência</span>
        <div className="flex gap-2">
          <Input
            type="month"
            className="w-[200px]"
            value={currentDate || ""}
            onChange={(e) => updateFilter("data", e.target.value)}
          />
          
          {(currentSubject || currentDate) && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push(pathname)}
              title="Limpar filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
