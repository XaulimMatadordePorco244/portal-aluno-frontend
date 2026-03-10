import prisma from "@/lib/prisma";

export type RegraComRequisitos = {
  cargoOrigemId: string;
  cargoDestinoId: string;
  requisitos: {
    campo: string;
    operador: 'GTE' | 'LTE' | 'EQ' | 'NEQ';
    valor: string;
  }[];
};

interface AlunoSimulacao {
  usuario: { nomeDeGuerra: string | null };
  conceitoAtual: string | null;
  desempenhosEscolares: { mediaFinal: number | null }[];
  tafs: { mediaFinal: number | null }[];
  historicoCargos: { dataInicio: Date }[];
  anotacoesRecebidas?: unknown[]; 
}

export async function simularPromocao(modalidade: string, regrasDraft: RegraComRequisitos[]) {
  const resultados = [];

  for (const regra of regrasDraft) {
    
    const alunosCandidatos = await prisma.perfilAluno.findMany({
      where: { 
        cargoId: regra.cargoOrigemId,
        usuario: { status: 'ATIVO' }
      },
      include: {
        usuario: { select: { nomeDeGuerra: true } },
        desempenhosEscolares: { orderBy: { anoLetivo: 'desc' }, take: 1 }, 
        tafs: { orderBy: { dataRealizacao: 'desc' }, take: 1 },
        historicoCargos: { orderBy: { dataInicio: 'desc' }, take: 1 },
        anotacoesRecebidas: true 
      }
    });

    let aprovados = 0;
    let reprovados = 0;
    const detalhesReprovacao: string[] = [];

    for (const aluno of alunosCandidatos) {
      let passouEmTudo = true;

      for (const req of regra.requisitos) {
        const valorAluno = extrairValorAluno(aluno as unknown as AlunoSimulacao, req.campo);
        const valorMeta = parseFloat(req.valor); 
        
        const atende = comparar(valorAluno, req.operador, valorMeta);
        
        if (!atende) {
          passouEmTudo = false;
          if (detalhesReprovacao.length < 5) { 
             detalhesReprovacao.push(`Aluno ${aluno.usuario.nomeDeGuerra}: Falhou em ${req.campo} (${valorAluno} vs ${req.valor})`);
          }
          break;
        }
      }

      if (passouEmTudo) aprovados++;
      else reprovados++;
    }

    resultados.push({
      origem: regra.cargoOrigemId,
      destino: regra.cargoDestinoId,
      totalCandidatos: alunosCandidatos.length,
      aprovados,
      reprovados,
      exemplosFalha: detalhesReprovacao
    });
  }

  return resultados;
}

function extrairValorAluno(aluno: AlunoSimulacao, campo: string): number {
  switch (campo) {
    case 'MEDIA_ESCOLAR':
      return aluno.desempenhosEscolares[0]?.mediaFinal || 0;
    case 'CONCEITO':
      return parseFloat(aluno.conceitoAtual || "0"); 
    case 'TAF':
      return aluno.tafs[0]?.mediaFinal || 0;
    case 'INTERSTICIO_MESES':
      const ultimaPromocao = aluno.historicoCargos[0]?.dataInicio;
      if (!ultimaPromocao) return 0;
      const diffTime = Math.abs(new Date().getTime() - new Date(ultimaPromocao).getTime());
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); 
      return diffMonths;
    default:
      return 0;
  }
}

function comparar(valorReal: number, operador: string, valorMeta: number) {
  switch (operador) {
    case 'GTE': return valorReal >= valorMeta;
    case 'LTE': return valorReal <= valorMeta;
    case 'EQ':  return valorReal === valorMeta;
    case 'NEQ': return valorReal !== valorMeta;
    default: return false;
  }
}