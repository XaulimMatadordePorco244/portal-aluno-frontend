import jsPDF from 'jspdf';


async function toBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export class PDFBuilder {
    doc: jsPDF;
    pageWidth: number;
    pageHeight: number;
    margin: number;
    logoBase64: string | null = null;
    watermarkBase64: string | null = null;
    currentY: number;

    constructor(margin = 25) {
        this.doc = new jsPDF({ unit: 'mm', format: 'a4' });
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.margin = margin;
        this.currentY = 0;
    }

    async init() {
        this.logoBase64 = await toBase64('/img/logo.png');
        this.watermarkBase64 = await toBase64('/img/logo.png');
    }

    addHeader() {
        if (!this.logoBase64) throw new Error("PDFBuilder não inicializado. Chame init() primeiro.");

        const logoY = this.margin - 20;
        const logoSize = 27;
        this.doc.addImage(this.logoBase64, 'PNG', this.margin, logoY, logoSize, logoSize);

        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(18);
        this.doc.text('GUARDA MIRIM DE NAVIRAÍ-MS', this.pageWidth / 2 + 13, this.margin - 10, { align: 'center' });

        this.doc.setFontSize(14);
        this.doc.text('ESTADO DE MATO GROSSO DO SUL', this.pageWidth / 2 + 13, this.margin - 3, { align: 'center' });

        this.doc.setLineWidth(1);
        this.doc.line(this.margin - 11, this.margin + 10, this.pageWidth - 14, this.margin + 10);


        this.currentY = this.margin + 20;
    }

    addFooter() {
        const pageCount = (this.doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);

            const footerY = this.pageHeight - this.margin + 10;

            this.doc.setLineWidth(0.6);
            this.doc.line(this.margin + 4, footerY - 6, this.pageWidth - this.margin - 4, footerY - 6);

            this.doc.setFont('helvetica', 'normal');
            this.doc.setFontSize(9);
            this.doc.setTextColor(100);

            this.doc.text("Rua Bandeirantes, nº 365 – Centro - Naviraí/MS", this.pageWidth / 2, footerY - 2, { align: 'center' });
            this.doc.text("Contato: (67) 99999-4341 / e-mail: gmnaviraims@gmail.com", this.pageWidth / 2, footerY + 2, { align: 'center' });

            this.doc.setFontSize(8);
            this.doc.text(`Página ${i} de ${pageCount}`, this.pageWidth - this.margin, this.pageHeight - 10, { align: 'right' });
        }
        this.doc.setTextColor(0);
    }

    addWatermark() {
        if (!this.watermarkBase64) throw new Error("PDFBuilder não inicializado.");

        const pageCount = (this.doc as any).internal.getNumberOfPages();
        const imgWidth = 150;
        const imgHeight = 150;
        const imgX = (this.pageWidth - imgWidth) / 2;
        const imgY = (this.pageHeight - imgHeight) / 2;

        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);
            this.doc.saveGraphicsState();
            this.doc.setGState(new (this.doc as any).GState({ opacity: 0.1 }));
            this.doc.addImage(this.watermarkBase64, 'PNG', imgX, imgY, imgWidth, imgHeight);
            this.doc.restoreGraphicsState();
        }
    }


    addTitle(text: string, fontSize = 14) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(fontSize);
        this.doc.text(text, this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += fontSize / 2;
        return this;
    }


    addParagraph(text: string) {
        if (!text) return this;
        const maxWidth = this.pageWidth - this.margin * 2;
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(11);
        const lines = this.doc.splitTextToSize(text, maxWidth);
        this.doc.text(lines, this.margin, this.currentY, { align: 'justify' });
        this.currentY += (lines.length * 5) + 6;
        return this;
    }


    addKeyValueLine(key: string, value: string, p0?: { space?: number }) {
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.text(key, this.margin, this.currentY);
    if (value) {
        const space = p0?.space ?? 35;
        this.doc.text(value, this.margin + space, this.currentY);
    }
    this.currentY += 7;
    return this;
}


    addSignatureLine(name: string, role: string) {
        const signatureY = this.pageHeight - this.margin - 20;
        if (this.currentY > signatureY - 10) {
            this.doc.addPage();
            this.currentY = this.margin;
        }

        this.doc.line(this.pageWidth / 2 - 40, signatureY, this.pageWidth / 2 + 40, signatureY);

        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(11);
        this.doc.text(name, this.pageWidth / 2, signatureY + 5, { align: 'center' });

        this.doc.setFontSize(9);
        this.doc.text(role, this.pageWidth / 2, signatureY + 9, { align: 'center' });
        return this;
    }


    addSpacing(spaceInMm = 5) {
        this.currentY += spaceInMm;
        return this;
    }
}