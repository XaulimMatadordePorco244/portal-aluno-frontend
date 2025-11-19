import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: parteId } = await params;

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const parte = await prisma.parte.findUnique({
      where: { id: parteId },
      include: { etapas: true }
    });

    if (!parte || parte.status !== 'ENVIADA' || parte.etapas.length > 0) {
      return NextResponse.json({ error: 'Este processo não pode ser iniciado ou já foi iniciado.' }, { status: 400 });
    }

    const oficiais = await prisma.usuario.findMany({
      where: {
        perfilAluno: {
          cargo: {
            tipo: 'POSTO',
          },
        },
      },
      include: {
        perfilAluno: true 
      }
    });

    if (oficiais.length === 0) {
      return NextResponse.json({ error: 'Nenhum oficial elegível encontrado para o sorteio.' }, { status: 404 });
    }

    const oficialSorteado = oficiais[Math.floor(Math.random() * oficiais.length)];

    await prisma.$transaction(async (tx) => {
      await tx.etapaProcesso.create({
        data: {
          processoId: parteId,
          titulo: "Parecer do Oficial Investigador",
          status: "PENDENTE",
          responsavelId: oficialSorteado.id,
        }
      });
      await tx.etapaProcesso.create({
        data: {
          processoId: parteId,
          titulo: "Parecer da Coordenação",
          status: "EM_ANALISE",
        }
      });
    });

    
    const nomeExibicao = oficialSorteado.perfilAluno?.nomeDeGuerra || oficialSorteado.nome;

    return NextResponse.json({ message: `Processo iniciado. Oficial ${nomeExibicao} foi designado.` });

  } catch (error) {
    console.error("Erro ao iniciar apuração:", error);
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}