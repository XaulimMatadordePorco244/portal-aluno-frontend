import { PDFBuilder } from '@/lib/pdf/pdfUtils';
import autoTable from 'jspdf-autotable'; 

const exibirDataBR = (date: string | Date | null | undefined) => {
  if (!date) return '-';
  try {
    if (typeof date === 'string' && date.length === 10 && date.includes('-')) {
      const [ano, mes, dia] = date.split('-');
      return `${dia}/${mes}/${ano}`;
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch {
    return '-';
  }
};

export interface AntiguidadeReportData {
  efetivo: any[]; 
}

export const gerarRelatorioAntiguidade = async (data: AntiguidadeReportData) => {
  const builder = new PDFBuilder();
  await builder.init();
  const doc = builder.doc;

  builder.addHeader();
  builder.addWatermark();
  
  builder.addTitle('ANTIGUIDADE', 14, 2);

  if (!data.efetivo || data.efetivo.length === 0) {
    doc.setFontSize(12);
    doc.text("Nenhum dado encontrado.", 14, builder.currentY || 45);
    doc.save('Extrato_Antiguidade.pdf');
    return;
  }

  const tableData = data.efetivo.map((aluno, index) => {
    const ingresso = aluno.anoIngresso || (aluno.dataMatricula ? new Date(aluno.dataMatricula).getFullYear() : '-');
    const nomeGuerraCorreto = aluno.usuario?.nomeDeGuerra || aluno.nomeDeGuerra || aluno.usuario?.nome || '-';

    return [
      String(`${index + 1}º`),
      String(ingresso),
      String(exibirDataBR(aluno.dataUltimaPromocao)),
      String(aluno.cargo?.nome || '-').toUpperCase(),
      String(nomeGuerraCorreto).toUpperCase(),
      String(aluno.modalidadeUltimaPromocao || '-').toUpperCase()
    ];
  });

  let startY = builder.currentY;
  if (startY < 45) startY = 45;

  autoTable(doc, {
    startY: startY,
    margin: { top: 45, left: 15, right: 15 }, 
    head: [['Class.', 'Ingresso', 'Promovido Em', 'Posto/Grad.', 'Nome de Guerra', 'Modalidade']],
    body: tableData,
    theme: 'grid',
    
    styles: { 
      fontSize: 8, 
      cellPadding: 1.5,
      halign: 'center',
      valign: 'middle',
      lineColor: [0, 0, 0],
      lineWidth: 0.3 
    },
    headStyles: { 
      fillColor: [220, 220, 220], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold',
      lineColor: [0, 0, 0],
      lineWidth: 0.3 
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      fontStyle: 'bold' 
    },
    columnStyles: {
      0: { cellWidth: 12 }, 
      1: { cellWidth: 16 }, 
      2: { cellWidth: 24 }, 
      3: { cellWidth: 35 }, 
      4: { halign: 'left' }, 
      5: { cellWidth: 30 }, 
    },

    didDrawPage: (dataHook) => {
      if (dataHook.pageNumber > 1) {
        builder.addHeader();
      }
      builder.addWatermark();
      builder.addFooter();
    },
  });

  doc.save('Extrato_Antiguidade.pdf');
};