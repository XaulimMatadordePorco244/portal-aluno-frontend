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

  const cargos = await prisma.cargo.findMany({
    orderBy: { precedencia: 'asc' },
    select: { id: true, nome: true, abreviacao: true, tipo: true, precedencia: true }
  });

  const regrasSalvas = await prisma.regraPromocao.findMany({
    where: { modalidade },
    include: { requisitos: true }
  });

  const paresPossiveis = [];

  for (let i = 0; i < cargos.length - 1; i++) {
    const origem = cargos[i];
    const destino = cargos.find(c => c.precedencia > origem.precedencia && c.tipo === origem.tipo);

    if (!destino) continue;

    const regraBanco = regrasSalvas.find(
      r => r.cargoOrigemId === origem.id && r.cargoDestinoId === destino.id
    );

    const requisitos = regraBanco?.requisitos || [];

    paresPossiveis.push({
      cargoOrigem: origem,
      cargoDestino: destino,
      minMediaEscolar: getValor(requisitos, CampoRequisito.MEDIA_ESCOLAR, 0),
      minConceito: getValor(requisitos, CampoRequisito.CONCEITO, 0),
      minTaf: getValor(requisitos, CampoRequisito.TAF, 0),
      mesesIntersticio: getValor(requisitos, CampoRequisito.INTERSTICIO_MESES, 0),
      exigeProvaTeorica: getValor(requisitos, CampoRequisito.NOTA_PROVA_TEORICA, -1) !== -1,
      minNotaProvaTeorica: getValor(requisitos, CampoRequisito.NOTA_PROVA_TEORICA, 0),
      exigeSemNotaVermelha: getValor(requisitos, CampoRequisito.SEM_NOTA_VERMELHA, false),
    });
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Regras: {modalidade}</h1>
      </div>

      <RegrasPromocaoForm 
        pares={paresPossiveis} 
        modalidade={modalidade} 
      />
    </div>
  );
}