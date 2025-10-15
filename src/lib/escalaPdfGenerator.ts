import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EscalaCompleta } from '@/app/admin/escalas/[id]/page';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


(jsPDF as any).autoTable = autoTable;

export class EscalaPDFBuilder {
  private doc: jsPDF;
  private escala: EscalaCompleta;
  private pageHeight: number;
  private pageWidth: number;
  private logoBase64: string;

  constructor(escala: EscalaCompleta, logoBase64: string) {
    this.doc = new jsPDF();
    this.escala = escala;
    this.logoBase64 = logoBase64;
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
  }

  private addHeader() {

    if (this.logoBase64) {
      try {
        this.doc.addImage(this.logoBase64, 'PNG', 15, 10, 30, 30);
      } catch (error) {
        console.warn('Erro ao adicionar logo:', error);
      }
    }

   
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('GUARDA MIRIM DE NAVIRAÍ – MS', this.pageWidth / 2, 20, { align: 'center' });

 
    const data = new Date(this.escala.dataEscala);
    const diaFormatado = format(data, "dd/MM/yyyy (EEEE)", { locale: ptBR }).toUpperCase();
    const tipoFormatado = this.escala.tipo.replace('_', ' DE ').toUpperCase();

    this.doc.setFontSize(11);
    this.doc.text(`ESCALA DE ${tipoFormatado} – DIA ${diaFormatado}`, this.pageWidth / 2, 30, { align: 'center' });
  }

  private addFooter(pageNumber: number, pageCount: number) {
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'italic');
    const elaboradoStr = `Elaborado por: ${this.escala.elaboradoPor}`;
    const geradoStr = `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`;
    
    this.doc.text(elaboradoStr, 15, this.pageHeight - 10);
    this.doc.text(geradoStr, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
    this.doc.text(`Página ${pageNumber} de ${pageCount}`, this.pageWidth - 15, this.pageHeight - 10, { align: 'right' });
  }

  private addContent() {
    const secoes = this.escala.itens.reduce((acc, item) => {
      if (!acc[item.secao]) {
        acc[item.secao] = [];
      }
      acc[item.secao].push(item);
      return acc;
    }, {} as Record<string, EscalaCompleta['itens']>);

    let startY = 50;

    
    Object.entries(secoes).forEach(([nomeSecao, itensSecao]) => {
      
      if (startY > this.pageHeight - 50) {
        this.doc.addPage();
        startY = 20;
        this.addHeader();
      }

      const body = itensSecao.map(item => [
        item.cargo.toUpperCase(),
        `${item.horarioInicio} - ${item.horarioFim}`,
        item.aluno?.nomeDeGuerra?.toUpperCase() || item.aluno?.nome?.toUpperCase() || 'NÃO ATRIBUÍDO',
        item.observacao?.toUpperCase() || ''
      ]);

      
      autoTable(this.doc, {
        startY: startY,
        head: [[{ 
          content: nomeSecao.toUpperCase(), 
          styles: { 
            halign: 'center', 
            fillColor: [200, 200, 200], 
            textColor: 0,
            fontStyle: 'bold'
          } 
        }]],
        body: body,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [150, 150, 150],
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 30 },
          2: { cellWidth: 60 },
          3: { cellWidth: 'auto' },
        },
      });

     
      const finalY = (this.doc as any).lastAutoTable.finalY;
      startY = finalY + 15;
    });
  }

  public async build(): Promise<Uint8Array> {
    try {
     
      this.addHeader();
      this.addContent();

   
      const pageCount = this.doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        this.doc.setPage(i);
        this.addFooter(i, pageCount);
      }

      
      const arrayBuffer = this.doc.output('arraybuffer');
      return new Uint8Array(arrayBuffer);

    } catch (error) {
      console.error('Erro ao construir PDF:', error);
      throw error;
    }
  }
}