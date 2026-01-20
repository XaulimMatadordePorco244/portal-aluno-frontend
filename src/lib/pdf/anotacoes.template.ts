import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PDFBuilder } from './pdfUtils'; 

export interface ExtratoPDFData {
  aluno: {
    nome: string;
    nomeDeGuerra?: string | null;
    cargo?: string | null;
  };
  conceitoAtual: string | number;
  filtroAplicado: string;
  anotacoes: {
    data: Date | string;
    tipo: string;
    pontos: number | string;
    detalhes?: string | null;
  }[];
}

export function renderAnotacoesPDF(
  pdf: PDFBuilder,
  dados: ExtratoPDFData
) {
  pdf.addHeader();
  pdf.addTitle("Extrato de Anotações");

  const nomeFormatado = `${dados.aluno.cargo || ''} GM ${dados.aluno.nomeDeGuerra || dados.aluno.nome}`.trim();
  const margemOriginal = 35
  const conceito = typeof dados.conceitoAtual === 'number' 
    ? dados.conceitoAtual.toFixed(2) 
    : dados.conceitoAtual;

    pdf.margin = 15;

  pdf.addKeyValueLine('Aluno:', nomeFormatado, { keySpace: 13, })
     .addKeyValueLine('Conceito Atual:', conceito, { keySpace: 29 })
     .addKeyValueLine('Data de Emissão:', format(new Date(), 'dd/MM/yyyy'), { keySpace: 33})
     .addKeyValueLine('Filtro Aplicado:', dados.filtroAplicado, { keySpace: 29})

     pdf.margin = margemOriginal;

  const tableBody = dados.anotacoes.map(a => [
    format(new Date(a.data), "dd/MM/yyyy", { locale: ptBR }),
    a.tipo,
    a.pontos,
    a.detalhes || ''
  ]);

  autoTable(pdf.doc, {
    startY: pdf.currentY,
    head: [['Data', 'Anotação', 'Pontos', 'Detalhes']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175] }
  });

  if (pdf.doc.lastAutoTable) {
    pdf.currentY = pdf.doc.lastAutoTable.finalY + 10;
  }

  pdf.addWatermark();
  pdf.addFooter();
}