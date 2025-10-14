import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { HookData } from 'jspdf-autotable';
import { EscalaCompleta } from '@/app/admin/escalas/[id]/page';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export class EscalaPDFBuilder {
  private doc: jsPDFWithAutoTable;
  private escala: EscalaCompleta;
  private pageHeight: number;
  private pageWidth: number;
  private logoBase64: string;

  constructor(escala: EscalaCompleta, logoBase64: string) {
    this.doc = new jsPDF() as jsPDFWithAutoTable;
    this.escala = escala;
    this.logoBase64 = logoBase64;
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
  }

  private addHeader() {
    this.doc.addImage(this.logoBase64, 'PNG', 15, 10, 30, 30);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('GUARDA MIRIM DE NAVIRAÍ – MS', this.pageWidth / 2, 20, { align: 'center' });

    const data = new Date(this.escala.dataEscala);
    data.setDate(data.getDate() + 1); 
    const diaFormatado = format(data, "dd/MM/yyyy (EEEE)", { locale: ptBR }).toUpperCase();
    const tipoFormatado = this.escala.tipo.replace('_', ' DE ').toUpperCase();

    this.doc.setFontSize(11);
    this.doc.text(`ESCALA DE ${tipoFormatado} – DIA ${diaFormatado}`, this.pageWidth / 2, 30, { align: 'center' });
  }

  private addFooter(pageNumber: number, pageCount: number) {
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'italic');
    const elaboradoStr = `Elaborado por: ${this.escala.elaboradoPor}`;
    const geradoStr = `Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`;
    
    this.doc.text(elaboradoStr, 15, this.pageHeight - 10);
    this.doc.text(geradoStr, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
    this.doc.text(`Página ${pageNumber} de ${pageCount}`, this.pageWidth - 15, this.pageHeight - 10, { align: 'right' });
  }

  private addContent() {
    const secoes = this.escala.itens.reduce((acc, item) => {
      acc[item.secao] = acc[item.secao] || [];
      acc[item.secao].push(item);
      return acc;
    }, {} as Record<string, EscalaCompleta['itens']>);

    let startY = 50;

    for (const nomeSecao in secoes) {
      const itensSecao = secoes[nomeSecao];
      const body = itensSecao.map(item => [
        item.cargo.toUpperCase(),
        `${item.horarioInicio} - ${item.horarioFim}`,
        item.aluno.nomeDeGuerra?.toUpperCase() || item.aluno.nome.toUpperCase(),
        item.observacao?.toUpperCase() || ''
      ]);

      this.doc.autoTable({
        startY: startY,
        head: [[{ content: nomeSecao.toUpperCase(), styles: { halign: 'center', fillColor: [200, 200, 200], textColor: 0 } }]],
        body: body,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 30 },
            2: { cellWidth: 60 },
            3: { cellWidth: 'auto' },
        },
      
        didDrawPage: (data: HookData) => {
            startY = data.cursor?.y ? data.cursor.y + 10 : startY + 50;
        }
      });
      startY = (this.doc as any).autoTable.previous.finalY + 10;
    }
  }

  public async build(): Promise<Uint8Array> {
    const pageCount = (this.doc as any).internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
        this.doc.setPage(i);
        this.addHeader();
        this.addFooter(i, pageCount);
    }
    
    this.doc.setPage(1);
    this.addContent();

  
    return new Uint8Array(this.doc.output('arraybuffer'));
  }
}