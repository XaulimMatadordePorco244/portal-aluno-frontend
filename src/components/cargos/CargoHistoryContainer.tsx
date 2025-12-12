'use client';

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  RefreshCw, 
  History,
  AlertTriangle
} from 'lucide-react';
import CargoTimeline from './CargoTimeline';
import TransicaoCargoModal from './TransicaoCargoModal';
import { useCargoHistory, reverterCargo, inicializarHistorico } from '@/hooks/useCargoHistory';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CargoHistoryContainerProps {
  alunoId: string;
  cargos: Array<{ id: string; nome: string; abreviacao: string }>;
  alunoNome?: string;
}

const CargoHistoryContainer: React.FC<CargoHistoryContainerProps> = ({
  alunoId,
  cargos,
  alunoNome
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isInicializando, setIsInicializando] = useState(false);
  const [reverterDialogOpen, setReverterDialogOpen] = useState(false);
  const [blocoParaReverter, setBlocoParaReverter] = useState<string | null>(null);
  const { historico, isLoading, mutate } = useCargoHistory(alunoId);
  const { user, isAdmin, loading: authLoading } = useAuth();

  const handleReverter = async (blocoId: string) => {
    if (!isAdmin) {
      toast.error('Você não tem permissão para realizar esta ação.');
      return;
    }

    setBlocoParaReverter(blocoId);
    setReverterDialogOpen(true);
  };

  const confirmReverter = async () => {
    if (!blocoParaReverter || !user) return;

    try {
      await reverterCargo({
        alunoId,
        motivo: `Reversão solicitada por ${user.nome}`
      });
      mutate();
      toast.success('Transição revertida com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Não foi possível reverter a transição');
    } finally {
      setReverterDialogOpen(false);
      setBlocoParaReverter(null);
    }
  };

  const handleInicializar = async () => {
    if (!isAdmin) {
      toast.error('Você não tem permissão para realizar esta ação.');
      return;
    }

    setIsInicializando(true);
    try {
      await inicializarHistorico(alunoId);
      mutate();
      toast.success('Histórico inicializado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Não foi possível inicializar o histórico');
    } finally {
      setIsInicializando(false);
    }
  };

  const cargoAtual = historico?.find(item => item.status === 'ATIVO')?.cargo;

  if (authLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Verificando permissões...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Histórico de Cargos
              </h2>
              {alunoNome && (
                <p className="text-muted-foreground">
                  Aluno: <span className="font-medium">{alunoNome}</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {isAdmin && (!historico || historico.length === 0) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleInicializar}
                    disabled={isInicializando}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isInicializando ? 'animate-spin' : ''}`} />
                    Inicializar Histórico
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Criar histórico inicial para este aluno</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {isAdmin && cargos.length > 0 && (
              <Button
                onClick={() => setModalVisible(true)}
                disabled={isLoading}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Transição
              </Button>
            )}
          </div>
        </div>

        {isAdmin && (!historico || historico.length === 0) && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Histórico não inicializado</AlertTitle>
            <AlertDescription>
              Este aluno ainda não possui histórico de cargos. Clique em &quot;Inicializar Histórico&quot; para criar o registro inicial.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Linha do Tempo de Cargos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CargoTimeline
              alunoId={alunoId}
              isAdmin={isAdmin}
              onReverter={handleReverter}
              showReverter={!!historico && historico.length > 1}
            />
          </CardContent>
        </Card>

        {isAdmin && cargos.length > 0 && (
          <TransicaoCargoModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSuccess={() => mutate()}
            alunoId={alunoId}
            cargos={cargos}
            cargoAtual={cargoAtual}
            adminNome={user?.nome}
          />
        )}

        <AlertDialog open={reverterDialogOpen} onOpenChange={setReverterDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Reversão</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>Tem certeza que deseja reverter esta transição?</p>
                  
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>O cargo anterior será restaurado</li>
                        <li>As anotações deste período serão movidas para o período anterior</li>
                        <li>Esta ação será registrada em logs de auditoria</li>
                        <li>A reversão não pode ser desfeita automaticamente</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmReverter}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Confirmar Reversão
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default CargoHistoryContainer;