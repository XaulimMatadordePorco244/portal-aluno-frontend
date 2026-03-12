import prisma from "@/lib/prisma"
import RegrasPromocaoForm from "@/components/admin/configuracoes/RegrasPromocaoForm"; 
import { CampoRequisito } from "@prisma/client";

type RequisitoBasico = {
  campo: string;
  valor: string;
};

const getValor = (requisitos: RequisitoBasico[], campo: string, padrao: number | boolean = 0) => {
  const req = requisitos.find(r => r.campo === campo);
  if (!req) return padrao;
  
  if (campo === 'SEM_NOTA_VERMELHA') return req.valor === 'true';
  return parseFloat(req.valor);
};

interface PageProps {
  params: Promise<{ modalidade: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const modalidade = decodeURIComponent(resolvedParams.modalidade).toUpperCase();

  // 1. Busca todos os cargos ordenados por precedência DESCENDENTE (do mais moderno para o mais antigo)
  const todosCargos = await prisma.cargo.findMany({
    orderBy: { precedencia: 'desc' }, 
    select: { id: true, nome: true, abreviacao: true, tipo: true, precedencia: true }
  });

  // 2. Filtra removendo os cargos de "CURSO", preservando apenas o "AL SD"
  const cargosValidos = todosCargos.filter(c => 
    c.tipo !== 'CURSO' || c.abreviacao === 'AL SD'
  );

  const regrasSalvas = await prisma.regraPromocao.findMany({
    where: { modalidade },
    include: { requisitos: true }
  });

  const paresPossiveis = [];

  // 3. Monta a escada de promoção sequencial (AL SD -> SD, SD -> CB, etc.)
  for (let i = 0; i < cargosValidos.length - 1; i++) {
    const origem = cargosValidos[i];
    const destino = cargosValidos[i + 1]; 

    const regraBanco = regrasSalvas.find(
      r => r.cargoOrigemId === origem.id && r.cargoDestinoId === destino.id
    );

    const requisitos = regraBanco?.requisitos || [];

    paresPossiveis.push({
      cargoOrigem: { 
        id: origem.id, 
        abreviacao: origem.abreviacao, 
        nome: origem.nome 
      },
      cargoDestino: { 
        id: destino.id, 
        abreviacao: destino.abreviacao, 
        nome: destino.nome 
      },
      
      minMediaEscolar: getValor(requisitos, CampoRequisito.MEDIA_ESCOLAR, 0) as number,
      minConceito: getValor(requisitos, CampoRequisito.CONCEITO, 0) as number,
      minTaf: getValor(requisitos, CampoRequisito.TAF, 0) as number,
      mesesIntersticio: getValor(requisitos, CampoRequisito.INTERSTICIO_MESES, 0) as number,
      minNotaProvaTeorica: getValor(requisitos, CampoRequisito.NOTA_PROVA_TEORICA, 0) as number,
      
      exigeProvaTeorica: getValor(requisitos, CampoRequisito.NOTA_PROVA_TEORICA, -1) !== -1,
      exigeSemNotaVermelha: getValor(requisitos, CampoRequisito.SEM_NOTA_VERMELHA, false) as boolean,
    });
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Regras: {modalidade}</h1>
        <p className="text-muted-foreground mt-2">
          Defina os requisitos mínimos para a progressão entre cada patente nesta modalidade.
        </p>
      </div>

      <RegrasPromocaoForm 
        pares={paresPossiveis} 
        modalidade={modalidade} 
      />
    </div>
  );
}