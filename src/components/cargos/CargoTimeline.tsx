'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  Clock,
  XCircle,
  History,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCargoHistory } from '@/hooks/useCargoHistory';

interface CargoTimelineProps {
  alunoId: string;
  isAdmin?: boolean;
  onReverter?: (blocoId: string) => Promise<void>;
  showReverter?: boolean;
}

interface AnotacaoItem {
  id: string;
  pontos: number;
  tipo: {
    titulo: string;
  };
  detalhes?: string;
  autor: {
    nome: string;
  };
}

interface HistoricoItem {
  id: string;
  cargoNomeSnapshot: string;
  status: 'ATIVO' | 'FECHADO' | 'REVERTIDO';
  dataInicio: string;
  dataFim?: string;
  conceitoAtual: number;
  motivo?: string;
  anotacoes: AnotacaoItem[];
}



function CargoTimelineItem({
  item,
  index,
  historico,
  isAdmin,
  onReverter,
  showReverter,
  getStatusIcon,
  getStatusColor,
  getAnotacaoColor,
  formatDate
}: {
  item: HistoricoItem;
  index: number;
  historico: HistoricoItem[];
  isAdmin: boolean;
  onReverter?: (blocoId: string) => Promise<void>;
  showReverter?: boolean;
  getStatusIcon: (status: string) => React.ReactElement;
  getStatusColor: (status: string) => string;
  getAnotacaoColor: (pontos: number) => string;
  formatDate: (date: string) => string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex gap-4" key={item.id}>
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-8 h-8 rounded-full border-2 border-background flex items-center justify-center z-10",
          item.status === 'ATIVO' ? 'bg-green-100 text-green-600' :
            item.status === 'FECHADO' ? 'bg-blue-100 text-blue-600' :
              'bg-red-100 text-red-600'
        )}>
          {getStatusIcon(item.status)}
        </div>

        {index < historico.length - 1 && (
          <div className="flex-1 w-0.5 bg-border mt-2" />
        )}
      </div>

      <div className="flex-1 pb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg">{item.cargoNomeSnapshot}</CardTitle>

                <Badge
                  variant="outline"
                  className={cn("font-normal", getStatusColor(item.status))}
                >
                  {item.status}
                </Badge>

                {item.status === 'ATIVO' && (
                  <Badge variant="secondary" className="font-normal">
                    Atual
                  </Badge>
                )}
              </div>

              {isAdmin && item.status === 'ATIVO' && historico.length > 1 && onReverter && showReverter && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onReverter(item.id)}
                      className="h-8 gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Reverter
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reverter para cargo anterior</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            <CardDescription>
              {formatDate(item.dataInicio)}
              {item.dataFim && ` - ${formatDate(item.dataFim)}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Conceito:</span>{' '}
                  <Badge variant="outline" className="ml-2 gap-1">
                    <Star className="h-3 w-3" />
                    {item.conceitoAtual.toFixed(1)}
                  </Badge>
                </div>

                {item.motivo && (
                  <div className="text-sm">
                    <span className="font-medium">Motivo:</span>{' '}
                    <span className="text-muted-foreground">{item.motivo}</span>
                  </div>
                )}
              </div>
            </div>

            {item.anotacoes.length > 0 && (
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 p-0 text-sm font-normal"
                    >
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      )}
                      Anotações deste período ({item.anotacoes.length})
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <Separator className="my-3" />
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-3">
                      {item.anotacoes.map((anotacao) => (
                        <div key={anotacao.id} className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Badge
                              variant="outline"
                              className={cn("font-mono", getAnotacaoColor(anotacao.pontos))}
                            >
                              {anotacao.pontos > 0 ? '+' : ''}{anotacao.pontos}
                            </Badge>

                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {anotacao.tipo.titulo}
                              </p>

                              {anotacao.detalhes && (
                                <p className="text-sm text-muted-foreground">
                                  {anotacao.detalhes}
                                </p>
                              )}

                              <p className="text-xs text-muted-foreground mt-1">
                                Por: {anotacao.autor.nome}
                              </p>
                            </div>
                          </div>
                          <Separator />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function CargoTimeline({
  alunoId,
  isAdmin = false,
  onReverter,
  showReverter
}: CargoTimelineProps) {
  const { historico, isLoading } = useCargoHistory(alunoId) as {
    historico: HistoricoItem[];
    isLoading: boolean
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'FECHADO':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'REVERTIDO':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <History className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO': return 'bg-green-100 text-green-800 border-green-200';
      case 'FECHADO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REVERTIDO': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAnotacaoColor = (pontos: number) =>
    pontos >= 0
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  if (!historico || historico.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum histórico de cargos encontrado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative space-y-6">
      {historico.map((item, index) => (
        <CargoTimelineItem
          key={item.id}
          item={item}
          index={index}
          historico={historico}
          isAdmin={isAdmin}
          onReverter={onReverter}
          showReverter={showReverter}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
          getAnotacaoColor={getAnotacaoColor}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
}
