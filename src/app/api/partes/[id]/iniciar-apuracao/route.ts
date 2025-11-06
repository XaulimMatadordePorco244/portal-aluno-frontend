import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';


export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    const parteId = params.id;

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

    const oficiais = await prisma.user.findMany({
      where: {
        cargo: {
          tipo: 'POSTO',
        },
      },
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
                status: "Pendente",
                responsavelId: oficialSorteado.id,
            }
        });
        await tx.etapaProcesso.create({
            data: {
                processoId: parteId,
                titulo: "Parecer da Coordenação",
                status: "Aguardando Etapa Anterior",
            }
        });
    });

    return NextResponse.json({ message: `Processo iniciado. Oficial ${oficialSorteado.nomeDeGuerra} foi designado.` });

  } catch (error) {
    console.error("Erro ao iniciar apuração:", error);
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}