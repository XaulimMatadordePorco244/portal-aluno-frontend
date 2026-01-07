"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { TipoDeAnotacao } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/Button';
import { Filter, Edit, Trash2, Settings, XCircle } from 'lucide-react';
import { deleteTipoDeAnotacao } from './actions';
import { cn } from '@/lib/utils'; // Certifique-se de ter essa função utilitária do shadcn/ui

type FilterType = 'all' | 'elogios' | 'punicoes' | 'fo_positivo' | 'fo_negativo' | 'elogio_aberto' | 'punicao_aberta';

const formatarPontosHeader = (pontos: number | null) => {
  if (pontos === null) return ' Aberto p/ Coordenação ';
  const pontosFormatados = Math.abs(pontos).toFixed(1);
  const texto = `${pontos > 0 ? '+' : ''}${pontosFormatados} Ponto${Math.abs(pontos) !== 1 ? 's' : ''}`;
  return ` ${texto} `;
};

// Função auxiliar para definir as cores
const getGroupStyles = (pontos: number | null, abertoCoordenacao: boolean) => {
  if (abertoCoordenacao) {
    return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
  }
  if (pontos === null) {
    return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700";
  }
  if (pontos > 0) {
    return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
  }
  if (pontos < 0) {
    return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
  }
  // Caso seja exatamente 0 e não aberto
  return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300";
};

export default function QPEList({ itens }: { itens: TipoDeAnotacao[] }) {
  const [filtro, setFiltro] = useState<FilterType>('all');
  const [managingGroupKey, setManagingGroupKey] = useState<string | null>(null);

  const itensFiltrados = useMemo(() => {
    return itens.filter(item => {
      switch (filtro) {
        case 'elogios':
          return item.pontos !== null && item.pontos >= 1;
        case 'punicoes':
          return item.pontos !== null && item.pontos <= -1;
        case 'fo_positivo':
          return item.pontos !== null && item.pontos === 0.5;
        case 'fo_negativo':
          return item.pontos !== null && item.pontos === -0.3;
        case 'elogio_aberto':
          return item.abertoCoordenacao && item.pontos === 0;
        case 'punicao_aberta':
          return item.abertoCoordenacao && item.pontos === 0;
        case 'all':
        default:
          return true;
      }
    });
  }, [itens, filtro]);

  const itensAgrupados = useMemo(() => {
    return itensFiltrados.reduce((acc, item) => {
      const key = item.pontos?.toString() ?? 'manual';
      if (!acc[key]) { acc[key] = []; }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, TipoDeAnotacao[]>);
  }, [itensFiltrados]);

  // Ordena para que os positivos fiquem em cima, negativos em baixo
  const sortedGroupKeys = Object.keys(itensAgrupados).sort((a, b) => {
      if (a === 'manual') return -1; // Manual primeiro (ou ajuste conforme preferência)
      if (b === 'manual') return 1;
      return parseFloat(b) - parseFloat(a);
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtrar por:</span>
        <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={filtro === 'all' ? 'default' : 'outline'} onClick={() => setFiltro('all')}>Todos</Button>
            <Button size="sm" className="text-green-600 border-green-200 hover:bg-green-50" variant={filtro === 'elogios' ? 'secondary' : 'outline'} onClick={() => setFiltro('elogios')}>Elogios</Button>
            <Button size="sm" className="text-red-600 border-red-200 hover:bg-red-50" variant={filtro === 'punicoes' ? 'secondary' : 'outline'} onClick={() => setFiltro('punicoes')}>Punições</Button>
            <Button size="sm" variant={filtro === 'fo_positivo' ? 'default' : 'outline'} onClick={() => setFiltro('fo_positivo')}>FO+</Button>
            <Button size="sm" variant={filtro === 'fo_negativo' ? 'default' : 'outline'} onClick={() => setFiltro('fo_negativo')}>FO-</Button>
             {/* Botões de coordenação simplificados para caber melhor */}
            <Button size="sm" className="text-yellow-600 border-yellow-200" variant={filtro === 'elogio_aberto' ? 'secondary' : 'outline'} onClick={() => setFiltro('elogio_aberto')}>Coord. (E)</Button>
            <Button size="sm" className="text-yellow-600 border-yellow-200" variant={filtro === 'punicao_aberta' ? 'secondary' : 'outline'} onClick={() => setFiltro('punicao_aberta')}>Coord. (P)</Button>
        </div>
      </div>

      <div className="space-y-6">
        {sortedGroupKeys.length > 0 ? (
          sortedGroupKeys.map(key => {
            const groupItens = itensAgrupados[key];
            const itemExemplo = groupItens[0];
            const pontos = itemExemplo.pontos;
            const isManaging = managingGroupKey === key;
            
            // Usa a nova função de estilos
            const groupStyles = getGroupStyles(pontos, itemExemplo.abertoCoordenacao);
            
            return (
              <div key={key} className="shadow-sm rounded-lg overflow-hidden border">
                
                {/* Cabeçalho do Grupo */}
                <div className={cn("flex items-center p-3 border-b transition-colors", groupStyles)}>
                  <div className="w-1/3 text-xs opacity-75 font-semibold uppercase tracking-wider">
                    {groupItens.length} item(s)
                  </div> 
                  <h3 className="w-1/3 text-center font-bold text-lg">
                    {formatarPontosHeader(pontos)}
                  </h3>
                  <div className="w-1/3 flex justify-end"> 
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setManagingGroupKey(isManaging ? null : key)}
                        className="hover:bg-black/10 dark:hover:bg-white/10"
                    >
                      {isManaging ? <XCircle className="mr-2 h-4 w-4" /> : <Settings className="mr-2 h-4 w-4" />}
                      {isManaging ? 'Fechar' : 'Gerenciar'}
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[30%]">Título</TableHead>
                      <TableHead>Descrição</TableHead>
                      {isManaging && <TableHead className="w-[100px] text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupItens.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.titulo}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.descricao}</TableCell>
                        {isManaging && (
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Link href={`/admin/qpe/edit/${item.id}`} passHref>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <form action={deleteTipoDeAnotacao}>
                                <input type="hidden" name="id" value={item.id} />
                                <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    className="h-8 w-8" 
                                    onClick={(e) => !window.confirm(`Tem certeza que deseja excluir "${item.titulo}"?`) && e.preventDefault()}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </form>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
            <Filter className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium text-muted-foreground">
                Nenhum item corresponde ao filtro selecionado.
            </p>
            <Button variant="link" onClick={() => setFiltro('all')} className="mt-2">
                Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}