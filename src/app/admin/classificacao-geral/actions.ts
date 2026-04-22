'use server'

import { revalidateTag } from 'next/cache';

export async function recarregarCacheClassificacao() {
  revalidateTag('classificacao_geral');
  return { success: true, message: 'Classificação atualizada com sucesso!' };
}