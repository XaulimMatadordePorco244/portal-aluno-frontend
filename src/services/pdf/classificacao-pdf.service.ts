import { PDFBuilder } from '@/lib/pdf/pdfUtils'; // Ajuste o caminho
import { buildClassificacaoTemplate, ClassificacaoPdfItem } from '@/lib/pdf/classificacao.template';

export class ClassificacaoPdfService {
  static async generate(dados: ClassificacaoPdfItem[], dataAtualizacao: string): Promise<Blob> {
    const builder = new PDFBuilder();
    
    await builder.init();
    
    await buildClassificacaoTemplate(builder, dados, dataAtualizacao);
    
    return builder.doc.output('blob');
  }

  static async download(dados: ClassificacaoPdfItem[], dataAtualizacao: string, filename = 'classificacao.pdf') {
    const blob = await this.generate(dados, dataAtualizacao);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}