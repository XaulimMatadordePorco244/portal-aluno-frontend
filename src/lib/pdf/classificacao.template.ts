import { PDFBuilder } from './pdfUtils';
import autoTable from 'jspdf-autotable'; 

export interface ClassificacaoPdfItem {
  posicao: number;
  numero: string | null;
  nomeDeGuerra: string;
  cargo: string;
  conceitoAtual: number;
}

export async function buildClassificacaoTemplate(
  builder: PDFBuilder,
  dados: ClassificacaoPdfItem[],
  dataAtualizacao: string
) {
  const dadosAgrupados: Record<string, ClassificacaoPdfItem[]> = {};
  const cargosOrdem: string[] = []; 
  
  for (const item of dados) {
    if (!dadosAgrupados[item.cargo]) {
      dadosAgrupados[item.cargo] = [];
      cargosOrdem.push(item.cargo);
    }
    dadosAgrupados[item.cargo].push(item);
  }

  builder.addHeader();
  builder.addWatermark();
  builder.addTitle(`CLASSIFICAÇÃO GERAL - ${dataAtualizacao}`, 14, 2);
  
  const marginX = 15; 
  const gap = 8; 
  const colWidth = (builder.pageWidth - (marginX * 2) - gap) / 2; 
  const maxPageHeight = builder.pageHeight - 20; 
  
  const initialY = builder.currentY;
  let currentY = initialY;
  let currentCol = 1; 

  for (const cargo of cargosOrdem) {
    const alunos = dadosAgrupados[cargo];
    
    const estimatedHeight = 12 + (alunos.length * 6);

    if (currentY + estimatedHeight > maxPageHeight) {
      if (currentCol === 1) {
        currentCol = 2; 
        currentY = initialY; 
      } else {
        builder.doc.addPage(); 
        builder.addHeader();
        currentCol = 1;
        currentY = builder.currentY + 2; 
      }
    }

    const startX = currentCol === 1 ? marginX : marginX + colWidth + gap;

    const tableBody = alunos.map((aluno) => {
      const conceitoApresentacao = aluno.conceitoAtual <= 4.9 
        ? '-' 
        : aluno.conceitoAtual.toFixed(2).replace('.', ',');

      return [
        aluno.posicao.toString(),
        aluno.numero || '-',
        aluno.nomeDeGuerra.toUpperCase(),
        conceitoApresentacao
      ];
    });

    autoTable(builder.doc, {
      startY: currentY,
      tableWidth: colWidth, 
      margin: { left: startX }, 
      head: [
        [
          { 
            content: cargo.toUpperCase(), 
            colSpan: 4, 
            styles: { 
              halign: 'center', 
              fillColor: [40, 40, 40], 
              textColor: [255, 255, 255], 
              fontStyle: 'bold', 
              fontSize: 10 
            } 
          }
        ],
        ['Pos', 'Nº', 'Nome de Guerra', 'Conceito']
      ],
      body: tableBody,
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
        0: { cellWidth: 10 }, 
        1: { cellWidth: 12 }, 
        2: { halign: 'left' }, 
        3: { cellWidth: 18, fontStyle: 'bold' }, 
      }
    });
    
    const lastY = (builder.doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
    currentY = lastY ? lastY + 5 : currentY + estimatedHeight + 5; 
  }

  builder.addFooter();
}