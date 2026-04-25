'use client'

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button'; 
import { toast } from 'sonner';
import { recarregarCacheClassificacao } from './actions';

export function RefreshButton() {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await recarregarCacheClassificacao();
      if (res.success) {
        toast.success(res.message);
      }
    } catch {
      toast.error('Erro ao atualizar a classificação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleRefresh} 
      disabled={loading}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      Atualizar Dados
    </Button>
  );
}