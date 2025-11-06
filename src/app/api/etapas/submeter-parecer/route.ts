import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    const etapaId = params.id;

    if (!user?.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { conteudo, decisao } = await req.json();
    if (!conteudo || !decisao) {
        return NextResponse.json({ error: 'O parecer e a decisão são obrigatórios.' }, { status: 400 });
    }

    const etapa = await prisma.etapaProcesso.findUnique({ where: { id: etapaId } });

 
    if (!etapa || etapa.responsavelId !== user.userId || etapa.status !== 'Pendente') {
        return NextResponse.json({ error: 'Você não tem permissão para submeter um parecer para esta etapa ou ela não está pendente.' }, { status: 403 });
    }
    
  
    const etapaConcluida = await prisma.etapaProcesso.update({
        where: { id: etapaId },
        data: {
            conteudo,
            decisao,
            status: "Concluído",
            dataConclusao: new Date(),
        }
    });

 
    await prisma.etapaProcesso.updateMany({
        where: {
            processoId: etapa.processoId,
            status: "Aguardando Etapa Anterior"
        },
        data: {
            status: "Pendente"
        }
    });

    return NextResponse.json(etapaConcluida);

  } catch (error) {
    console.error("Erro ao submeter parecer:", error);
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}