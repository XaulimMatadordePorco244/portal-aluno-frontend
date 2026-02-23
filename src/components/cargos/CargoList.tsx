'use client';

import React, { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Filter,
  Users
} from 'lucide-react';
import Image from 'next/image';
import CargoForm from './CargoForm'; 

interface CargoData {
  id: string;
  nome: string;
  abreviacao: string;
  codigo?: number;
  categoria: 'FORMACAO' | 'QUADRO';
  tipo: 'POSTO' | 'GRADUACAO' | 'CURSO';
  precedencia: number;
  classe?: 'SUPERIOR' | 'INTERMEDIARIO' | 'SUBALTERNO';
  divisaUrl?: string;
  alunosCount: number;
  historicoCount: number;
  createdAt: Date;
}

interface CargoListProps {
  cargos: CargoData[];
}

export default function CargoList({ cargos: initialCargos }: CargoListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('TODOS');
  
  const filteredCargos = useMemo(() => {
    return initialCargos.filter((cargo) => {
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = 
        cargo.nome.toLowerCase().includes(searchLower) ||
        cargo.abreviacao.toLowerCase().includes(searchLower) ||
        (cargo.codigo?.toString().includes(searchLower) ?? false);

      const matchesType = tipoFilter === 'TODOS' || cargo.tipo === tipoFilter;

      return matchesSearch && matchesType;
    });
  }, [initialCargos, searchTerm, tipoFilter]);

  const formatText = (text?: string) => {
    if (!text) return '-';
    return text.charAt(0) + text.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, sigla ou número..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Tipo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="POSTO">Postos</SelectItem>
              <SelectItem value="GRADUACAO">Graduações</SelectItem>
              <SelectItem value="CURSO">Cursos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">
            {filteredCargos.length} registros
          </span>
          <CargoForm cargosExistentes={initialCargos} />
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-20 text-center font-semibold">Hierarquia</TableHead>
              <TableHead className="w-[100px] font-semibold">Número</TableHead>
              <TableHead className="w-[100px] font-semibold">Abrev.</TableHead>
              <TableHead className="font-semibold">Cargo</TableHead>
              <TableHead className="font-semibold">Classificação</TableHead>
              <TableHead className="font-semibold">Categoria</TableHead>
              <TableHead className="text-center font-semibold">Divisa</TableHead>
              <TableHead className="text-right font-semibold">Utilização</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCargos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  Nenhum cargo encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              filteredCargos.map((cargo) => (
                <TableRow key={cargo.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="text-center font-mono text-muted-foreground">
                    #{cargo.precedencia}
                  </TableCell>

                  <TableCell className="font-mono text-sm">
                    {cargo.codigo ? cargo.codigo : <span className="text-muted-foreground/50">-</span>}
                  </TableCell>

                  <TableCell className="font-semibold text-xs uppercase tracking-wider text-foreground/80">
                    {cargo.abreviacao}
                  </TableCell>

                  <TableCell className="font-medium text-foreground">
                    {cargo.nome}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex flex-col">
                      <span className="text-foreground">{formatText(cargo.tipo)}</span>
                      {cargo.classe && (
                        <span className="text-xs opacity-70">{formatText(cargo.classe)}</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatText(cargo.categoria)}
                  </TableCell>

                  <TableCell className="text-center">
                    {cargo.divisaUrl ? (
                      <div className="relative w-8 h-8 mx-auto group">
                        <Image 
                          src={cargo.divisaUrl} 
                          alt={`Divisa ${cargo.abreviacao}`}
                          fill
                          className="object-contain transition-transform group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">-</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                      <span>{cargo.alunosCount}</span>
                      <Users className="h-3 w-3" />
                    </div>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <CargoForm 
                          cargo={cargo} 
                          cargosExistentes={initialCargos}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}