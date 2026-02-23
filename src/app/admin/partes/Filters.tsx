"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function PartesFilters() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = React.useTransition();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    }, 300);

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams);
        if (status && status !== 'TODAS') {
            params.set('status', status);
        } else {
            params.delete('status');
        }
        
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className={cn(
            "flex flex-col md:flex-row gap-4 mb-8 transition-opacity duration-300",
            isPending ? "opacity-60 pointer-events-none" : "opacity-100"
        )}>
            <div className="relative w-full max-w-sm">
                {isPending ? (
                    <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-primary animate-spin" />
                ) : (
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                    placeholder="Buscar por aluno ou assunto..."
                    className="pl-9"
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('search')?.toString()}
                    disabled={isPending}
                />
            </div>

            <Select
                onValueChange={handleStatusChange}
                defaultValue={searchParams.get('status')?.toString() || 'TODAS'}
                disabled={isPending}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="TODAS">Todos os Status</SelectItem>
                    <SelectItem value="ENVIADA">Aguardando Análise</SelectItem>
                    <SelectItem value="ANALISADA">Analisadas</SelectItem>
                    <SelectItem value="RASCUNHO">Rascunhos</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}