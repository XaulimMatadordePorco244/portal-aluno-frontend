import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

const API_BASE = '/api/cargos';

export interface CargoHistoryItem {
  id: string;
  cargoNomeSnapshot: string;
  conceitoInicial: number;
  conceitoAtual: number;
  dataInicio: string;
  dataFim?: string;
  status: 'ATIVO' | 'FECHADO' | 'REVERTIDO';
  motivo?: string;
  cargo: {
    id: string;
    nome: string;
    abreviacao: string;
  };
  anotacoes: Array<{
    id: string;
    pontos: number;
    detalhes?: string;
    data: string;
    tipo: {
      id: string;
      titulo: string;
    };
    autor: {
      id: string;
      nome: string;
      role: string;
    };
  }>;
  logs?: Array<{
    id: string;
    tipo: 'PROMOCAO' | 'DESPROMOCAO' | 'REVERSAO';
    motivo?: string;
    metadata: any;
    createdAt: string;
    admin: {
      id: string;
      nome: string;
    };
  }>;
}

export interface TransicaoCargoData {
  alunoId: string;
  novoCargoId: string;
  tipo: 'PROMOCAO' | 'DESPROMOCAO';
  motivo?: string;
}

export interface ReversaoCargoData {
  alunoId: string;
  motivo?: string;
}

export function useCargoHistory(alunoId?: string) {
  const { data, error, isLoading, mutate } = useSWR<CargoHistoryItem[]>(
    alunoId ? `${API_BASE}/historico?alunoId=${alunoId}` : null,
    fetcher
  );

  return {
    historico: data,
    isLoading,
    error,
    mutate
  };
}

export async function realizarTransicaoCargo(data: TransicaoCargoData) {
  const response = await fetch(`${API_BASE}/transicao`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao realizar transição');
  }

  return response.json();
}

export async function reverterCargo(data: ReversaoCargoData) {
  const response = await fetch(`${API_BASE}/reverter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao reverter cargo');
  }

  return response.json();
}

export async function inicializarHistorico(alunoId: string) {
  const response = await fetch(`${API_BASE}/inicializar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ alunoId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao inicializar histórico');
  }

  return response.json();
}