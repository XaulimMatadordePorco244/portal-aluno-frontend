import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { enviarNotificacaoPush } from '@/actions/push-actions';

export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { titulo, descricao, tipo, prazoEntrega, tipoEnvio, alunosIds } = body;

        let destinatariosIds: string[] = [];

        if (tipoEnvio === 'TODOS') {
            const todosAlunos = await prisma.usuario.findMany({
                where: { role: 'ALUNO', status: 'ATIVO' },
                select: { id: true }
            });
            destinatariosIds = todosAlunos.map(a => a.id);
        } else {
            destinatariosIds = alunosIds;
        }

        if (destinatariosIds.length === 0) {
            return NextResponse.json({ error: 'Nenhum destinatário encontrado.' }, { status: 400 });
        }

        const novaAtividade = await prisma.$transaction(async (tx) => {
            const atividade = await tx.atividade.create({
                data: {
                    titulo,
                    descricao,
                    tipo,
                    prazoEntrega: prazoEntrega ? new Date(prazoEntrega) : null,
                    criadoPorId: user.userId,
                }
            });

            const vinculos = destinatariosIds.map(id => ({
                atividadeId: atividade.id,
                alunoId: id,
                status: 'PENDENTE' as const,
            }));

            await tx.atividadeAluno.createMany({
                data: vinculos
            });

            return atividade;
        });


        try {
            const notificacoesSino = destinatariosIds.map(alunoId => ({
                usuarioId: alunoId,
                titulo: "Nova Atividade: " + titulo,
                mensagem: "Tem uma nova atividade pendente. Verifique os prazos!",
                tipo: "ATIVIDADE",
                lida: false,
                link: "/minhas-tarefas",
            }));

            await prisma.notificacao.createMany({
                data: notificacoesSino
            });
            const promessasDePush = destinatariosIds.map(alunoId =>
                enviarNotificacaoPush(alunoId, {
                    titulo: "📚 Nova Atividade Recebida!",
                    mensagem: `${titulo}. Clique para ver os detalhes e não perder o prazo.`,
                    url: "/minhas-tarefas",
                    tag: `atividade-${novaAtividade.id}`
                })
            );

            Promise.allSettled(promessasDePush);
        } catch (notifError) {
            console.error("Erro ao enviar push de atividades:", notifError);
        }

        return NextResponse.json({ success: true, atividade: novaAtividade }, { status: 201 });

    } catch (error) {
        console.error("Erro na rota /api/atividades:", error);
        return NextResponse.json({ error: 'Erro interno ao criar atividade.' }, { status: 500 });
    }
}