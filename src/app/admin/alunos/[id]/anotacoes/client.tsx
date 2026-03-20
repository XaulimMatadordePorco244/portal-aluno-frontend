"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Award, Filter, Pencil, Trash2, ArrowLeft, FileDown, 
  UserCheck, Keyboard, Clock, Calendar, Megaphone, ThumbsUp, ThumbsDown, AlertOctagon, Info
} from 'lucide-react';
import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { deleteAnotacao } from '@/actions/anotacoes';
import { deleteSuspensao } from '@/actions/suspensao'; // <--- IMPORT DA AÇÃO DE SUSPENSÃO
import { toast } from "sonner";
import { anotacoesPdfService } from '@/services/pdf/anotacoes-pdf.service';
import { Prisma } from '@prisma/client';
import { formatDate, cn } from '@/lib/utils'; 

type AnotacaoComRelacoes = Prisma.AnotacaoGetPayload<{
  include: {
    tipo: true;
    autor: { include: { perfilAluno: { include: { cargo: true } } } };
    quemAnotou: { include: { perfilAluno: { include: { cargo: true } } } };
  }
}>;

type SuspensaoComRelacoes = Prisma.SuspensaoGetPayload<{
  include: {
    tipo: true;
    quemLancou: { include: { perfilAluno: { include: { cargo: true } } } };
    quemAplicou: { include: { perfilAluno: { include: { cargo: true } } } };
  }
}>;

type AnnotationFilterType = 'Todos' | 'Elogio' | 'Punição' | 'FO+' | 'FO-' | 'Suspensão';

const InfoPill = ({ label, count, points }: { label: string; count: number; points: number }) => (
  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/50 border shadow-sm">
    <p className="text-xs sm:text-sm font-semibold text-muted-foreground whitespace-nowrap">
      {label}: {count}
    </p>
    <p className={`text-base sm:text-lg font-bold ${points >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
      {points > 0 ? '+' : ''}{points.toFixed(1)}
    </p>
  </div>
);

export default function AdminStudentHistoryClient({ 
  student, 
  conceitoAtual,
  anotacoes,
  suspensoes
}: { 
  student: any;
  conceitoAtual: number;
  anotacoes: AnotacaoComRelacoes[];
  suspensoes: SuspensaoComRelacoes[];
}) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<AnnotationFilterType>('Todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const conceitoAtualValor = conceitoAtual.toFixed(2);
  const cargo = student.cargo?.abreviacao || '';
  const nomeDeGuerra = student.usuario.nomeDeGuerra || student.usuario.nome;
  const identificacaoAluno = `${cargo} GM ${nomeDeGuerra}`.trim();

  const formatarNome = (usuario: any | null | undefined) => {
    if (!usuario) return "Sistema";
    const perfil = usuario.perfilAluno;
    if (perfil) {
        const cargoStr = perfil.cargo?.abreviacao || '';
        const nomeStr = perfil.nomeDeGuerra || usuario.nome.split(' ')[0];
        return `${cargoStr} GM ${nomeStr}`.trim();
    }
    return usuario.nome;
  };

  const unifiedItems = useMemo(() => {
    const items = [];

    for (const a of anotacoes) {
      items.push({
        id: a.id,
        type: 'anotacao' as const,
        titulo: a.tipo?.titulo || 'Anotação',
        pontos: Number(a.pontos),
        data: a.data,
        createdAt: a.createdAt,
        detalhes: a.detalhes,
        autorNome: formatarNome(a.autor),
        responsavelNome: a.quemAnotouNome ? a.quemAnotouNome.toUpperCase() : formatarNome(a.quemAnotou),
      });
    }

    for (const s of suspensoes) {
      items.push({
        id: s.id,
        type: 'suspensao' as const,
        titulo: `${s.tipo?.titulo || 'Suspensão Disciplinar'} (${s.dias} dias)`,
        pontos: Number(s.pontosRetirados),
        data: s.dataOcorrencia,
        createdAt: s.createdAt,
        detalhes: s.detalhes,
        autorNome: formatarNome(s.quemLancou),
        responsavelNome: s.quemAplicouNome ? s.quemAplicouNome.toUpperCase() : formatarNome(s.quemAplicou),
      });
    }

    return items.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [anotacoes, suspensoes]);

  const filteredByDate = useMemo(() => {
    if (!startDate && !endDate) return unifiedItems;

    let items = [...unifiedItems];

    if (startDate) {
      const start = startOfDay(parseISO(startDate));
      items = items.filter(a => new Date(a.data) >= start);
    }

    if (endDate) {
      const end = startOfDay(parseISO(endDate));
      items = items.filter(a => new Date(a.data) <= end);
    }

    return items;
  }, [unifiedItems, startDate, endDate]);

  const summaryStats = useMemo(() => {
    const stats = {
      elogio: { count: 0, points: 0 },
      punicao: { count: 0, points: 0 },
      foPositivo: { count: 0, points: 0 },
      foNegativo: { count: 0, points: 0 },
      suspensao: { count: 0, points: 0 }
    };

    for (const item of filteredByDate) {
      const pontos = item.pontos;
      if (item.type === 'suspensao') {
        stats.suspensao.count++;
        stats.suspensao.points += pontos;
      } else {
        if (pontos > 0.5) { stats.elogio.count++; stats.elogio.points += pontos; }
        else if (pontos < -0.3) { stats.punicao.count++; stats.punicao.points += pontos; }
        else if (pontos === 0.5) { stats.foPositivo.count++; stats.foPositivo.points += pontos; }
        else if (pontos === -0.3) { stats.foNegativo.count++; stats.foNegativo.points += pontos; }
      }
    }
    return stats;
  }, [filteredByDate]);

  const filteredItems = useMemo(() => {
    switch (activeFilter) {
      case 'Elogio': return filteredByDate.filter(a => a.type === 'anotacao' && a.pontos > 0.5);
      case 'Punição': return filteredByDate.filter(a => a.type === 'anotacao' && a.pontos < -0.3);
      case 'FO+': return filteredByDate.filter(a => a.type === 'anotacao' && a.pontos === 0.5);
      case 'FO-': return filteredByDate.filter(a => a.type === 'anotacao' && a.pontos === -0.3);
      case 'Suspensão': return filteredByDate.filter(a => a.type === 'suspensao');
      default: return filteredByDate;
    }
  }, [filteredByDate, activeFilter]);

  const handleDelete = async (id: string, type: 'anotacao' | 'suspensao') => {
    if (!window.confirm(`Tem certeza que deseja apagar permanentemente este registo de ${type}?`)) return;

    setIsLoading(true);
    try {
      const result = type === 'anotacao' ? await deleteAnotacao(id) : await deleteSuspensao(id);
      
      if (result.success) {
        toast.success(`${type === 'anotacao' ? 'Anotação' : 'Suspensão'} apagada com sucesso!`);
      } else {
        toast.error(result.message || "Erro ao apagar");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao processar a exclusão.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: string, type: 'anotacao' | 'suspensao') => {
    if (type === 'anotacao') {
        router.push(`/admin/anotacoes/lancamento?id=${id}`);
    } else {
        router.push(`/admin/suspensao/${id}/edit`);
    }
  };

  const generateStatement = async () => {
    let descricaoFiltro = activeFilter;
    if (startDate || endDate) {
      const i = startDate ? format(parseISO(startDate), 'dd/MM/yy') : '...';
      const f = endDate ? format(parseISO(endDate), 'dd/MM/yy') : '...';
      descricaoFiltro += ` (${i} até ${f})`;
    }

    await anotacoesPdfService.generate({
      aluno: {
        nome: student.usuario.nome,
        nomeDeGuerra: student.usuario.nomeDeGuerra,
        cargo: student.cargo?.abreviacao,
      },
      conceitoAtual: conceitoAtualValor,
      filtroAplicado: descricaoFiltro,
      anotacoes: filteredItems.map(a => ({
        data: formatDate(a.data) || '',
        tipo: a.titulo,
        pontos: a.pontos,
        detalhes: a.detalhes,
      })),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Histórico Disciplinar</h1>
            <p className="text-muted-foreground">{identificacaoAluno}</p>
          </div>
        </div>
        <Button onClick={generateStatement} className="w-full sm:w-auto" variant="outline">
          <FileDown className="mr-2 h-4 w-4" /> Gerar Extrato
        </Button>
      </div>

      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto text-center sm:text-left shrink-0">
          <Award size={48} className="text-yellow-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Conceito Atual</p>
            <p className="text-4xl font-bold text-foreground">{conceitoAtualValor}</p>
          </div>
        </div>

        <div className="w-full md:border-l pt-6 md:pt-0 md:pl-6 overflow-x-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 min-w-[500px]">
            <InfoPill label="Elogios" count={summaryStats.elogio.count} points={summaryStats.elogio.points} />
            <InfoPill label="FO+" count={summaryStats.foPositivo.count} points={summaryStats.foPositivo.points} />
            <InfoPill label="FO-" count={summaryStats.foNegativo.count} points={summaryStats.foNegativo.points} />
            <InfoPill label="Punições" count={summaryStats.punicao.count} points={summaryStats.punicao.points} />
            <InfoPill label="Suspensão" count={summaryStats.suspensao.count} points={summaryStats.suspensao.points} />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-lg border overflow-hidden">
        <div className="p-4 sm:p-6 border-b space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Filter size={20} /> Filtros
          </h2>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={activeFilter === 'Todos' ? 'default' : 'outline'} onClick={() => setActiveFilter('Todos')}>Todos</Button>
            <Button size="sm" variant={activeFilter === 'Elogio' ? 'default' : 'outline'} className="text-green-600 border-green-600 hover:bg-green-100 dark:hover:bg-green-900/50" onClick={() => setActiveFilter('Elogio')}><ThumbsUp className="mr-2 h-3 w-3" /> Elogios</Button>
            <Button size="sm" variant={activeFilter === 'Punição' ? 'default' : 'outline'} className="text-red-600 border-red-600 hover:bg-red-100 dark:hover:bg-red-900/50" onClick={() => setActiveFilter('Punição')}><ThumbsDown className="mr-2 h-3 w-3" /> Punições</Button>
            <Button size="sm" variant={activeFilter === 'FO+' ? 'default' : 'outline'} className="text-blue-600 border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50" onClick={() => setActiveFilter('FO+')}><Megaphone className="mr-2 h-3 w-3" /> FO+</Button>
            <Button size="sm" variant={activeFilter === 'FO-' ? 'default' : 'outline'} className="text-orange-600 border-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/50" onClick={() => setActiveFilter('FO-')}><Megaphone className="mr-2 h-3 w-3" /> FO-</Button>
            <Button size="sm" variant={activeFilter === 'Suspensão' ? 'default' : 'outline'} className="text-destructive border-destructive hover:bg-destructive/10 font-bold" onClick={() => setActiveFilter('Suspensão')}><AlertOctagon className="mr-2 h-3 w-3" /> Suspensões</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div><Label className="text-xs text-muted-foreground">De</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
            <div><Label className="text-xs text-muted-foreground">Até</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {filteredItems.map(item => {
            const isSuspensao = item.type === 'suspensao';
            const isPositive = item.pontos > 0;
            const isNegative = item.pontos < 0 && !isSuspensao;

            return (
              <AccordionItem 
                value={item.id} 
                key={item.id}
                className={cn(
                  "border-b last:border-0",
                )}
              >
                <AccordionTrigger className={cn(
                  "px-4 sm:px-6 hover:bg-accent/50 text-left py-4",
                )}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      
     
                      
                      <span className={cn(
                        "font-semibold text-sm sm:text-base", 
                      )}>
                        {item.titulo}
                      </span>
                      
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-bold shrink-0 ml-2",
                        isSuspensao ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                        : isPositive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                        : isNegative ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      )}>
                        {item.pontos > 0 ? '+' : ''}{item.pontos.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex flex-col sm:items-end text-xs text-muted-foreground gap-0.5 whitespace-nowrap">
                         <span className="flex items-center gap-1 font-medium">
                             <Calendar className="h-3.5 w-3.5" /> {formatDate(item.data)}
                         </span>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className={cn(
                  "px-4 sm:px-6 pb-4 border-t pt-4 space-y-4",
                )}>
                  
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      Detalhes do Fato
                    </p>
                    <p className={cn(
                      "text-sm leading-relaxed",
                    )}>
                      {item.detalhes}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Keyboard className="h-3.5 w-3.5 opacity-70" />
                            <span>Lançado por: <strong className="text-foreground/80">{item.autorNome}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <UserCheck className="h-3.5 w-3.5 opacity-70" />
                            <span>Anotado/Aplicado por: <strong className="text-foreground/80">{item.responsavelNome}</strong></span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:items-end">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 opacity-70" />
                            <span>Ocorrido em: {formatDate(item.data)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 opacity-70" />
                            <span>Registrado em: {format(new Date(item.createdAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}</span>
                        </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 justify-end border-t border-border/40 mt-4">
                      <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 gap-2 text-xs"
                          onClick={() => handleEdit(item.id, item.type)}
                          disabled={isLoading}
                      >
                          <Pencil className="h-3 w-3" /> Editar
                      </Button>
                      <Button 
                          variant="destructive" 
                          size="sm" 
                          className="h-8 gap-2 text-xs"
                          onClick={() => handleDelete(item.id, item.type)}
                          disabled={isLoading}
                      >
                          <Trash2 className="h-3 w-3" /> Excluir
                      </Button>
                  </div>

                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 px-4 text-muted-foreground flex flex-col items-center gap-2">
            <Filter className="h-8 w-8 opacity-20" />
            <p>Nenhum registo encontrado para este período/filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
}