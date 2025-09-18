// src/app/(admin)/admin/qpe/qpe-list.tsx
"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { TipoDeAnotacao } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/Button';
import { Filter, Edit, Trash2, Settings, XCircle } from 'lucide-react';
import { deleteTipoDeAnotacao } from './actions';

type FilterType = 'all' | 'elogios' | 'punicoes' | 'fo_positivo' | 'fo_negativo' | 'elogio_aberto' | 'punicao_aberta';

// ===== MODIFICAÇÃO: Adicionando o prefixo '_' e garantindo o estilo =====
const formatarPontosHeader = (pontos: number | null) => {
  if (pontos === null) return ' Aberto p/ Coordenação ';
  const pontosFormatados = Math.abs(pontos).toFixed(1);
  const texto = `${pontos > 0 ? '+' : '-'}${pontosFormatados} Ponto${Math.abs(pontos) !== 1 ? 's' : ''}`;
  return ` ${texto} `;
};

export default function QPEList({ itens }: { itens: TipoDeAnotacao[] }) {
  const [filtro, setFiltro] = useState<FilterType>('all');
  const [managingGroupKey, setManagingGroupKey] = useState<string | null>(null);

  const itensFiltrados = useMemo(() => {
    // ===== MODIFICAÇÃO: Lógica do filtro corrigida para ser mais específica =====
    return itens.filter(item => {
      switch (filtro) {
        case 'elogios':
          return item.pontos !== null && item.pontos >= 1;
        case 'punicoes':
          return item.pontos !== null && item.pontos <= -1;
        case 'fo_positivo':
          return item.codigo === 'FO_POSITIVO' && item.pontos === 0.5; // Específico para FO+
        case 'fo_negativo':
          return item.codigo === 'FO_NEGATIVO' && item.pontos === -0.3; // Específico para FO-
        case 'elogio_aberto':
          return item.abertoCoordenacao && item.codigo === 'FO_POSITIVO';
        case 'punicao_aberta':
          return item.abertoCoordenacao && item.codigo === 'FO_NEGATIVO';
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

  const sortedGroupKeys = Object.keys(itensAgrupados).sort((a, b) => parseFloat(b) - parseFloat(a));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium">Filtrar por:</span>
        <Button size="sm" variant={filtro === 'all' ? 'default' : 'outline'} onClick={() => setFiltro('all')}>Todos</Button>
        <Button size="sm" variant={filtro === 'elogios' ? 'default' : 'outline'} onClick={() => setFiltro('elogios')}>Elogios (Pontos)</Button>
        <Button size="sm" variant={filtro === 'punicoes' ? 'default' : 'outline'} onClick={() => setFiltro('punicoes')}>Punições (Pontos)</Button>
        <Button size="sm" variant={filtro === 'fo_positivo' ? 'default' : 'outline'} onClick={() => setFiltro('fo_positivo')}>FO+ (+0.5)</Button>
        <Button size="sm" variant={filtro === 'fo_negativo' ? 'default' : 'outline'} onClick={() => setFiltro('fo_negativo')}>FO- (-0.3)</Button>
        <Button size="sm" variant={filtro === 'elogio_aberto' ? 'default' : 'outline'} onClick={() => setFiltro('elogio_aberto')}>Elogios (Coord.)</Button>
        <Button size="sm" variant={filtro === 'punicao_aberta' ? 'default' : 'outline'} onClick={() => setFiltro('punicao_aberta')}>Punições (Coord.)</Button>
      </div>

      <div className="space-y-6">
        {sortedGroupKeys.length > 0 ? (
          sortedGroupKeys.map(key => {
            const groupItens = itensAgrupados[key];
            const pontos = groupItens[0].pontos;
            const isManaging = managingGroupKey === key;
            const groupColor = groupItens[0].abertoCoordenacao ? 'bg-yellow-100' : pontos === null ? 'bg-gray-100' : pontos > 0 ? 'bg-green-100' : 'bg-red-100';
            
            return (
              <div key={key}>
                {/* ===== MODIFICAÇÃO: Layout do cabeçalho corrigido para centralizar o título ===== */}
                <div className={`flex items-center p-2 rounded-t-lg ${groupColor}`}>
                  <div className="w-1/3"></div> {/* Espaçador esquerdo */}
                  <h3 className="w-1/3 text-center font-bold text-lg">{formatarPontosHeader(pontos)}</h3>
                  <div className="w-1/3 flex justify-end"> {/* Container para o botão à direita */}
                    <Button variant="ghost" size="sm" onClick={() => setManagingGroupKey(isManaging ? null : key)}>
                      {isManaging ? <XCircle className="mr-2 h-4 w-4" /> : <Settings className="mr-2 h-4 w-4" />}
                      {isManaging ? 'Concluir' : 'Gerenciar'}
                    </Button>
                  </div>
                </div>
                <Table className="border">
                  <TableHeader>
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
                        <TableCell className="text-sm text-gray-600">{item.descricao}</TableCell>
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
                                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => !window.confirm(`Tem certeza que deseja excluir "${item.titulo}"?`) && e.preventDefault()}>
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
          <p className="text-center text-gray-500 py-10">
            Nenhum item corresponde ao filtro selecionado.
          </p>
        )}
      </div>
    </div>
  );
}