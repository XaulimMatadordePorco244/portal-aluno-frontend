import jsPDF from 'jspdf';

async function toBase64(url: string): Promise<string> {
  let absoluteUrl = url;
  if (!url.startsWith('http')) {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    absoluteUrl = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    console.log('PDFBuilder: Buscando imagem de:', absoluteUrl);
  }

  try {
    const allowedOrigins = ['localhost', '127.0.0.1', 'gmnavirai.com.br'];
    const parsedUrl = new URL(absoluteUrl);
    if (!allowedOrigins.some((o) => parsedUrl.hostname.includes(o))) {
      throw new Error('Acesso negado a domínio não autorizado.');
    }

    const response = await fetch(absoluteUrl);
    if (!response.ok)
      throw new Error(`Falha ao buscar imagem: ${response.status} ${response.statusText} de ${absoluteUrl}`);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/png';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`Erro na função toBase64 ao buscar ${absoluteUrl}:`, error);
    throw error;
  }
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
    this.currentY = this.margin;
  }

  async init() {
    try {
      const logoPath = '/img/logo.png';
      const watermarkPath = '/img/logo.png';
      this.logoBase64 = await toBase64(logoPath);
      this.watermarkBase64 = await toBase64(watermarkPath);
      console.log('PDFBuilder: Imagens carregadas com sucesso.');
    } catch (error) {
      console.error('PDFBuilder: Erro crítico ao carregar imagens no init():', error);
      this.logoBase64 = null;
      this.watermarkBase64 = null;
    }
  }

  addHeader() {
    if (this.logoBase64) {
      const logoY = this.margin - 10;
      const logoSize = 27;
      const logoX = this.margin + 11;
      this.doc.addImage(this.logoBase64, 'PNG', logoX, logoY, logoSize, logoSize);
    }

    const textStartX = this.margin + 28;
    const availableWidth = this.pageWidth - textStartX - this.margin;
    const textCenterX = textStartX + availableWidth / 2;

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(19);
    this.doc.text('GUARDA MIRIM DE NAVIRAÍ-MS', textCenterX, this.margin + 5, { align: 'center' });
    this.doc.setFontSize(15);
    this.doc.text('ESTADO DE MATO GROSSO DO SUL', textCenterX, this.margin + 12, { align: 'center' });

    const lineY = this.margin + 20;
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, lineY, this.pageWidth - this.margin, lineY);

    this.currentY = lineY + 10;
    this.doc.setFont('helvetica', 'normal');
      }

  addFooter() {
    const pageCount = (this.doc as any).internal.getNumberOfPages();
    const footerStartY = this.pageHeight - this.margin;

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      const lineY = footerStartY - 2;
      this.doc.setLineWidth(0.6);
      this.doc.line(this.margin, lineY, this.pageWidth - this.margin, lineY);

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9);
      this.doc.setTextColor(100);

      const textY1 = lineY + 4;
      const textY2 = textY1 + 4;

      this.doc.text('Rua Bandeirantes, nº 365 – Centro - Naviraí/MS', this.pageWidth / 2, textY1, { align: 'center' });
      this.doc.text('Contato: (67) 99999-4341 / e-mail: gmnaviraims@gmail.com', this.pageWidth / 2, textY2, {
        align: 'center',
      });

   
    }

    this.doc.setTextColor(0);
    this.doc.setFont('helvetica', 'normal');
  }

  addWatermark() {
    if (!this.watermarkBase64) return;
    const pageCount = (this.doc as any).internal.getNumberOfPages();
    const imgWidth = 150;
    const imgHeight = 150;
    const imgX = (this.pageWidth - imgWidth) / 2;
    const imgY = (this.pageHeight - imgHeight) / 2;

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.saveGraphicsState();
      try {
        const GState = (this.doc as any).GState;
        if (GState) this.doc.setGState(new GState({ opacity: 0.1 }));
      } catch {}
      this.doc.addImage(this.watermarkBase64, 'PNG', imgX, imgY, imgWidth, imgHeight);
      this.doc.restoreGraphicsState();
    }
  }

  getTextHeight(text: string | string[], fontSize: number, maxWidth: number): number {
    const lines = Array.isArray(text) ? text : this.doc.setFontSize(fontSize).splitTextToSize(text, maxWidth);
    const fontHeightInPoints = fontSize * this.doc.getLineHeightFactor();
    const pointsToMm = 0.352778;
    return lines.length * fontHeightInPoints * pointsToMm;
  }

  addTitle(text: string, fontSize = 14, spacingAfter = 5) {
    if (this.currentY < this.margin) this.currentY = this.margin;
    const textHeight = this.getTextHeight(text, fontSize, this.pageWidth - this.margin * 2);
    if (this.currentY + textHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(fontSize);
    this.doc.text(text, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += textHeight + spacingAfter;
    this.doc.setFont('helvetica', 'normal');
    return this;
  }

  addParagraph(text: string | string[], align: 'left' | 'center' | 'right' | 'justify' = 'justify', fontSize = 11, spacingAfter = 3) {
    if (!text) return this;
    if (this.currentY < this.margin) this.currentY = this.margin;
    const maxWidth = this.pageWidth - this.margin * 2;
    const lines = Array.isArray(text) ? text : this.doc.setFontSize(fontSize).splitTextToSize(text, maxWidth);
    const textHeight = this.getTextHeight(lines, fontSize, maxWidth);

    if (this.currentY + textHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(fontSize);
    this.doc.text(lines, this.margin, this.currentY, { align });
    this.currentY += textHeight + spacingAfter;
    return this;
  }

  addKeyValueLine(key: string, value: string, options?: { keySpace?: number; valueAlign?: 'left' | 'right' | 'center'; fontSize?: number; spacingAfter?: number }) {
    if (this.currentY < this.margin) this.currentY = this.margin;
    const keySpace = options?.keySpace ?? 35;
    const valueAlign = options?.valueAlign ?? 'left';
    const fontSize = options?.fontSize ?? 11;
    const spacingAfter = options?.spacingAfter ?? 3;
    const textHeight = this.getTextHeight('Tg', fontSize, 10);

    if (this.currentY + textHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(fontSize);
    this.doc.text(key, this.margin, this.currentY);

    if (value) {
      this.doc.setFont('helvetica', 'normal');
      const valueMaxWidth = this.pageWidth - this.margin * 2 - keySpace;
      const valueLines = this.doc.splitTextToSize(value, valueMaxWidth);
      this.doc.text(valueLines, this.margin + keySpace, this.currentY, { align: valueAlign });
      const valueHeight = this.getTextHeight(valueLines, fontSize, valueMaxWidth);
      this.currentY += Math.max(textHeight, valueHeight) + spacingAfter;
    } else {
      this.currentY += textHeight + spacingAfter;
    }
    return this;
  }

  addSignatureLine(name: string, role: string) {
    const signatureBlockHeight = 20;
    const signatureY = this.pageHeight - this.margin - signatureBlockHeight;

    if (this.currentY > signatureY) {
      this.doc.addPage();
      this.currentY = this.pageHeight - this.margin - signatureBlockHeight;
    } else {
      this.currentY = signatureY;
    }

    const lineY = this.currentY;
    this.doc.line(this.pageWidth / 2 - 40, lineY, this.pageWidth / 2 + 40, lineY);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.text(name, this.pageWidth / 2, lineY + 5, { align: 'center' });

    this.doc.setFontSize(9);
    this.doc.text(role, this.pageWidth / 2, lineY + 9, { align: 'center' });

    this.currentY += signatureBlockHeight + 5;
    return this;
  }

  addSpacing(spaceInMm = 5) {
    if (this.currentY < this.margin) this.currentY = this.margin;
    const nextY = this.currentY + spaceInMm;
    if (nextY > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    } else {
      this.currentY = nextY;
    }
    return this;
  }
}
