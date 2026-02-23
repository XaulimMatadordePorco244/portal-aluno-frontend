'use server'

import prisma from '@/lib/prisma';
import { getCurrentUserWithRelations } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export type TipoTransicao = 'PROMOCAO' | 'DESPROMOCAO' | 'CURSO' | 'BRAVURA' | 'CORRECAO';

interface TransicaoInput {
    alunoIds: string[];
    tipo: TipoTransicao;
    cargoDestinoId?: string; 
    motivo: string;
    modalidadePromocao?: string;
}

export async function processarTransicaoEmMassa(data: TransicaoInput) {
    const admin = await getCurrentUserWithRelations();

    if (!admin) {
        return { success: false, message: 'Não autorizado' };
    }

    try {
        const todosCargos = await prisma.cargo.findMany({
            where: {
                tipo: { not: 'CURSO' }
            },
            orderBy: { precedencia: 'asc' }
        });

        const alunos = await prisma.perfilAluno.findMany({
            where: { id: { in: data.alunoIds } },
            include: { cargo: true, usuario: true }
        });

        const operations = [];

        for (const aluno of alunos) {
            let novoCargoId = null;
            const conceitoNovo = 7.0;

            if (data.tipo === 'CURSO' || data.tipo === 'BRAVURA' || data.tipo === 'CORRECAO') {
                if (!data.cargoDestinoId) throw new Error(`Cargo de destino obrigatório para ${data.tipo}`);
                novoCargoId = data.cargoDestinoId;

            } else if (data.tipo === 'PROMOCAO') {
                if (!aluno.cargo) throw new Error(`Aluno ${aluno.usuario.nome} não tem cargo inicial para ser promovido.`);

                const currentIndex = todosCargos.findIndex(c => c.id === aluno.cargoId);
                const targetIndex = currentIndex - 1;

                if (targetIndex < 0) throw new Error(`Aluno ${aluno.usuario.nome} já está no topo!`);
                novoCargoId = todosCargos[targetIndex].id;

            } else if (data.tipo === 'DESPROMOCAO') {
                if (!aluno.cargo) throw new Error(`Aluno ${aluno.usuario.nome} não tem cargo para ser despromovido.`);

                const currentIndex = todosCargos.findIndex(c => c.id === aluno.cargoId);
                const targetIndex = currentIndex + 1;

                if (targetIndex >= todosCargos.length) throw new Error(`Aluno ${aluno.usuario.nome} já está no cargo mais baixo!`);
                novoCargoId = todosCargos[targetIndex].id;
            }

            const novoCargoObj = todosCargos.find(c => c.id === novoCargoId);

            operations.push(prisma.cargoHistory.updateMany({
                where: { alunoId: aluno.id, status: 'ATIVO' },
                data: {
                    status: 'FECHADO',
                    dataFim: new Date()
                }
            }));

            operations.push(prisma.cargoHistory.create({
                data: {
                    alunoId: aluno.id,
                    cargoId: novoCargoId!,
                    cargoNomeSnapshot: novoCargoObj?.nome || 'Desconhecido',
                    conceitoInicial: conceitoNovo,
                    conceitoAtual: conceitoNovo,
                    dataInicio: new Date(),
                    status: 'ATIVO',
                    motivo: data.motivo,
                    logs: {
                        create: {
                            adminId: admin.id,
                            tipo: data.tipo === 'PROMOCAO' ? 'PROMOCAO' : data.tipo === 'DESPROMOCAO' ? 'DESPROMOCAO' : 'REVERSAO',
                            motivo: `Transição em massa: ${data.tipo}. ${data.motivo}`
                        }
                    }
                }
            }));

            operations.push(prisma.perfilAluno.update({
                where: { id: aluno.id },
                data: {
                    cargoId: novoCargoId,
                    conceitoAtual: String(conceitoNovo),
                    foraDeData: false,
                    ...(data.tipo === 'PROMOCAO' && {
                        dataUltimaPromocao: new Date(),
                        modalidadeUltimaPromocao: data.modalidadePromocao || 'ANTIGUIDADE',
                    })
                }
            }));
        }

        await prisma.$transaction(operations);

        revalidatePath('/admin/alunos');
        revalidatePath('/admin/promocoes');
        revalidatePath('/admin/efetivo/antiguidade');

        return { success: true, message: `${alunos.length} alunos processados com sucesso.` };

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Erro ao processar transição.';
        return { success: false, message: errorMessage };
    }
}