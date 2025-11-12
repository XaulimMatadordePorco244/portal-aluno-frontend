import jsPDF from 'jspdf'
import autoTable, { UserOptions, CellHookData, RowInput } from 'jspdf-autotable'
import { EscalaCompleta } from '@/app/admin/escalas/[id]/page'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PDFBuilder } from '@/lib/pdfUtils'
import fs from 'fs'
import path from 'path'

// Interfaces para tipagem
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
  autoTable: (options: UserOptions) => jsPDF;
}

interface SecaoGabarito {
  nome: string;
  total: number;
  categoriaEsperada: string;
  permiteMultiplosItens: boolean;
  isSecaoAdmin: boolean;
  isSecaoPalestrante: boolean;
  itemFuncoes: string[];
}

interface GabaritoColaboracao {
  fardamento: string;
  observacoes: string;
  secoes: SecaoGabarito[];
}

interface TableStyles {
  fontSize: number;
  font: string;
  cellPadding: number | { top: number; right: number; bottom: number; left: number };
  lineColor: [number, number, number];
  lineWidth: number;
  valign: 'middle' | 'top' | 'bottom';
  minCellHeight: number;
  halign: 'left' | 'center' | 'right';
}

interface HeadStyle {
  fontStyle: 'bold' | 'normal' | 'italic';
  fillColor: [number, number, number];
  textColor: number;
  halign: 'left' | 'center' | 'right';
  cellPadding: number | { top: number; right: number; bottom: number; left: number };
  fontSize: number;
  font: string;
  lineWidth: number;
}

interface CellContent {
  content: string;
  styles: Partial<HeadStyle> & { 
    halign?: 'left' | 'center' | 'right';
    fontStyle?: 'bold' | 'normal' | 'italic';
  };
  colSpan?: number;
}

interface ColumnStyle {
  cellWidth: number | 'auto';
  halign: 'left' | 'center' | 'right';
  fontStyle?: 'bold' | 'normal' | 'italic';
}

const GABARITO_COLABORACAO: GabaritoColaboracao = {
  fardamento: "- OS COMANDOS: COMPARECER FARDADOS.\n- OS ESCALADOS PARA LIMPEZA: COMPARECER DE TFM.\n- OS DEMAIS ALUNOS SE APRESETAR DE UNIFORME 1.",
  observacoes: "- O HASTEAMENTO DO PAVILHÃO NACIONAL: 13:25H.\n- SUSPENSÃO (-4 PONTOS): SERÁ APLICADA AO ALUNO QUE NÃO FIZER A PALESTRA, FALTAR OU CHEGAR À ESCALA APÓS ÀS 13:26H ( SALVO OS CASOS DEVIDAMENTE JUSTIFICADOS ).\n- A PALESTRA DEVERÁ TER O TEMPO DE 3MIN À 5MIN.\n- O COMANDANTE DO DIA É O RESPONSÁVEL POR FISCALIZAR O ANDAMENTO DAS ATIVIDADES REALIZADAS PELOS OS ALUNOS DA ESCALA EXTRA.",
  secoes: [
    { nome: 'DIRETOR', total: 1, categoriaEsperada: 'GESTAO', permiteMultiplosItens: false, isSecaoAdmin: true, isSecaoPalestrante: false, itemFuncoes: ["PRESIDENTE"] },
    { nome: 'COORDENAÇÃO', total: 3, categoriaEsperada: 'GESTAO', permiteMultiplosItens: true, isSecaoAdmin: true, isSecaoPalestrante: false, itemFuncoes: ["COORDENADOR", "AUXILIAR ADM.", "AUXILIAR ADM."] },
    { nome: 'COMANDOS', total: 4, categoriaEsperada: 'COMANDO', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["COMANDANTE DA TROPA", "SUB COMANDANTE", "COMP. EQUIPE – G4", "COMP. EQUIPE"] },
    { nome: 'CHEFE DE TURMA', total: 3, categoriaEsperada: 'CHEFE_TURMA', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["CHEFE DE TURMA – 1ª CIA", "CHEFE DE TURMA – 2ª CIA", "CHEFE DE TURMA – 3ª CIA"] },
    { nome: 'GUARDA BANDEIRA', total: 3, categoriaEsperada: 'GUARDA_BANDEIRA', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["GUARDA BANDEIRA", "GUARDA BANDEIRA", "GUARDA BANDEIRA"] },
    { nome: 'ESCALA EXTRA', total: 5, categoriaEsperada: 'ESCALA_EXTRA', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: false, itemFuncoes: ["LANCHE", "LANCHE", "LIMPEZA EXTERNA E INTERNA", "LIMPEZA EXTERNA E INTERNA", "LIMPEZA EXTERNA E INTERNA"] },
    { nome: 'PALESTRANTE', total: 3, categoriaEsperada: '', permiteMultiplosItens: true, isSecaoAdmin: false, isSecaoPalestrante: true, itemFuncoes: [] }
  ]
}

export class EscalaPDFBuilder extends PDFBuilder {
  private escala: EscalaCompleta

  constructor(escala: EscalaCompleta) {
    super(15)
    this.escala = escala
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    if (typeof window === 'undefined' && typeof Buffer !== 'undefined') {
      return Buffer.from(bytes).toString('base64');
    }
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    if (typeof btoa !== 'undefined') {
      return btoa(binary);
    }
    return typeof Buffer !== 'undefined' ? Buffer.from(bytes).toString('base64') : '';
  }

  private async loadFonts(): Promise<void> {
    try {
      let arialBase64: string;
      let arialBoldBase64: string;

      const isServer = typeof window === 'undefined';

      if (isServer) {
        const arialPath = path.join(process.cwd(), 'public', 'fonts', 'ARIAL.TTF');
        const arialBoldPath = path.join(process.cwd(), 'public', 'fonts', 'ARIALBD_1.TTF');
        const arialFile = fs.readFileSync(arialPath);
        const arialBoldFile = fs.readFileSync(arialBoldPath);
        arialBase64 = arialFile.toString('base64');
        arialBoldBase64 = arialBoldFile.toString('base64');
      } else {
        const [arialResponse, arialBoldResponse] = await Promise.all([
          fetch('/fonts/ARIAL.TTF'),
          fetch('/fonts/ARIALBD_1.TTF'),
        ]);

        if (!arialResponse.ok || !arialBoldResponse.ok) {
          throw new Error('Erro ao carregar fontes');
        }

        const [arialArrayBuffer, arialBoldArrayBuffer] = await Promise.all([
          arialResponse.arrayBuffer(),
          arialBoldResponse.arrayBuffer(),
        ]);

        arialBase64 = this.arrayBufferToBase64(arialArrayBuffer);
        arialBoldBase64 = this.arrayBufferToBase64(arialBoldArrayBuffer);
      }

      this.doc.addFileToVFS('ARIAL.TTF', arialBase64);
      this.doc.addFont('ARIAL.TTF', 'Arial', 'normal');
      this.doc.addFileToVFS('ARIALBD_1.TTF', arialBoldBase64);
      this.doc.addFont('ARIALBD_1.TTF', 'Arial', 'bold');
      this.doc.setFont('Arial', 'normal');

    } catch (error) {
      console.warn('Erro ao carregar fontes personalizadas, usando fontes padrão:', error);
      this.doc.setFont('helvetica', 'normal');
    }
  }

  addHeader(): this {
    super.addHeader()
    const data = new Date(this.escala.dataEscala)
    const dataCorrigida = new Date(data.valueOf() + data.getTimezoneOffset() * 60 * 1000)
    const diaFormatado = format(dataCorrigida, "dd/MM/yyyy (EEEE)", { locale: ptBR }).toUpperCase()
    const tipoFormatado = this.escala.tipo.replace('_', ' DE ').toUpperCase()

    this.doc.setFontSize(12)
    this.doc.setFont('Arial', 'bold')

    const subtitleY = this.currentY - 3
    const texto = `ESCALA DE ${tipoFormatado} – DIA ${diaFormatado}`
    this.doc.text(texto, this.pageWidth / 2, subtitleY, { align: 'center' })
    const textWidth = this.doc.getTextWidth(texto)
    const startX = this.pageWidth / 2 - textWidth / 2
    const lineY = subtitleY + 2
    this.doc.setLineWidth(0.6)
    this.doc.line(startX, lineY, startX + textWidth, lineY)
    this.currentY = subtitleY + 4
    this.doc.setFont('Arial', 'normal')
    return this
  }

  addFooter(): this {
    super.addFooter()
    return this
  }

  private addScaleContent(): void {
    const secoes = this.escala.itens.reduce((acc, item) => {
      const secaoKey = item.secao.toUpperCase()
      acc[secaoKey] = acc[secaoKey] || []
      acc[secaoKey].push(item)
      return acc
    }, {} as Record<string, typeof this.escala.itens>)

    const checkPageBreak = (neededHeight: number = 10): void => {
      if (this.currentY + neededHeight > this.pageHeight - this.margin - 10) {
        this.doc.addPage()
        this.currentY = this.margin + 10
      }
    }

    const orderedSecoes = Object.keys(secoes).sort((a, b) => {
      const orderA = GABARITO_COLABORACAO.secoes.findIndex(g => g.nome.toUpperCase() === a)
      const orderB = GABARITO_COLABORACAO.secoes.findIndex(g => g.nome.toUpperCase() === b)
      return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB)
    })

    const commonTableStyles: TableStyles = {
      fontSize: 8.5,
      font: 'Arial',
      cellPadding: 0.2,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      valign: 'middle',
      minCellHeight: 4,
      halign: 'center'
    }

    const headStyleDefault: HeadStyle = {
      fontStyle: 'bold',
      fillColor: [220, 220, 220],
      textColor: 0,
      halign: 'center',
      cellPadding: { top: 0.2, right: 0.2, bottom: 0.2, left: -9 },
      fontSize: 8.5,
      font: 'Arial',
      lineWidth: 0.3
    };

    for (const nomeSecao of orderedSecoes) {
      const itensSecao = secoes[nomeSecao]
      if (!itensSecao || itensSecao.length === 0) continue
      checkPageBreak(8)

      let body: CellContent[][] = []
      let columnStyles: { [key: number]: ColumnStyle } = {}
      let head: CellContent[][] = []

      if (nomeSecao === 'PALESTRANTE') {
        head = [[
          {
            content: nomeSecao,
            styles: headStyleDefault,
            colSpan: 3
          }
        ]]

        body = itensSecao.map(item => [
          { 
            content: item.cargo.toUpperCase(), 
            styles: { fontStyle: 'bold', halign: 'center' } 
          },
          { 
            content: item.aluno?.nomeDeGuerra?.toUpperCase() || 'N/A', 
            styles: { halign: 'center' } 
          },
          { 
            content: item.observacao?.toUpperCase() || '', 
            styles: { halign: 'center', fontStyle: 'normal' } 
          }
        ])

        columnStyles = {
          0: { cellWidth: 65, halign: 'center' },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 'auto', halign: 'center' }
        }

      } else {
        head = [[
          {
            content: nomeSecao,
            styles: headStyleDefault,
            colSpan: 3
          }
        ]]

        body = itensSecao.map(item => [
          { 
            content: item.cargo.toUpperCase(), 
            styles: { fontStyle: 'bold', halign: 'center' } 
          },
          { 
            content: `${item.horarioInicio} – ${item.horarioFim}`, 
            styles: { fontStyle: 'bold', halign: 'center' } 
          },
          { 
            content: item.aluno?.nomeDeGuerra?.toUpperCase() || 'N/A', 
            styles: { halign: 'center' } 
          }
        ])

        columnStyles = {
          0: { cellWidth: 65, halign: 'center' },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 'auto', halign: 'center' }
        }
      }

      autoTable(this.doc as jsPDFWithAutoTable, {
        startY: this.currentY,
        head: head as RowInput[],
        body: body as RowInput[],
        theme: 'grid',
        styles: commonTableStyles,
        headStyles: {
          fillColor: [220, 220, 220],
          textColor: 0,
          lineWidth: 0.3,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 0.2,
          font: 'Arial'
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: 0,
          lineWidth: 0.3,
          halign: 'center',
          cellPadding: 0.2,
          font: 'Arial'
        },
        columnStyles: columnStyles as unknown as { [key: string]: Partial<TableStyles> },
        margin: { left: this.margin, right: this.margin },
        tableWidth: 'auto',

        didDrawCell: (data: CellHookData) => {
          if (data.section === 'body') {
            const titleCell = data.table.head[0].cells[0];

            let titleContent = '';
            if (titleCell && titleCell.raw) {
              titleContent = String(titleCell.raw).toUpperCase();
            }
            const isPalestrante = titleContent === 'PALESTRANTE';

            if (isPalestrante && data.column.index === 2) {
              const cell = data.cell;
              const fullText = (cell.text?.[0] || '') as string;
              const prefix = "AUXILIAR - ";

              if (fullText.startsWith(prefix.toUpperCase())) {
                const studentName = fullText.substring(prefix.length);
                const prefixToShow = prefix.toUpperCase();

                this.doc.saveGraphicsState();
                this.doc.setFillColor(255, 255, 255);
                this.doc.rect(cell.x, cell.y, cell.width, cell.height, 'F');
                this.doc.restoreGraphicsState();

                const textX = cell.x + (cell.padding('left') || 0.2);
                const textY = cell.y + cell.height / 2;

                this.doc.setFont('Arial', 'bold');
                this.doc.text(prefixToShow, textX, textY, { baseline: 'middle' });

                const prefixWidth = this.doc.getTextWidth(prefixToShow);

                this.doc.setFont('Arial', 'normal');
                this.doc.text(studentName, textX + prefixWidth, textY, { baseline: 'middle' });
              }
            }
          }
        },

        didDrawPage: data => {
          if (data.pageNumber > this.doc.getNumberOfPages()) {
            this.currentY = this.margin + 10
          } else {
            this.currentY = data.cursor?.y ?? this.currentY
          }
        }
      })

      this.currentY = (this.doc as jsPDFWithAutoTable).lastAutoTable?.finalY ?? this.currentY + 2
    }

    const addSingleColumnSection = (title: string, text: string | null | undefined): void => {
      if (!text || text.trim() === '') return
      checkPageBreak(15)

      autoTable(this.doc as jsPDFWithAutoTable, {
        startY: this.currentY,
        head: [[
          {
            content: title.toUpperCase(),
            styles: {
              fontStyle: 'bold',
              fillColor: [220, 220, 220],
              textColor: 0,
              halign: 'center',
              cellPadding: { top: 0.2, right: 0.2, bottom: 0.2, left: 0.2 },
              fontSize: 8.5,
              font: 'Arial',
              lineWidth: 0.3
            }
          }
        ]] as RowInput[],
        body: [[
          {
            content: text.toUpperCase(),
            styles: {
              fontStyle: 'normal',
              halign: 'left',
              cellPadding: { top: 2.2, right: 2.2, bottom: 2.2, left: 2.2 },
              fontSize: 8.5,
              minCellHeight: 8,
              font: 'Arial'
            }
          }
        ]] as RowInput[],
        theme: 'grid',
        styles: commonTableStyles,
        headStyles: {
          fillColor: [220, 220, 220],
          textColor: 0,
          lineWidth: 0.3,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 0.2,
          font: 'Arial'
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: 0,
          lineWidth: 0.3,
          halign: 'left',
          cellPadding: 1.2,
          font: 'Arial'
        },
        columnStyles: {
          0: {
            cellWidth: this.pageWidth - this.margin * 2,
            halign: 'left'
          }
        } as unknown as { [key: string]: Partial<TableStyles> },
        margin: { left: this.margin, right: this.margin },
        tableWidth: 'auto',
        didDrawPage: data => {
          if (data.pageNumber > this.doc.getNumberOfPages()) {
            this.currentY = this.margin + 10
          } else {
            this.currentY = data.cursor?.y ?? this.currentY
          }
        }
      })

      this.currentY = (this.doc as jsPDFWithAutoTable).lastAutoTable?.finalY ?? this.currentY + 2
    }

    addSingleColumnSection('FARDAMENTO', this.escala.fardamento)
    addSingleColumnSection('OBSERVAÇÃO', this.escala.observacoes)

    checkPageBreak(15)

    const signatureTableStyles: TableStyles = {
      fontSize: 8.5,
      font: 'Arial',
      cellPadding: { top: 1.2, right: 1.2, bottom: 1.2, left: 1.2 },
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      valign: 'middle',
      minCellHeight: 8,
      halign: 'center'
    }

    autoTable(this.doc as jsPDFWithAutoTable, {
      startY: this.currentY,
      body: [[
        { content: 'ELABORADO', styles: { fontStyle: 'bold', halign: 'center' } },
        { content: 'Revisado: 29/09/25\nAUX. ADM. ISABELY', styles: { halign: 'center' } },
        { content: 'CONFERIDO', styles: { fontStyle: 'bold', halign: 'center' } }
      ]] as RowInput[],
      theme: 'grid',
      styles: signatureTableStyles,
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.3,
        minCellHeight: 4,
        cellPadding: { top: 0.2, right: 0.2, bottom: 0.2, left: 0.2 },
        font: 'Arial'
      },
      columnStyles: {
        0: { cellWidth: (this.pageWidth - this.margin * 2) / 3, halign: 'center' },
        1: { cellWidth: (this.pageWidth - this.margin * 2) / 3, halign: 'center' },
        2: { cellWidth: (this.pageWidth - this.margin * 2) / 3, halign: 'center' }
      } as unknown as { [key: string]: Partial<TableStyles> },
      margin: { left: this.margin, right: this.margin },
      tableWidth: 'auto'
    })

    this.currentY = (this.doc as jsPDFWithAutoTable).lastAutoTable?.finalY ?? this.currentY + 10

    this.doc.setFontSize(9)
    this.doc.setFont('Arial', 'bold')
    this.doc.text('ISABELY CRISTINA SILVA DE OLIVEIRA', this.pageWidth / 2, this.currentY, { align: 'center' })
    this.currentY += 3
    this.doc.setFontSize(8)
    this.doc.text('AUX ADM - ESCALANTE', this.pageWidth / 2, this.currentY, { align: 'center' })
  }

  public async build(): Promise<Uint8Array> {
    try {
      await this.init()
      await this.loadFonts()
      this.addHeader()
      this.addScaleContent()
      this.addWatermark()
      this.addFooter()
      const arrayBuffer = this.doc.output('arraybuffer')
      return new Uint8Array(arrayBuffer)
    } catch (error) {
      console.error('Erro ao construir PDF da Escala:', error)
      throw error
    }
  }
}