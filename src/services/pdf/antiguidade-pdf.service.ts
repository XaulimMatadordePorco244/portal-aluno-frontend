import { gerarRelatorioAntiguidade, AntiguidadeReportData } from '@/lib/pdf/antiguidade.template';



export const antiguidadePdfService = {
  generate: async (data: AntiguidadeReportData) => {
    try {
      await gerarRelatorioAntiguidade(data);
    } catch (error) {
      console.error('Erro ao gerar relatório de antiguidade:', error);
      throw error;
    }
  }
};