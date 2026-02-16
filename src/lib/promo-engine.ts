import  prisma  from "@/lib/prisma";

// Tipos para simulação
type RegraComRequisitos = {
  cargoOrigemId: string;
  cargoDestinoId: string;
  requisitos: {
    campo: string;
    operador: 'GTE' | 'LTE' | 'EQ' | 'NEQ';
    valor: string;
  }[];
};

export async function simularPromocao(modalidade: string, regrasDraft: RegraComRequisitos[]) {
  const resultados = [];

  // 1. Para cada regra definida (ex: Soldado -> Cabo)
  for (const regra of regrasDraft) {
    
    // 2. Buscar todos os alunos que estão no cargo de origem
    const alunosCandidatos = await prisma.perfilAluno.findMany({
      where: { 
        cargoId: regra.cargoOrigemId,
        usuario: { status: 'ATIVO' }
      },
      include: {
        desempenhosEscolares: { orderBy: { anoLetivo: 'desc' }, take: 1 }, // Pega nota mais recente
        tafs: { orderBy: { dataRealizacao: 'desc' }, take: 1 }, // Pega TAF mais recente
        historicoCargos: { orderBy: { dataInicio: 'desc' }, take: 1 }, // Para calcular interstício
        anotacoesRecebidas: true // Para contar punições
      }
    });

    let aprovados = 0;
    let reprovados = 0;
    const detalhesReprovacao: string[] = [];

    // 3. Avaliar cada aluno contra os requisitos dinâmicos
    for (const aluno of alunosCandidatos) {
      let passouEmTudo = true;

      for (const req of regra.requisitos) {
        const valorAluno = extrairValorAluno(aluno, req.campo);
        const valorMeta = parseFloat(req.valor); // Assume numérico por enquanto
        
        const atende = comparar(valorAluno, req.operador, valorMeta);
        
        if (!atende) {
          passouEmTudo = false;
          if (detalhesReprovacao.length < 5) { // Guardar apenas alguns exemplos
             detalhesReprovacao.push(`Aluno ${aluno.nomeDeGuerra}: Falhou em ${req.campo} (${valorAluno} vs ${req.valor})`);
          }
          break; // Falhou em um requisito obrigatório, para de verificar
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

// Helper: Extrai o valor do aluno baseado no campo configurado
function extrairValorAluno(aluno: any, campo: string): number {
  switch (campo) {
    case 'MEDIA_ESCOLAR':
      return aluno.desempenhosEscolares[0]?.mediaFinal || 0;
    case 'CONCEITO':
      // Assumindo que conceitoAtual é string numérica no seu banco
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

// Helper: Comparador Lógico
function comparar(valorReal: number, operador: string, valorMeta: number) {
  switch (operador) {
    case 'GTE': return valorReal >= valorMeta;
    case 'LTE': return valorReal <= valorMeta;
    case 'EQ':  return valorReal === valorMeta;
    case 'NEQ': return valorReal !== valorMeta;
    default: return false;
  }
}