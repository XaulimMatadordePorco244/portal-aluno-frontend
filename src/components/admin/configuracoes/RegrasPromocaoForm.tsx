'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { saveRegrasDinamicas, RegraDinamicaInput } from '@/app/actions/configuracoes';
import { CampoRequisito, OperadorLogico } from '@prisma/client';

interface RequisitoUI {
  id: string; 
  campo: CampoRequisito;
  operador: OperadorLogico;
  valor: string;
}

interface RegraUI {
  cargoOrigemId: string;
  cargoDestinoId: string;
  origemNome: string;
  destinoNome: string;
  requisitos: RequisitoUI[];
}

export default function RegrasPromocaoForm({ pares, modalidade }: { pares: any[], modalidade: string }) {
  
  const [regras, setRegras] = useState<RegraUI[]>(() => {
    return pares.map(par => ({
      cargoOrigemId: par.cargoOrigem.id,
      cargoDestinoId: par.cargoDestino.id,
      origemNome: par.cargoOrigem.abreviacao,
      destinoNome: par.cargoDestino.abreviacao,
      requisitos: par.requisitosExistentes?.map((r: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        campo: r.campo,
        operador: r.operador,
        valor: r.valor
      })) || []
    }));
  });

  const [saving, setSaving] = useState(false);


  const addRequisito = (indexRegra: number) => {
    const novasRegras = [...regras];
    novasRegras[indexRegra].requisitos.push({
      id: Math.random().toString(36).substr(2, 9),
      campo: 'MEDIA_ESCOLAR', 
      operador: 'GTE',         
      valor: '0'
    });
    setRegras(novasRegras);
  };

  const removeRequisito = (indexRegra: number, idRequisito: string) => {
    const novasRegras = [...regras];
    novasRegras[indexRegra].requisitos = novasRegras[indexRegra].requisitos.filter(r => r.id !== idRequisito);
    setRegras(novasRegras);
  };

  const updateRequisito = (indexRegra: number, idRequisito: string, field: keyof RequisitoUI, value: string) => {
    const novasRegras = [...regras];
    const requisito = novasRegras[indexRegra].requisitos.find(r => r.id === idRequisito);
    if (requisito) {
      // @ts-ignore - Typescript 
      requisito[field] = value;
      setRegras(novasRegras);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);

    const payload: RegraDinamicaInput[] = regras.map(r => ({
      cargoOrigemId: r.cargoOrigemId,
      cargoDestinoId: r.cargoDestinoId,
      requisitos: r.requisitos.map(req => ({
        campo: req.campo,
        operador: req.operador,
        valor: req.valor
      }))
    }));

    try {
      const result = await saveRegrasDinamicas(modalidade, payload);
      if (result.success) {
        toast.success("Regras de promoção atualizadas com sucesso!");
      } else {
        toast.error("Erro ao salvar: " + result.error);
      }
    } catch (e) {
      toast.error("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  };

  if (!pares || pares.length === 0) return <div>Nenhum fluxo configurado.</div>;

  return (
    <div className="space-y-6 max-w-5xl pb-20">
      
      {regras.map((regra, index) => (
        <Card key={`${regra.cargoOrigemId}-${regra.cargoDestinoId}`} className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="bg-slate-50/50 pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-bold flex items-center gap-3">
                <Badge variant="outline" className="text-sm px-3 py-1 bg-white">{regra.origemNome}</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="default" className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700">{regra.destinoNome}</Badge>
              </CardTitle>
              <Button size="sm" variant="secondary" onClick={() => addRequisito(index)} className="text-xs h-8">
                <Plus className="w-3 h-3 mr-1.5" /> Adicionar Critério
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4 space-y-2">
            {regra.requisitos.length === 0 && (
              <p className="text-sm text-muted-foreground italic pl-1">Nenhum requisito configurado (Promoção Automática).</p>
            )}

            {regra.requisitos.map((req) => (
              <div key={req.id} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-1">
                
                <div className="flex-1 min-w-[180px]">
                  <Select value={req.campo} onValueChange={(v) => updateRequisito(index, req.id, 'campo', v)}>
                    <SelectTrigger className="h-9 text-xs font-semibold">
                      <SelectValue placeholder="Selecione o critério" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEDIA_ESCOLAR">Média Escolar</SelectItem>
                      <SelectItem value="CONCEITO">Conceito (Pontos)</SelectItem>
                      <SelectItem value="TAF">TAF (Média Física)</SelectItem>
                      <SelectItem value="INTERSTICIO_MESES">Tempo de Serviço (Meses)</SelectItem>
                      <SelectItem value="PUNICOES_GRAVES">Qtd. Punições Graves</SelectItem>
                      <SelectItem value="SEM_NOTA_VERMELHA">Sem Nota Vermelha</SelectItem>
                      <SelectItem value="NOTA_PROVA_TEORICA">Nota Prova Interna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[100px]">
                  <Select value={req.operador} onValueChange={(v) => updateRequisito(index, req.id, 'operador', v)}>
                    <SelectTrigger className="h-9 text-xs bg-slate-100 font-mono text-center">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GTE">{'>='} (Min)</SelectItem>
                      <SelectItem value="LTE">{'<='} (Máx)</SelectItem>
                      <SelectItem value="EQ">{'='} (Igual)</SelectItem>
                      <SelectItem value="NEQ">{'!='} (Dif)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[120px]">
                  {req.campo === 'SEM_NOTA_VERMELHA' ? (
                     <Select value={req.valor} onValueChange={(v) => updateRequisito(index, req.id, 'valor', v)}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Sim (Exigido)</SelectItem>
                          <SelectItem value="false">Não</SelectItem>
                        </SelectContent>
                     </Select>
                  ) : (
                    <Input 
                      className="h-9 text-xs font-mono" 
                      placeholder="Valor"
                      value={req.valor}
                      onChange={(e) => updateRequisito(index, req.id, 'valor', e.target.value)}
                    />
                  )}
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-muted-foreground hover:text-red-600 hover:bg-red-50" 
                  onClick={() => removeRequisito(index, req.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t z-50 flex justify-end gap-4 container mx-auto max-w-5xl">
        <div className="flex-1 flex items-center text-sm text-muted-foreground">
          <span className="hidden sm:inline">Configure os critérios acima e clique em salvar para aplicar ao próximo ciclo.</span>
        </div>
        <Button 
          size="lg" 
          onClick={handleSaveAll} 
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 shadow-lg transition-all"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Salvar Configurações</>
          )}
        </Button>
      </div>
    </div>
  );
}