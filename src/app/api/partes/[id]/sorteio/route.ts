import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(); // Quem está sorteando (Comandante ou Coordenação)
    const { id } = await params;
    const { oficiaisSelecionadosIds } = await req.json(); // IDs filtrados pelo frontend ou lógica prévia

    // Verifica permissões (Comandante Geral ou Admin)
    // ... lógica de permissão aqui ...

    if (!oficiaisSelecionadosIds || oficiaisSelecionadosIds.length === 0) {
       return NextResponse.json({ error: 'Nenhum oficial selecionado para sorteio.' }, { status: 400 });
    }

    // 1. Realiza o Sorteio
    const oficialSorteadoId = oficiaisSelecionadosIds[Math.floor(Math.random() * oficiaisSelecionadosIds.length)];

    await prisma.$transaction(async (tx) => {
      // 2. Calcula prazo (10 dias corridos)
      const prazo = new Date();
      prazo.setDate(prazo.getDate() + 10);

      // 3. Cria o processo de bravura vinculado
      await tx.processoBravura.create({
        data: {
            parteId: id,
            oficialId: oficialSorteadoId,
            prazoInvestigacao: prazo
        }
      });

      // 4. Atualiza a Parte (Status e Responsável)
      await tx.parte.update({
        where: { id },
        data: {
            status: 'EM_INVESTIGACAO',
            responsavelAtualId: oficialSorteadoId // Agora aparece no painel do Oficial
        }
      });

      // 5. Cria Notificação para o Oficial (Exemplo conceitual)
      /* await tx.notificacao.create({
         data: {
           usuarioId: oficialSorteadoId,
           mensagem: `Você foi sorteado para investigar o Ato de Bravura DOC-...`
         }
      }) */
    });

    return NextResponse.json({ message: 'Oficial sorteado e processo iniciado.' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro no sorteio.' }, { status: 500 });
  }
}