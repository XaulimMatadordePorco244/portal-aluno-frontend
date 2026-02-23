'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { realizarTransicaoCargo } from '@/hooks/useCargoHistory';
import { toast } from 'sonner';
import { Info, AlertTriangle } from 'lucide-react';

interface TransicaoCargoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  alunoId: string;
  cargos: Array<{ id: string; nome: string; abreviacao: string }>;
  cargoAtual?: { id: string; nome: string };
  adminNome?: string;
}

const TransicaoCargoModal: React.FC<TransicaoCargoModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  alunoId,
  cargos,
  cargoAtual,
  adminNome
}) => {
  const [loading, setLoading] = useState(false);
  const [tipoTransicao, setTipoTransicao] = useState<'PROMOCAO' | 'DESPROMOCAO'>('PROMOCAO');
  const [novoCargoId, setNovoCargoId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [erroPermissao, setErroPermissao] = useState('');

  useEffect(() => {
    if (open) {
      // Resetar o formulário quando o modal abrir
      setTipoTransicao('PROMOCAO');
      setNovoCargoId('');
      setMotivo('');
      setErroPermissao('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!novoCargoId) {
      toast.error('Selecione o novo cargo');
      return;
    }

    setLoading(true);
    setErroPermissao('');

    try {
      const result = await realizarTransicaoCargo({
        alunoId,
        novoCargoId,
        tipo: tipoTransicao,
        motivo: motivo || undefined
      });

      toast.success(
        `Transição realizada com sucesso! ${result.aluno?.nome ? `${result.aluno.nome} agora é ${result.cargoNovo?.nome}` :
          'Transição registrada'
        }`
      );

      setNovoCargoId('');
      setMotivo('');

      onSuccess();

      onOpenChange(false);
    } catch (error) {
      if (error instanceof Error && (error.message.includes('Acesso negado') || error.message.includes('Não autorizado'))) {
        setErroPermissao(error.message);
        toast.error('Você não tem permissão para realizar esta ação');
      } else {
        toast.error(error instanceof Error ? error.message : 'Erro ao realizar transição');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Nova Transição de Cargo</DialogTitle>
          <DialogDescription>
            Realize promoções ou despromoções para alterar o cargo do aluno
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {erroPermissao && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro de Permissão</AlertTitle>
              <AlertDescription>{erroPermissao}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo de Transição *</Label>
              <Select
                value={tipoTransicao}
                onValueChange={(value: 'PROMOCAO' | 'DESPROMOCAO') => setTipoTransicao(value)}
                disabled={loading}
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROMOCAO">Promoção</SelectItem>
                  <SelectItem value="DESPROMOCAO">Despromoção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="novoCargo">
                Novo Cargo *
                <span className="text-xs font-normal text-muted-foreground ml-2">
                  {tipoTransicao === 'PROMOCAO' ? 'Selecione um cargo superior' : 'Selecione um cargo inferior'}
                </span>
              </Label>
              <Select
                value={novoCargoId}
                onValueChange={setNovoCargoId}
                disabled={loading}
              >
                <SelectTrigger id="novoCargo">
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  {cargos.map((cargo) => (
                    <SelectItem key={cargo.id} value={cargo.id}>
                      {cargo.nome} ({cargo.abreviacao})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="motivo">
                Motivo
                <span className="text-xs font-normal text-muted-foreground ml-2">
                  (Opcional)
                </span>
              </Label>
              <Textarea
                id="motivo"
                placeholder="Ex: Mérito por desempenho excepcional, Conclusão de curso, etc."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                maxLength={500}
                disabled={loading}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {motivo.length}/500 caracteres
              </p>
            </div>

            {cargoAtual && (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Informações Importantes</AlertTitle>
                <AlertDescription className="space-y-2 text-blue-700">
                  <div className="space-y-1">
                    <p><strong>Cargo atual:</strong> {cargoAtual.nome}</p>
                    <p><strong>Responsável:</strong> {adminNome || 'Administrador'}</p>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>O conceito será redefinido para 7.0</li>
                    <li>As anotações permanecerão no período anterior</li>
                    <li>Um novo bloco de histórico será criado</li>
                    <li>A ação será registrada em logs de auditoria</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Confirmando..." : "Confirmar Transição"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransicaoCargoModal;