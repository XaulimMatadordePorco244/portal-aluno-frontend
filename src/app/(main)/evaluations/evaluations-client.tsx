"use client";

import { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
import { User } from '@prisma/client';
import { AnotacaoComRelacoes } from './page';
import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type AnnotationFilterType = 'Todos' | 'Elogio' | 'Punição' | 'FO+' | 'FO-';

const InfoPill = ({ label, count, points }: { label: string; count: number; points: number }) => (
    <div className="text-center">
      <p className="text-sm font-semibold text-gray-600">{label}: {count}</p>
      <p className={`text-lg font-bold ${points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {points > 0 ? '+' : ''}{points.toFixed(1)}
      </p>
    </div>
);

export default function EvaluationsClient({ user, anotacoes }: { user: User, anotacoes: AnotacaoComRelacoes[] }) {
  const [activeFilter, setActiveFilter] = useState<AnnotationFilterType>('Todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const conceitoBase = parseFloat(user.conceito || '0');
  const somaDosPontos = useMemo(() => anotacoes.reduce((sum, item) => sum + Number(item.pontos), 0), [anotacoes]);
  const conceitoReal = (conceitoBase + somaDosPontos).toFixed(2);

  const filterAndCalculate = (filterType: AnnotationFilterType, source: AnotacaoComRelacoes[]) => {
    const filter = filterType.toLowerCase();
    
    if (filter === 'todos') {
      const points = source.reduce((sum, item) => sum + Number(item.pontos), 0);
      return { items: source, count: source.length, points };
    }

    const filtered = source.filter(a => {
      const titulo = a.tipo.titulo.toLowerCase();
      const pontos = Number(a.pontos);

      switch(filter) {
        case 'elogio': return pontos > 0;
        case 'punição': return pontos < 0;
        case 'fo+': return titulo.includes('fo+');
        case 'fo-': return titulo.includes('fo-');
        default: return false;
      }
    });

    const count = filtered.length;
    const points = filtered.reduce((sum, item) => sum + Number(item.pontos), 0);
    return { items: filtered, count, points };
  }

  const filteredByDate = useMemo(() => {
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

  const { items: filteredAnnotations } = filterAndCalculate(activeFilter, filteredByDate);
  
  const { count: totalElogiosCount, points: totalElogiosPoints } = filterAndCalculate('Elogio', anotacoes);
  const { count: totalPunicoesCount, points: totalPunicoesPoints } = filterAndCalculate('Punição', anotacoes);
  const { count: totalFOPositivasCount, points: totalFOPositivasPoints } = filterAndCalculate('FO+', anotacoes);
  const { count: totalFONegativasCount, points: totalFONegativasPoints } = filterAndCalculate('FO-', anotacoes);

  const generateStatement = () => {
    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(18);
    doc.text("Extrato de Anotações", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Aluno: ${user.nome}`, 15, 30);
    doc.text(`Data de Emissão: ${dataAtual}`, 15, 36);
    doc.text(`Filtro Aplicado: ${activeFilter}`, 15, 42);

    (doc as any).autoTable({
      startY: 50,
      head: [['Ocorrência', 'Lançamento', 'Tipo', 'Pontos', 'Detalhes']],
      body: filteredAnnotations.map(a => [
        format(new Date(a.data), "dd/MM/yyyy", { locale: ptBR }),
        format(new Date(a.createdAt), "dd/MM/yyyy", { locale: ptBR }),
        a.tipo.titulo,
        (Number(a.pontos) > 0 ? '+' : '') + a.pontos,
        a.detalhes || ''
      ]),
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] }
    });

    doc.save(`extrato_anotacoes_${user.nome.replace(/\s/g, '_')}.pdf`);
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Minhas Anotações</h1>
        <Button onClick={generateStatement}>
          <FileDown className="mr-2 h-4 w-4" /> Gerar Extrato
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <Award size={40} className="text-yellow-500" />
            <div>
                <p className="text-sm font-medium text-gray-500">Conceito Atual</p>
                <p className="text-3xl font-bold text-gray-800">{conceitoReal}</p>
            </div>
        </div>
        <div className="flex gap-6 border-l pl-6">
            <InfoPill label="Elogios" count={totalElogiosCount} points={totalElogiosPoints} />
            <InfoPill label="Punições" count={totalPunicoesCount} points={totalPunicoesPoints} />
            <InfoPill label="FO+" count={totalFOPositivasCount} points={totalFOPositivasPoints} />
            <InfoPill label="FO-" count={totalFONegativasCount} points={totalFONegativasPoints} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Filter size={20} /> Histórico de Anotações
          </h2>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant={activeFilter === 'Todos' ? 'default' : 'outline'} onClick={() => setActiveFilter('Todos')}>Todos</Button>
            <Button variant={activeFilter === 'Elogio' ? 'default' : 'outline'} className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => setActiveFilter('Elogio')}><ThumbsUp className="mr-2 h-4 w-4"/> Elogios</Button>
            <Button variant={activeFilter === 'Punição' ? 'default' : 'outline'} className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700" onClick={() => setActiveFilter('Punição')}><ThumbsDown className="mr-2 h-4 w-4"/> Punições</Button>
            <Button variant={activeFilter === 'FO+' ? 'default' : 'outline'} className="text-blue-600 border-blue-600 hover:bg-blue-100 hover:text-blue-700" onClick={() => setActiveFilter('FO+')}><Megaphone className="mr-2 h-4 w-4"/> FO+</Button>
            <Button variant={activeFilter === 'FO-' ? 'default' : 'outline'} className="text-orange-600 border-orange-600 hover:bg-orange-100 hover:text-orange-700" onClick={() => setActiveFilter('FO-')}><Megaphone className="mr-2 h-4 w-4"/> FO-</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="start-date" className="text-xs text-gray-600">De</Label>
              <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="end-date" className="text-xs text-gray-600">Até</Label>
              <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {filteredAnnotations.map(anotacao => (
            <AccordionItem value={`item-${anotacao.id}`} key={anotacao.id}>
              <AccordionTrigger className="px-6 hover:bg-gray-50 text-left">
                <div className="flex justify-between items-center w-full">
                    <div>
                        <span className="font-medium">{anotacao.tipo.titulo}</span>
                        <span className={`ml-2 font-bold text-sm ${Number(anotacao.pontos) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({Number(anotacao.pontos) > 0 ? '+' : ''}{anotacao.pontos})
                        </span>
                    </div>
                    <span className="text-sm text-gray-500 mr-4">
                      Ocorrência: {format(new Date(anotacao.data), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 bg-gray-50 border-t pt-4 space-y-2">
                 <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Detalhes da ocorrência:</p>
                  <p className="text-gray-700">{anotacao.detalhes}</p>
                </div>
                <div className="text-xs text-gray-400">
                  <span>Lançado em: {format(new Date(anotacao.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                  <span className="mx-1">|</span>
                  <span>Por: {anotacao.autor.nomeDeGuerra || anotacao.autor.nome}</span>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {filteredAnnotations.length === 0 && (
          <div className="text-center p-10 text-gray-500">
            Nenhuma anotação encontrada para este filtro.
          </div>
        )}
      </div>
    </div>
  );
}