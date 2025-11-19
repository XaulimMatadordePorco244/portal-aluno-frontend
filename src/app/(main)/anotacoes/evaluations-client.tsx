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
  <div className="text-center">
    <p className="text-sm font-semibold text-muted-foreground">{label}: {count}</p>
    <p className={`text-lg font-bold ${points >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
      {points > 0 ? '+' : ''}{points.toFixed(1)}
    </p>
  </div>
);

export default function EvaluationsClient({ user, anotacoes }: { user: UserWithRelations, anotacoes: AnotacaoComRelacoes[] }) {
  const [activeFilter, setActiveFilter] = useState<AnnotationFilterType>('Todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      const titulo = anotacao.tipo.titulo.toLowerCase();

      if (pontos > 0) {
        stats.elogio.count++;
        stats.elogio.points += pontos;
      }
      if (pontos < 0) {
        stats.punicao.count++;
        stats.punicao.points += pontos;
      }
      if (titulo.includes('fo+')) {
        stats.foPositivo.count++;
        stats.foPositivo.points += pontos;
      }
      if (titulo.includes('fo-')) {
        stats.foNegativo.count++;
        stats.foNegativo.points += pontos;
      }
    }
    return stats;
  }, [filteredByDate]);

  const filteredAnnotations = useMemo(() => {
    switch (activeFilter) {
      case 'Elogio': return filteredByDate.filter(a => Number(a.pontos) > 0);
      case 'Punição': return filteredByDate.filter(a => Number(a.pontos) < 0);
      case 'FO+': return filteredByDate.filter(a => a.tipo.titulo.toLowerCase().includes('fo+'));
      case 'FO-': return filteredByDate.filter(a => a.tipo.titulo.toLowerCase().includes('fo-'));
      default: return filteredByDate;
    }
  }, [filteredByDate, activeFilter]);

  const perfil = user.perfilAluno;
  const conceitoBase = parseFloat(perfil?.conceito || '0');
  const somaDosPontosFiltrados = filteredByDate.reduce((sum, item) => sum + Number(item.pontos), 0);
  const conceitoReal = (conceitoBase + somaDosPontosFiltrados).toFixed(2);

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
    <div className="container mx-auto py-10 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h1 className="text-3xl font-bold text-foreground">Minhas Anotações</h1>
        <Button onClick={generateStatement}>
          <FileDown className="mr-2 h-4 w-4" /> Gerar Extrato
        </Button>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-md border flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Award size={40} className="text-yellow-500 flex shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Conceito (período)</p>
            <p className="text-3xl font-bold text-foreground">{conceitoReal}</p>
          </div>
        </div>
        <div className="w-full md:w-auto grid grid-cols-2 lg:grid-cols-4 gap-4 border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-6">
          <InfoPill label="Elogios" count={summaryStats.elogio.count} points={summaryStats.elogio.points} />
          <InfoPill label="Punições" count={summaryStats.punicao.count} points={summaryStats.punicao.points} />
          <InfoPill label="FO+" count={summaryStats.foPositivo.count} points={summaryStats.foPositivo.points} />
          <InfoPill label="FO-" count={summaryStats.foNegativo.count} points={summaryStats.foNegativo.points} />
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-lg border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Filter size={20} /> Histórico de Anotações
          </h2>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant={activeFilter === 'Todos' ? 'default' : 'outline'} onClick={() => setActiveFilter('Todos')}>Todos</Button>
            <Button variant={activeFilter === 'Elogio' ? 'default' : 'outline'} className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700 dark:text-green-500 dark:border-green-500 dark:hover:bg-green-900/50 dark:hover:text-green-400" onClick={() => setActiveFilter('Elogio')}><ThumbsUp className="mr-2 h-4 w-4" /> Elogios</Button>
            <Button variant={activeFilter === 'Punição' ? 'default' : 'outline'} className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-500 dark:border-red-500 dark:hover:bg-red-900/50 dark:hover:text-red-400" onClick={() => setActiveFilter('Punição')}><ThumbsDown className="mr-2 h-4 w-4" /> Punições</Button>
            <Button variant={activeFilter === 'FO+' ? 'default' : 'outline'} className="text-blue-600 border-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-500 dark:border-blue-500 dark:hover:bg-blue-900/50 dark:hover:text-blue-400" onClick={() => setActiveFilter('FO+')}><Megaphone className="mr-2 h-4 w-4" /> FO+</Button>
            <Button variant={activeFilter === 'FO-' ? 'default' : 'outline'} className="text-orange-600 border-orange-600 hover:bg-orange-100 hover:text-orange-700 dark:text-orange-500 dark:border-orange-500 dark:hover:bg-orange-900/50 dark:hover:text-orange-400" onClick={() => setActiveFilter('FO-')}><Megaphone className="mr-2 h-4 w-4" /> FO-</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
                <AccordionTrigger className="px-6 hover:bg-accent text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2 sm:gap-4">
                    <div className='text-left'>
                      <span className="font-medium text-foreground">{anotacao.tipo.titulo}</span>
                      <span className={`ml-2 font-bold text-sm ${Number(anotacao.pontos) >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                        ({Number(anotacao.pontos) > 0 ? '+' : ''}{anotacao.pontos})
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground text-left sm:text-right">
                      Ocorrência: {format(new Date(anotacao.data), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 bg-accent/50 border-t pt-4 space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Detalhes da ocorrência:</p>
                    <p className="text-foreground">{anotacao.detalhes}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span>Lançado em: {format(new Date(anotacao.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    <span className="mx-1">|</span>
                    <span>Por: {autorNome}</span>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {filteredAnnotations.length === 0 && (
          <div className="text-center p-10 text-muted-foreground">
            Nenhuma anotação encontrada para este filtro.
          </div>
        )}
      </div>
    </div>
  );
}