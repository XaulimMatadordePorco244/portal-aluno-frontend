'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/Button'; 
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowRight, Edit2, Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { saveRegrasDinamicas } from '@/app/actions/configuracoes';
import { CampoRequisito, OperadorLogico } from '@prisma/client';

interface ParRegra {
  cargoOrigem: { id: string; abreviacao: string; nome: string };
  cargoDestino: { id: string; abreviacao: string; nome: string };
  minMediaEscolar: number;
  minConceito: number;
  minTaf: number;
  mesesIntersticio: number;
  exigeProvaTeorica: boolean;
  minNotaProvaTeorica: number;
  exigeSemNotaVermelha: boolean;
}

interface RegrasPromocaoFormProps {
  pares: ParRegra[];
  modalidade: string;
}

export default function RegrasPromocaoForm({ pares, modalidade }: RegrasPromocaoFormProps) {
  return (
    <div className="space-y-6 pb-10">
      {pares.map((par) => (
        <RegraCardItem 
          key={`${par.cargoOrigem.id}-${par.cargoDestino.id}`} 
          par={par} 
          modalidade={modalidade} 
        />
      ))}
    </div>
  );
}

function RegraCardItem({ par, modalidade }: { par: ParRegra, modalidade: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    minConceito: par.minConceito,
    minTaf: par.minTaf,
    minMediaEscolar: par.minMediaEscolar,
    mesesIntersticio: par.mesesIntersticio,
    exigeProvaTeorica: par.exigeProvaTeorica,
    minNotaProvaTeorica: par.minNotaProvaTeorica,
    exigeSemNotaVermelha: par.exigeSemNotaVermelha,
  });

  const handleCancel = () => {
    setFormData({
      minConceito: par.minConceito,
      minTaf: par.minTaf,
      minMediaEscolar: par.minMediaEscolar,
      mesesIntersticio: par.mesesIntersticio,
      exigeProvaTeorica: par.exigeProvaTeorica,
      minNotaProvaTeorica: par.minNotaProvaTeorica,
      exigeSemNotaVermelha: par.exigeSemNotaVermelha,
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const requisitosFormatados = [];

    if (formData.minConceito > 0) {
      requisitosFormatados.push({ campo: CampoRequisito.CONCEITO, operador: OperadorLogico.GTE, valor: String(formData.minConceito) });
    }
    if (formData.minTaf > 0) {
      requisitosFormatados.push({ campo: CampoRequisito.TAF, operador: OperadorLogico.GTE, valor: String(formData.minTaf) });
    }
    if (formData.minMediaEscolar > 0) {
      requisitosFormatados.push({ campo: CampoRequisito.MEDIA_ESCOLAR, operador: OperadorLogico.GTE, valor: String(formData.minMediaEscolar) });
    }
    if (formData.mesesIntersticio > 0) {
      requisitosFormatados.push({ campo: CampoRequisito.INTERSTICIO_MESES, operador: OperadorLogico.GTE, valor: String(formData.mesesIntersticio) });
    }
    if (formData.exigeProvaTeorica) {
      requisitosFormatados.push({ campo: CampoRequisito.NOTA_PROVA_TEORICA, operador: OperadorLogico.GTE, valor: String(formData.minNotaProvaTeorica) });
    }
    if (formData.exigeSemNotaVermelha) {
      requisitosFormatados.push({ campo: CampoRequisito.SEM_NOTA_VERMELHA, operador: OperadorLogico.EQ, valor: 'true' });
    }

    const payload = [{
      cargoOrigemId: par.cargoOrigem.id,
      cargoDestinoId: par.cargoDestino.id,
      requisitos: requisitosFormatados
    }];

    try {
      const result = await saveRegrasDinamicas(modalidade, payload);
      
      if (result.success) {
        toast.success(`Regra de ${par.cargoOrigem.abreviacao} salva!`);
        setIsEditing(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Erro ao salvar regra.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className={`border-l-4 transition-all ${isEditing ? 'border-l-primary ring-1 ring-primary/20' : 'border-l-muted'}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted/20 py-4">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm px-3 py-1 font-bold">
            {par.cargoOrigem.abreviacao}
          </Badge>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <Badge className="text-sm px-3 py-1 font-bold bg-primary text-primary-foreground">
            {par.cargoDestino.abreviacao}
          </Badge>
        </div>

        <div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" /> Editar Regra
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {!isEditing && (
          <div className="flex flex-wrap gap-2">
            {par.minConceito > 0 && <Badge variant="secondary">Conceito Mín: {par.minConceito}</Badge>}
            {par.minTaf > 0 && <Badge variant="secondary">TAF Mín: {par.minTaf}</Badge>}
            {par.minMediaEscolar > 0 && <Badge variant="secondary">Média Escolar: {par.minMediaEscolar}</Badge>}
            {par.mesesIntersticio > 0 && <Badge variant="secondary">Interstício: {par.mesesIntersticio} meses</Badge>}
            {par.exigeProvaTeorica && <Badge variant="secondary">Prova Teórica (Mín: {par.minNotaProvaTeorica})</Badge>}
            {par.exigeSemNotaVermelha && <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">Sem Notas Vermelhas</Badge>}
            
            {par.minConceito === 0 && par.minTaf === 0 && par.minMediaEscolar === 0 && par.mesesIntersticio === 0 && !par.exigeProvaTeorica && !par.exigeSemNotaVermelha && (
               <span className="text-sm text-muted-foreground italic">Nenhum requisito configurado.</span>
            )}
          </div>
        )}

        {isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-muted/10 p-4 rounded-lg border">
            <div className="space-y-2">
              <Label>Conceito Mínimo </Label>
              <Input 
                type="number" step="0.1" 
                value={formData.minConceito} 
                onChange={(e) => setFormData({...formData, minConceito: Number(e.target.value)})} 
              />
            </div>
            
            <div className="space-y-2">
              <Label>TAF Mínimo </Label>
              <Input 
                type="number" step="0.1" 
                value={formData.minTaf} 
                onChange={(e) => setFormData({...formData, minTaf: Number(e.target.value)})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Média Escolar Mín</Label>
              <Input 
                type="number" step="0.1" 
                value={formData.minMediaEscolar} 
                onChange={(e) => setFormData({...formData, minMediaEscolar: Number(e.target.value)})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Interstício (Meses)</Label>
              <Input 
                type="number" 
                value={formData.mesesIntersticio} 
                onChange={(e) => setFormData({...formData, mesesIntersticio: Number(e.target.value)})} 
              />
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Switch 
                checked={formData.exigeProvaTeorica} 
                onCheckedChange={(c) => setFormData({...formData, exigeProvaTeorica: c})} 
              />
              <Label>Exigir Prova Teórica?</Label>
            </div>

            {formData.exigeProvaTeorica && (
              <div className="space-y-2">
                <Label>Nota Mínima Prova (0-10)</Label>
                <Input 
                  type="number" step="0.1" 
                  value={formData.minNotaProvaTeorica} 
                  onChange={(e) => setFormData({...formData, minNotaProvaTeorica: Number(e.target.value)})} 
                />
              </div>
            )}

            <div className="flex items-center space-x-2 pt-4 md:col-span-2">
              <Switch 
                checked={formData.exigeSemNotaVermelha} 
                onCheckedChange={(c) => setFormData({...formData, exigeSemNotaVermelha: c})} 
              />
              <Label className="text-red-600 font-medium">Bloquear se tiver Nota Vermelha no Boletim?</Label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}