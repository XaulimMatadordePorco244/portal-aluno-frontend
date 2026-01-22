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
  Award, Filter, PlusCircle, Pencil, Trash2, ArrowLeft, FileDown 
} from 'lucide-react';
import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { deleteAnotacao } from '@/actions/anotacoes'; // Importe da nova estrutura actions/admin/anotacoes
import { toast } from "sonner";
import { anotacoesPdfService } from '@/services/pdf/anotacoes-pdf.service'; // Certifique-se que o path está correto

// Tipos
type AnnotationFilterType = 'Todos' | 'Elogio' | 'Punição' | 'FO+' | 'FO-';

// Componente InfoPill (Idêntico ao do Aluno)
const InfoPill = ({ label, count, points }: { label: string; count: number; points: number }) => (
  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/50 border shadow-sm">
    <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
      {label}: {count}
    </p>
    <p
      className={`text-base sm:text-lg font-bold ${
        points >= 0
          ? 'text-emerald-600 dark:text-emerald-500'
          : 'text-red-600 dark:text-red-500'
      }`}
    >
      {points > 0 ? '+' : ''}
      {points.toFixed(1)}
    </p>
  </div>
);

interface AdminStudentHistoryProps {
  perfilAluno: any; 
  anotacoes: any[];
  conceitoAtual: number;
}

export default function AdminStudentHistoryClient({
  perfilAluno,
  anotacoes,
  conceitoAtual,
}: AdminStudentHistoryProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<AnnotationFilterType>('Todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const conceitoAtualValor = conceitoAtual.toFixed(2);
  const nomeCompleto = perfilAluno.usuario.nome;
  const nomeGuerra = perfilAluno.nomeDeGuerra;

  // --- Lógica de Filtros ---
  const filteredByDate = useMemo(() => {
    if (!startDate && !endDate) return anotacoes;
    let items = [...anotacoes];
    if (startDate) {
      const start = startOfDay(parseISO(startDate));
      items = items.filter(a => new Date(a.data) >= start);
    }
    if (endDate) {
      const end = startOfDay(parseISO(endDate));
      items = items.filter(a => new Date(a.data) <= end);
    }
    return items;
  }, [anotacoes, startDate, endDate]);

  const filteredAnnotations = useMemo(() => {
    switch (activeFilter) {
      case 'Elogio': return filteredByDate.filter(a => Number(a.pontos) > 0.5);
      case 'Punição': return filteredByDate.filter(a => Number(a.pontos) < -0.3);
      case 'FO+': return filteredByDate.filter(a => Number(a.pontos) === 0.5);
      case 'FO-': return filteredByDate.filter(a => Number(a.pontos) === -0.3);
      default: return filteredByDate;
    }
  }, [filteredByDate, activeFilter]);

  const summaryStats = useMemo(() => {
    const stats = {
      elogio: { count: 0, points: 0 },
      punicao: { count: 0, points: 0 },
      foPositivo: { count: 0, points: 0 },
      foNegativo: { count: 0, points: 0 },
    };
    for (const anotacao of filteredByDate) {
      const pontos = Number(anotacao.pontos);
      if (pontos > 0.5) { stats.elogio.count++; stats.elogio.points += pontos; }
      if (pontos < -0.3) { stats.punicao.count++; stats.punicao.points += pontos; }
      if (pontos === 0.5) { stats.foPositivo.count++; stats.foPositivo.points += pontos; }
      if (pontos === -0.3) { stats.foNegativo.count++; stats.foNegativo.points += pontos; }
    }
    return stats;
  }, [filteredByDate]);

  // --- Ações do Admin ---

  const handleCreateNew = () => {
    // Redireciona para /new com o ID do aluno pré-selecionado
    router.push(`/admin/anotacoes/new?alunoId=${perfilAluno.id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/anotacoes/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta anotação permanentemente?")) return;
    
    setIsLoading(true);
    const result = await deleteAnotacao(id, perfilAluno.id);
    setIsLoading(false);

    if (result.success) {
      toast.success("Anotação excluída com sucesso");
    } else {
      toast.error("Erro ao excluir anotação");
    }
  };

 const handleGeneratePDF = async () => {
    try {
      await anotacoesPdfService.generate({
        aluno: {
          nome: nomeCompleto,
          nomeDeGuerra: nomeGuerra,
          cargo: perfilAluno.cargo?.nome || "Aluno" 
        },
        conceitoAtual: conceitoAtualValor,
        filtroAplicado: activeFilter, 
        anotacoes: filteredAnnotations.map(a => ({
          data: new Date(a.data),
          tipo: a.tipo.titulo, 
          pontos: Number(a.pontos),
          detalhes: a.detalhes
        }))
      });
      toast.success("Extrato gerado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar PDF.");
    }
  };

  const getFilterButtonStyle = (filterType: AnnotationFilterType) => {
    const baseStyle = "border transition-all";
    if (activeFilter !== filterType) return `text-muted-foreground hover:text-foreground ${baseStyle}`;

    switch (filterType) {
        case 'Elogio': return `bg-emerald-100 text-emerald-700 border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400 ${baseStyle}`;
        case 'Punição': return `bg-red-100 text-red-700 border-red-500 dark:bg-red-900/30 dark:text-red-400 ${baseStyle}`;
        case 'FO+': return `bg-blue-100 text-blue-700 border-blue-500 dark:bg-blue-900/30 dark:text-blue-400 ${baseStyle}`;
        case 'FO-': return `bg-orange-100 text-orange-700 border-orange-500 dark:bg-orange-900/30 dark:text-orange-400 ${baseStyle}`;
        default: return `bg-primary text-primary-foreground border-primary ${baseStyle}`;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6">
      
      {/* Header Admin */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                {nomeGuerra}
                </h1>
                <p className="text-sm text-muted-foreground capitalize">{nomeCompleto.toLowerCase()}</p>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          {/* Botão Extrato */}
          <Button variant="outline" onClick={handleGeneratePDF} className="gap-2">
            <FileDown className="h-4 w-4" />
            Gerar Extrato
          </Button>
          
          {/* Botão Nova Anotação */}
          <Button onClick={handleCreateNew} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="h-4 w-4" />
            Lançar Nova Anotação
          </Button>
        </div>
      </div>

      {/* Card de Resumo (Idêntico ao do Aluno) */}
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto text-center sm:text-left">
          <Award size={48} className="text-yellow-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Conceito Atual
            </p>
            <p className="text-4xl font-bold text-foreground">
              {conceitoAtualValor}
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <InfoPill label="Elogios" count={summaryStats.elogio.count} points={summaryStats.elogio.points} />
            <InfoPill label="Punições" count={summaryStats.punicao.count} points={summaryStats.punicao.points} />
            <InfoPill label="FO+" count={summaryStats.foPositivo.count} points={summaryStats.foPositivo.points} />
            <InfoPill label="FO-" count={summaryStats.foNegativo.count} points={summaryStats.foNegativo.points} />
          </div>
        </div>
      </div>

      {/* Lista de Anotações */}
      <div className="bg-card rounded-xl shadow-lg border">
        
        {/* Filtros */}
        <div className="p-4 sm:p-6 border-b space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Filter size={20} /> Histórico Detalhado
          </h2>
          <div className="flex flex-wrap gap-2">
            {['Todos', 'Elogio', 'Punição', 'FO+', 'FO-'].map((f) => (
                <Button
                    key={f}
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveFilter(f as AnnotationFilterType)}
                    className={getFilterButtonStyle(f as AnnotationFilterType)}
                >
                    {f}
                </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <Label className="text-xs text-muted-foreground">De</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Até</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Accordion com Visual Idêntico ao do Aluno + Botões Admin */}
        <Accordion type="single" collapsible className="w-full">
          {filteredAnnotations.map(anotacao => {
            const autorNome = anotacao.autor.perfilAluno?.nomeDeGuerra || anotacao.autor.nome;
            const pts = Number(anotacao.pontos);

            return (
              <AccordionItem value={`item-${anotacao.id}`} key={anotacao.id}>
                {/* TRIGGER IDÊNTICO AO ALUNO */}
                <AccordionTrigger className="px-4 sm:px-6 hover:bg-accent/50 text-left py-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2 pr-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="font-medium text-foreground text-sm sm:text-base">
                        {anotacao.tipo.titulo}
                      </span>
                      {/* Badge de Pontos */}
                      <span className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 ${
                          pts >= 0 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {pts > 0 ? '+' : ''}{pts}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(anotacao.data), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                </AccordionTrigger>

                {/* CONTENT COM AÇÕES ADMIN NO FOOTER */}
                <AccordionContent className="px-4 sm:px-6 pb-4 bg-accent/30 border-t pt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Detalhes
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {anotacao.detalhes}
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-end md:items-center pt-2 border-t border-border/50 gap-4 mt-2">
                    {/* Info de Log (Igual Aluno) */}
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs text-muted-foreground">
                        <span>
                            Lançado em: {format(new Date(anotacao.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        <span className="hidden sm:inline">|</span>
                        <span>Autor: {autorNome}</span>
                    </div>

                    {/* BOTOES ADMIN (EXCLUSIVOS DESTA TELA) */}
                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-2 w-full md:w-auto text-xs"
                            onClick={() => handleEdit(anotacao.id)}
                            disabled={isLoading}
                        >
                            <Pencil className="h-3 w-3" /> Editar
                        </Button>
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            className="h-8 gap-2 w-full md:w-auto text-xs"
                            onClick={() => handleDelete(anotacao.id)}
                            disabled={isLoading}
                        >
                            <Trash2 className="h-3 w-3" /> Excluir
                        </Button>
                    </div>

                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {filteredAnnotations.length === 0 && (
          <div className="text-center py-12 px-4 text-muted-foreground flex flex-col items-center gap-2">
            <Filter className="h-8 w-8 opacity-20" />
            <p>Nenhuma anotação encontrada para este período/filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
}