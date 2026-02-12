'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'sonner';
import { saveRegrasPromocao } from '@/app/actions/configuracoes';
import { Loader2, Save } from 'lucide-react';

interface Cargo {
  id: string;
  nome: string;
  abreviacao: string;
  precedencia: number;
}

interface Regra {
  id?: string;
  cargoOrigemId: string;
  cargoDestinoId: string;
  minConceito: number;
  minMediaEscolar: number;
  minTaf: number;
}

export default function RegrasPromocaoForm({ cargos, regrasIniciais, modalidadeKey }: { 
  cargos: Cargo[], 
  regrasIniciais: any[], 
  modalidadeKey: string 
}) {
  const [loading, setLoading] = useState(false);
  
  const paresTransicao = cargos
    .sort((a, b) => b.precedencia - a.precedencia) 
    .map((cargo, index, array) => {
      const proximo = array[index + 1];
      if (!proximo) return null; 
      
      const regraExistente = regrasIniciais.find(r => 
        r.cargoOrigemId === cargo.id && r.cargoDestinoId === proximo.id
      );

      return {
        key: `${cargo.id}-${proximo.id}`,
        cargoOrigem: cargo,
        cargoDestino: proximo,
        minConceito: regraExistente?.minConceito ?? 0,
        minMediaEscolar: regraExistente?.minMediaEscolar ?? 0,
        minTaf: regraExistente?.minTaf ?? 0,
      };
    })
    .filter(Boolean);

  const [valores, setValores] = useState<Record<string, Regra>>(() => {
    const inicial: Record<string, Regra> = {};
    paresTransicao.forEach((p: any) => {
      inicial[p.key] = {
        cargoOrigemId: p.cargoOrigem.id,
        cargoDestinoId: p.cargoDestino.id,
        minConceito: p.minConceito,
        minMediaEscolar: p.minMediaEscolar,
        minTaf: p.minTaf,
      };
    });
    return inicial;
  });

  const handleChange = (key: string, field: keyof Regra, value: string) => {
    setValores(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    const payload = Object.values(valores);
    
    try {
      await saveRegrasPromocao(modalidadeKey, payload);
      toast.success("Regras salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar regras.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-md">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-[300px]">Transição de Patente</TableHead>
                <TableHead>Conceito Mínimo (GM)</TableHead>
                <TableHead>Média Escolar Mínima</TableHead>
                <TableHead>Média TAF Mínima</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {paresTransicao.map((par: any) => (
                <TableRow key={par.key}>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <span className="bg-muted px-2 py-1 rounded">{par.cargoOrigem.abreviacao}</span>
                        <span className="text-muted-foreground">➔</span>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded font-bold">{par.cargoDestino.abreviacao}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <Input 
                    type="number" 
                    step="0.5"
                    min="0"
                    max="100"
                    value={valores[par.key]?.minConceito}
                    onChange={(e) => handleChange(par.key, 'minConceito', e.target.value)}
                    className="w-24 font-mono"
                    />
                </TableCell>
                <TableCell>
                    <Input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="10"
                    value={valores[par.key]?.minMediaEscolar}
                    onChange={(e) => handleChange(par.key, 'minMediaEscolar', e.target.value)}
                    className="w-24 font-mono"
                    />
                </TableCell>
                <TableCell>
                    <Input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="10"
                    value={valores[par.key]?.minTaf}
                    onChange={(e) => handleChange(par.key, 'minTaf', e.target.value)}
                    className="w-24 font-mono"
                    />
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end bg-muted/20 p-4 rounded-lg">
        <Button onClick={handleSave} disabled={loading} size="lg" className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}