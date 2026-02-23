"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "@/components/ui/Input"
import { Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function CIFilters() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    const [isPending, startTransition] = React.useTransition()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', '1') 
        if (term) {
            params.set("q", term)
        } else {
            params.delete("q")
        }
        
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`)
        })
    }, 300)

    const handleDate = (date: string, type: 'from' | 'to') => {
        const params = new URLSearchParams(searchParams)
        params.set('page', '1')
        if (date) {
            params.set(type, date)
        } else {
            params.delete(type)
        }
        
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`)
        })
    }

    return (
        <div className={cn(
            "flex flex-col md:flex-row gap-4 transition-opacity duration-300",
            isPending ? "opacity-60 pointer-events-none" : "opacity-100"
        )}>
            <div className="relative flex-1">
                {isPending ? (
                    <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-primary animate-spin" />
                ) : (
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                    placeholder="Buscar por título, assunto ou número..."
                    className="pl-9 bg-background"
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get("q")?.toString()}
                    disabled={isPending}
                />
            </div>
            <div className="flex gap-2 items-center">
                 <div className="relative">
                    <Input 
                        type="date" 
                        onChange={(e) => handleDate(e.target.value, 'from')}
                        defaultValue={searchParams.get("from")?.toString()}
                        className="w-auto bg-background"
                        disabled={isPending}
                    />
                 </div>
                 <span className="text-muted-foreground text-sm">até</span>
                 <div className="relative">
                    <Input 
                        type="date" 
                        onChange={(e) => handleDate(e.target.value, 'to')}
                        defaultValue={searchParams.get("to")?.toString()}
                        className="w-auto bg-background"
                        disabled={isPending}
                    />
                 </div>
            </div>
        </div>
    )
}