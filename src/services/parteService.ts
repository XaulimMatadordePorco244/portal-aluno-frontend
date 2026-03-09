import prisma from '@/lib/prisma';
import { TipoProcesso } from '@prisma/client';

interface CriarParteDTO {
  assunto: string;
  conteudo: string;
  tipo: TipoProcesso;
  autorId: string;
  dataFato?: string;
}

export const parteService = {

  async criar(dados: CriarParteDTO) {
    if (dados.tipo === 'ATO_DE_BRAVURA') {
      if (!dados.dataFato) {
        throw new Error("A data do fato é obrigatória para Ato de Bravura.");
      }

      const dataOcorrido = new Date(dados.dataFato);
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);

      dataOcorrido.setHours(0, 0, 0, 0);
      dataLimite.setHours(0, 0, 0, 0);

      if (dataOcorrido < dataLimite) {
        throw new Error("O prazo para solicitar Ato de Bravura (30 dias) expirou (Prescrito).");
      }
    }

    return await prisma.parte.create({
      data: {
        assunto: dados.assunto,
        conteudo: dados.conteudo,
        tipo: dados.tipo,
        autorId: dados.autorId,
        dataFato: dados.dataFato ? new Date(dados.dataFato) : null,
        status: 'RASCUNHO',
        numeroDocumento: null
      }
    });
  },

  async editar(id: string, autorId: string, dados: Partial<CriarParteDTO>) {
    const parte = await prisma.parte.findUnique({ where: { id } });

    if (!parte) throw new Error("Parte não encontrada.");
    if (parte.autorId !== autorId) throw new Error("Sem permissão para editar esta parte.");
    if (parte.status !== 'RASCUNHO') throw new Error("Esta parte já foi enviada e não pode ser editada.");

    if (dados.tipo === 'ATO_DE_BRAVURA' && dados.dataFato) {
      const dataOcorrido = new Date(dados.dataFato);
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);
      if (dataOcorrido < dataLimite) throw new Error("O novo prazo informado excede o limite de 30 dias.");
    }

    return await prisma.parte.update({
      where: { id },
      data: {
        assunto: dados.assunto,
        conteudo: dados.conteudo,
        tipo: dados.tipo,
        dataFato: dados.dataFato ? new Date(dados.dataFato) : parte.dataFato,
      }
    });
  },

  async excluir(id: string, autorId: string) {
    const parte = await prisma.parte.findUnique({ where: { id } });

    if (!parte) throw new Error("Parte não encontrada.");
    if (parte.autorId !== autorId) throw new Error("Sem permissão para excluir esta parte.");
    if (parte.status !== 'RASCUNHO') throw new Error("Partes enviadas não podem ser excluídas, apenas arquivadas pelo comando.");

    return await prisma.parte.delete({ where: { id } });
  },

  async enviarParaAnalise(id: string, autorId: string) {
    return await prisma.$transaction(async (tx) => {
      const parte = await tx.parte.findUnique({ where: { id } });

      if (!parte || parte.autorId !== autorId) throw new Error("Parte inválida.");
      if (parte.status !== 'RASCUNHO') throw new Error("Esta parte já foi enviada.");

      const comandante = await tx.usuario.findFirst({
        where: {
          perfilAluno: {
            cargo: { nome: 'COMANDANTE GERAL' }
          }
        }
      });

      const anoAtual = new Date().getFullYear();

      const config = await tx.configuracao.upsert({
        where: { id: 'singleton' },
        create: {
          id: 'singleton',
          ultimaParteNumero: 0,
          anoReferencia: anoAtual
        },
        update: {},
      });

      let proximoNumero = config.ultimaParteNumero + 1;

      if (config.anoReferencia && config.anoReferencia !== anoAtual) {
        proximoNumero = 1;
        await tx.configuracao.update({
          where: { id: 'singleton' },
          data: { anoReferencia: anoAtual, ultimaParteNumero: proximoNumero }
        });
      } else {
        await tx.configuracao.update({
          where: { id: 'singleton' },
          data: { ultimaParteNumero: { increment: 1 } }
        });
      }

      const numeroFormatado = `DOC-${String(proximoNumero).padStart(4, '0')}-${anoAtual}`;

      const parteAtualizada = await tx.parte.update({
        where: { id },
        data: {
          status: 'AGUARDANDO_COMANDANTE',
          numeroDocumento: numeroFormatado,
          responsavelAtualId: comandante ? comandante.id : null,
          dataEnvio: new Date()
        },

        include: {
          autor: {
            include: {
              perfilAluno: {
                include: { cargo: true }
              }
            }
          }
        }
      });

      await tx.logParte.create({
        data: {
          parteId: id,
          atorId: autorId,
          acao: 'ENVIOU_PARA_ANALISE',
          detalhes: `Parte oficializada sob protocolo ${numeroFormatado} e enviada ao Comando.`
        }
      });

      return parteAtualizada;
    },

      {
        maxWait: 5000,
        timeout: 15000,
      }
    );
  }
};