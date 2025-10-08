"use client";

import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function PartesFilters() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

  
    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300); 

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams);
        if (status && status !== 'TODAS') {
            params.set('status', status);
        } else {
            params.delete('status');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Input
                placeholder="Buscar por aluno ou assunto..."
                className="max-w-sm"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('search')?.toString()}
            />
            <Select
                onValueChange={handleStatusChange}
                defaultValue={searchParams.get('status')?.toString() || 'TODAS'}
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

