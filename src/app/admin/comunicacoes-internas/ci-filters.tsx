"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "@/components/ui/Input"
import { Search, Calendar } from "lucide-react"

export function CIFilters() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', '1') 
        if (term) {
            params.set("q", term)
        } else {
            params.delete("q")
        }
        replace(`${pathname}?${params.toString()}`)
    }, 300)

    const handleDate = (date: string, type: 'from' | 'to') => {
        const params = new URLSearchParams(searchParams)
        params.set('page', '1')
        if (date) {
            params.set(type, date)
        } else {
            params.delete(type)
        }
        replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por título, assunto ou número..."
                    className="pl-9 bg-background"
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get("q")?.toString()}
                />
            </div>
            <div className="flex gap-2 items-center">
                 <div className="relative">
                    <Input 
                        type="date" 
                        onChange={(e) => handleDate(e.target.value, 'from')}
                        defaultValue={searchParams.get("from")?.toString()}
                        className="w-auto bg-background"
                    />
                 </div>
                 <span className="text-muted-foreground text-sm">até</span>
                 <div className="relative">
                    <Input 
                        type="date" 
                        onChange={(e) => handleDate(e.target.value, 'to')}
                        defaultValue={searchParams.get("to")?.toString()}
                        className="w-auto bg-background"
                    />
                 </div>
            </div>
        </div>
    )
}