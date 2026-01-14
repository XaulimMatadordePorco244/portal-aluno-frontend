"use client";

import { useState, useMemo } from 'react';
import autoTable from 'jspdf-autotable';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Award, ThumbsUp, ThumbsDown, Megaphone, Filter, FileDown } from 'lucide-react';
import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PDFBuilder } from '@/lib/pdfUtils';
import { UserWithRelations } from '@/lib/auth'; 
import { Prisma } from '@prisma/client';

type AnotacaoComRelacoes = Prisma.AnotacaoGetPayload<{
  include: {
    tipo: true;
    autor: {
      include: {
        perfilAluno: true
      }
    }
  }
}>;

type AnnotationFilterType = 'Todos' | 'Elogio' | 'Punição' | 'FO+' | 'FO-';

const InfoPill = ({ label, count, points }: { label: string; count: number; points: number }) => (
  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/50 border shadow-sm">
    <p className="text-xs sm:text-sm font-semibold text-muted-foreground">{label}: {count}</p>
    <p className={`text-base sm:text-lg font-bold ${points >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
      {points > 0 ? '+' : ''}{points.toFixed(1)}
    </p>
  </div>
);

interface EvaluationsClientProps {
  user: UserWithRelations;
  anotacoes: AnotacaoComRelacoes[];
  conceitoAtual: number;
}

export default function EvaluationsClient({ 
  user, 
  anotacoes, 
  conceitoAtual 
}: EvaluationsClientProps) {
  const [activeFilter, setActiveFilter] = useState<AnnotationFilterType>('Todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const perfil = user.perfilAluno;
  const conceitoAtualValor = conceitoAtual.toFixed(2);

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

  const summaryStats = useMemo(() => {
    const stats = {
      elogio: { count: 0, points: 0 },
      punicao: { count: 0, points: 0 },
      foPositivo: { count: 0, points: 0 },
      foNegativo: { count: 0, points: 0 },
    };

    for (const anotacao of filteredByDate) {
      const pontos = Number(anotacao.pontos);
      
      if (pontos > 0.5) {
        stats.elogio.count++;
        stats.elogio.points += pontos;
      }
      if (pontos < -0.3) {
        stats.punicao.count++;
        stats.punicao.points += pontos;
      }
      if (pontos === 0.5) {
        stats.foPositivo.count++;
        stats.foPositivo.points += pontos;
      }
      if (pontos === -0.3) {
        stats.foNegativo.count++;
        stats.foNegativo.points += pontos;
      }
    }
    return stats;
  }, [filteredByDate]);

  const filteredAnnotations = useMemo(() => {
    switch (activeFilter) {
      case 'Elogio': return filteredByDate.filter(a => Number(a.pontos) > 0.5);
      case 'Punição': return filteredByDate.filter(a => Number(a.pontos) < -0.3);
      case 'FO+': return filteredByDate.filter(a => Number(a.pontos) === 0.5);
      case 'FO-': return filteredByDate.filter(a => Number(a.pontos) === -0.3);
      default: return filteredByDate;
    }
  }, [filteredByDate, activeFilter]);

  const generateStatement = async () => { 
    const pdfBuilder = new PDFBuilder();
    await pdfBuilder.init(); 
    
    const { doc } = pdfBuilder;
    
    pdfBuilder.addHeader();
    pdfBuilder.addTitle("Extrato de Anotações");
    pdfBuilder.addSpacing(5);

    const nomeFormatado = `${perfil?.cargo?.abreviacao || ''} GM ${perfil?.nomeDeGuerra || user.nome}`;
  
    pdfBuilder
        .addKeyValueLine('Aluno:', nomeFormatado, { keySpace: 12 })
        .addKeyValueLine('Conceito Atual:', conceitoAtualValor, { keySpace: 28 }) 
        .addKeyValueLine('Data de Emissão:', new Date().toLocaleDateString('pt-BR'), { keySpace: 32 })
        .addKeyValueLine('Filtro Aplicado:', activeFilter, { keySpace: 27 })
        .addSpacing(5);

    autoTable(doc, {
      startY: pdfBuilder.currentY,
      head: [['Data', 'Anotação', 'Pontos', 'Detalhes']],
      body: filteredAnnotations.map(a => [
        format(new Date(a.data), "dd/MM/yyyy", { locale: ptBR }),
        a.tipo.titulo,
        (Number(a.pontos) > 0 ? '+' : '') + a.pontos,
        a.detalhes || ''
      ]),
      
      columnStyles: {
        0: { cellWidth: 25 },    
        1: { cellWidth: 40 },    
        2: { cellWidth: 20 },    
        3: { cellWidth: 'auto' }, 
      },

      theme: 'grid',
      headStyles: { fillColor: [4, 120, 87] } 
    });

    pdfBuilder.addWatermark();
    pdfBuilder.addFooter();

    doc.save(`extrato_${perfil?.nomeDeGuerra?.toLowerCase() || 'aluno'}.pdf`);
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Minhas Anotações</h1>
        <Button onClick={generateStatement} className="w-full sm:w-auto">
          <FileDown className="mr-2 h-4 w-4" /> Gerar Extrato
        </Button>
      </div>

      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto text-center sm:text-left">
          <Award size={48} className="text-yellow-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Conceito Atual</p> 
            <p className="text-4xl font-bold text-foreground">{conceitoAtualValor}</p>
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

      <div className="bg-card rounded-xl shadow-lg border">
        <div className="p-4 sm:p-6 border-b space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Filter size={20} /> Histórico
          </h2>
          
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={activeFilter === 'Todos' ? 'default' : 'outline'} onClick={() => setActiveFilter('Todos')}>Todos</Button>
            <Button size="sm" variant={activeFilter === 'Elogio' ? 'default' : 'outline'} className="text-green-600 border-green-600 hover:bg-green-100 dark:hover:bg-green-900/50" onClick={() => setActiveFilter('Elogio')}><ThumbsUp className="mr-2 h-3 w-3" /> Elogios</Button>
            <Button size="sm" variant={activeFilter === 'Punição' ? 'default' : 'outline'} className="text-red-600 border-red-600 hover:bg-red-100 dark:hover:bg-red-900/50" onClick={() => setActiveFilter('Punição')}><ThumbsDown className="mr-2 h-3 w-3" /> Punições</Button>
            <Button size="sm" variant={activeFilter === 'FO+' ? 'default' : 'outline'} className="text-blue-600 border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50" onClick={() => setActiveFilter('FO+')}><Megaphone className="mr-2 h-3 w-3" /> FO+</Button>
            <Button size="sm" variant={activeFilter === 'FO-' ? 'default' : 'outline'} className="text-orange-600 border-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/50" onClick={() => setActiveFilter('FO-')}><Megaphone className="mr-2 h-3 w-3" /> FO-</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <Label htmlFor="start-date" className="text-xs text-muted-foreground">De</Label>
              <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="end-date" className="text-xs text-muted-foreground">Até</Label>
              <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {filteredAnnotations.map(anotacao => {
            const autorPerfil = anotacao.autor.perfilAluno;
            const autorNome = autorPerfil?.nomeDeGuerra || anotacao.autor.nome;
            
            return (
              <AccordionItem value={`item-${anotacao.id}`} key={anotacao.id}>
                <AccordionTrigger className="px-4 sm:px-6 hover:bg-accent/50 text-left py-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2">
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="font-medium text-foreground text-sm sm:text-base">{anotacao.tipo.titulo}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 ${Number(anotacao.pontos) >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {Number(anotacao.pontos) > 0 ? '+' : ''}{anotacao.pontos}
                      </span>
                    </div>

                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(anotacao.data), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-4 sm:px-6 pb-4 bg-accent/30 border-t pt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Detalhes</p>
                    <p className="text-sm text-foreground leading-relaxed">{anotacao.detalhes}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <span>Lançado em: {format(new Date(anotacao.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    <span className="hidden sm:inline">|</span>
                    <span>Autor: {autorNome}</span>
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