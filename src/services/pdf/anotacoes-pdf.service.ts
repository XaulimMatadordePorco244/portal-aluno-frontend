import { PDFBuilder } from '@/lib/pdf/pdfUtils'; 
import { renderAnotacoesPDF, ExtratoPDFData } from '@/lib/pdf/anotacoes.template';

export class AnotacoesPdfService {
  
  async generate(dados: ExtratoPDFData): Promise<void> {
    const pdf = new PDFBuilder();
    
    await pdf.init();

    renderAnotacoesPDF(pdf, dados);

    const nomeArquivo = `extrato_${this.sanitizeFilename(
      dados.aluno.nomeDeGuerra || 'aluno'
    )}.pdf`;

    pdf.doc.save(nomeArquivo);
  }

  private sanitizeFilename(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  }
}

export const anotacoesPdfService = new AnotacoesPdfService();