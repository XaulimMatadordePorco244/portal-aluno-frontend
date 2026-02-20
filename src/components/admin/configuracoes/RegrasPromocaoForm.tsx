'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/Button'; 
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, ArrowRight, Loader2, SlidersHorizontal } from 'lucide-react';
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

interface RequisitoBanco {
  campo: CampoRequisito;
  operador: OperadorLogico;
  valor: string;
}

interface ParRegra {
  cargoOrigem: { id: string; abreviacao: string };
  cargoDestino: { id: string; abreviacao: string };
  requisitosExistentes?: RequisitoBanco[];
}

export default function RegrasPromocaoForm({ pares, modalidade }: { pares: ParRegra[], modalidade: string }) {
  
  const [regras, setRegras] = useState<RegraUI[]>(() => {
    return pares.map(par => ({
      cargoOrigemId: par.cargoOrigem.id,
      cargoDestinoId: par.cargoDestino.id,
      origemNome: par.cargoOrigem.abreviacao,
      destinoNome: par.cargoDestino.abreviacao,
      requisitos: par.requisitosExistentes?.map((r: RequisitoBanco) => ({
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
      // @ts-expect-error: O TS reclama da união de tipos, mas os valores do Select são seguros
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
    } catch  {
      toast.error("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  };

  if (!pares || pares.length === 0) return (
    <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground">
      <SlidersHorizontal className="mb-2 h-8 w-8 opacity-50" />
      <p>Nenhum fluxo configurado para esta modalidade.</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-32">
      
      {regras.map((regra, index) => (
        <Card 
          key={`${regra.cargoOrigemId}-${regra.cargoDestinoId}`} 
          className="group overflow-hidden border-l-4 border-l-primary transition-all hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/20 py-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-background text-base font-medium text-foreground px-3">
                {regra.origemNome}
              </Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge className="text-base font-medium px-3 bg-primary text-primary-foreground hover:bg-primary/90">
                {regra.destinoNome}
              </Badge>
            </div>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => addRequisito(index)} 
              className="h-8 border-dashed border-border bg-transparent hover:bg-muted hover:text-foreground text-muted-foreground"
            >
              <Plus className="mr-2 h-3.5 w-3.5" /> 
              Critério
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-6">
            {regra.requisitos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center text-sm text-muted-foreground">
                <span className="mb-1 block font-medium text-foreground">Promoção Automática</span>
                Nenhum critério restritivo configurado. O aluno será promovido ao atingir o tempo base.
              </div>
            )}

            <div className="grid gap-3">
              {regra.requisitos.map((req) => (
                <div 
                  key={req.id} 
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-all animate-in fade-in slide-in-from-left-2 sm:flex-row sm:items-center sm:gap-4"
                >
                  
                  <div className="flex-1 min-w-[200px]">
                    <Select value={req.campo} onValueChange={(v) => updateRequisito(index, req.id, 'campo', v)}>
                      <SelectTrigger className="h-9 border-input bg-background text-sm ring-offset-background focus:ring-ring">
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

                  <div className="w-full sm:w-[130px]">
                    <Select value={req.operador} onValueChange={(v) => updateRequisito(index, req.id, 'operador', v)}>
                      <SelectTrigger className="h-9 border-input bg-muted/50 font-mono text-xs text-muted-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GTE">Maior ou Igual (&ge;)</SelectItem>
                        <SelectItem value="LTE">Menor ou Igual (&le;)</SelectItem>
                        <SelectItem value="EQ">Igual (=)</SelectItem>
                        <SelectItem value="NEQ">Diferente (!=)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full sm:w-[150px]">
                    {req.campo === 'SEM_NOTA_VERMELHA' ? (
                       <Select value={req.valor} onValueChange={(v) => updateRequisito(index, req.id, 'valor', v)}>
                          <SelectTrigger className="h-9 border-input bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Exigido (Sim)</SelectItem>
                            <SelectItem value="false">Não Exigido</SelectItem>
                          </SelectContent>
                       </Select>
                    ) : (
                      <Input 
                        className="h-9 border-input bg-background font-mono" 
                        placeholder="Valor"
                        value={req.valor}
                        onChange={(e) => updateRequisito(index, req.id, 'valor', e.target.value)}
                      />
                    )}
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" 
                    onClick={() => removeRequisito(index, req.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-md p-4 supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="hidden text-sm text-muted-foreground sm:block">
            <span className="font-medium text-foreground">Atenção:</span> As alterações impactam o cálculo de promoção imediatamente.
          </div>
          <Button 
            size="lg" 
            onClick={handleSaveAll} 
            disabled={saving}
            className="w-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 sm:w-auto font-semibold"
          >
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}