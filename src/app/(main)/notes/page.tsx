"use client";

import { useState } from 'react';
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/Button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Award, ThumbsUp, ThumbsDown, Megaphone, Filter, FileDown } from 'lucide-react';

type AnnotationType = 'Todos' | 'Elogio' | 'Punição' | 'FO+' | 'FO-';

const allAnnotations = [
  { id: 1, type: 'Elogio', title: "Apresentação pessoal impecável", details: "Elogiado por estar com o uniforme e a apresentação pessoal em perfeitas condições durante a formatura matinal.", date: "05/09/2025", points: "+0.5" },
  { id: 2, type: 'FO-', title: "Esquecer material de carga", details: "Anotado por esquecer de trazer o gorro para a instrução de Ordem Unida.", date: "03/09/2025", points: "-0.2" },
  { id: 3, type: 'FO+', title: "Proatividade na organização", details: "Ajudou voluntariamente na organização dos materiais após a instrução, demonstrando proatividade.", date: "01/09/2025", points: "+0.3" },
  { id: 4, type: 'Punição', title: "Atraso para a formatura", details: "Recebeu punição disciplinar por chegar 10 minutos atrasado para a formatura matinal.", date: "28/08/2025", points: "-1.0" },
  { id: 5, type: 'Elogio', title: "Auxílio a colega", details: "Ajudou um colega que estava com dificuldades durante a instrução de primeiros socorros.", date: "25/08/2025", points: "+0.5" },
];

const InfoPill = ({ label, count, points }: { label: string; count: number; points: number }) => (
  <div className="text-center">
    <p className="text-sm font-semibold text-gray-600">{label}: {count}</p>
    <p className={`text-lg font-bold ${points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
      {points >= 0 ? '+' : ''}{points.toFixed(1)}
    </p>
  </div>
);

export default function EvaluationsPage() {
  const [activeFilter, setActiveFilter] = useState<AnnotationType>('Todos');

  const filteredAnnotations = activeFilter === 'Todos'
    ? allAnnotations
    : allAnnotations.filter(annotation => annotation.type === activeFilter);

  const conceitoAtual = "7.1";
  const nomeAluno = "Michael Santos";

  const calculateTotals = (type: AnnotationType) => {
    const items = allAnnotations.filter(a => a.type === type);
    const count = items.length;
    const points = items.reduce((sum, item) => sum + parseFloat(item.points), 0);
    return { count, points };
  };

  const totalElogios = calculateTotals('Elogio');
  const totalPunicoes = calculateTotals('Punição');
  const totalFOPositivas = calculateTotals('FO+');
  const totalFONegativas = calculateTotals('FO-');

  const generateStatement = () => {
    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(18);
    doc.text("Extrato de Anotações", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Aluno: ${nomeAluno}`, 15, 30);
    doc.text(`Data de Emissão: ${dataAtual}`, 15, 36);
    doc.text(`Filtro Aplicado: ${activeFilter}`, 15, 42);
    let y = 55;
    filteredAnnotations.forEach(annotation => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${annotation.date} - [${annotation.points}] - ${annotation.title}`, 15, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const detailsLines = doc.splitTextToSize(`Detalhes: ${annotation.details}`, 180);
      doc.text(detailsLines, 15, y + 6);
      y += detailsLines.length * 5 + 10;
    });
    doc.save(`extrato_anotacoes_${nomeAluno.replace(/\s/g, '_')}.pdf`);
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Minhas Anotações</h1>
        <Button onClick={generateStatement}>
          <FileDown className="mr-2 h-4 w-4" />
          Gerar Extrato
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <Award size={40} className="text-yellow-500" />
            <div>
                <p className="text-sm font-medium text-gray-500">Conceito Atual</p>
                <p className="text-3xl font-bold text-gray-800">{conceitoAtual}</p>
            </div>
        </div>
        <div className="flex gap-6 border-l pl-6">
            <InfoPill label="Elogios" count={totalElogios.count} points={totalElogios.points} />
            <InfoPill label="Punições" count={totalPunicoes.count} points={totalPunicoes.points} />
            <InfoPill label="FO+" count={totalFOPositivas.count} points={totalFOPositivas.points} />
            <InfoPill label="FO-" count={totalFONegativas.count} points={totalFONegativas.points} />
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
        </div>

        <Accordion type="single" collapsible className="w-full">
          {filteredAnnotations.map(annotation => (
            <AccordionItem value={`item-${annotation.id}`} key={annotation.id}>
              <AccordionTrigger className="px-6 hover:bg-gray-50 text-left">
                <div className="flex justify-between items-center w-full">
                    <div>
                        <span className="font-medium">{annotation.title}</span>
                        <span className={`ml-2 font-bold text-sm ${annotation.points.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            ({annotation.points})
                        </span>
                    </div>
                    <span className="text-sm text-gray-500 mr-4">{annotation.date}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 bg-gray-50 border-t pt-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Detalhes da anotação:</p>
                <p className="text-gray-700">{annotation.details}</p>
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