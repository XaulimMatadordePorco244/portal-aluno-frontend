'use server'

import prisma from '@/lib/prisma';
import { getCurrentUserWithRelations } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { criarNotificacao } from '@/actions/notificacoes';


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
            where: { tipo: { not: 'CURSO' } },
            orderBy: { precedencia: 'asc' }
        });

        const alunos = await prisma.perfilAluno.findMany({
            where: { id: { in: data.alunoIds } },
            include: { cargo: true, usuario: true }
        });

        const operations = [];
        const notificacoesPendentes = []; 

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
                data: { status: 'FECHADO', dataFim: new Date() }
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

            let tituloNotif = "Atualização de Patente";
            let msgNotif = `A sua patente foi atualizada para ${novoCargoObj?.nome}.`;
            
            if (data.tipo === 'DESPROMOCAO') {
                tituloNotif = "Reclassificação de Patente";
                msgNotif = `Foi reclassificado(a) para a patente de ${novoCargoObj?.nome}. Motivo: ${data.motivo}. O seu conceito foi reiniciado.`;
            } else if (data.tipo === 'PROMOCAO' || data.tipo === 'BRAVURA') {
                tituloNotif = "Parabéns, foi promovido! ";
                msgNotif = `Alcançou a patente de ${novoCargoObj?.nome}. O seu conceito foi redefinido para 7.0 conforme o Regulamento.`;
            }

            notificacoesPendentes.push({
                usuarioId: aluno.usuario.id,
                titulo: tituloNotif,
                mensagem: msgNotif
            });
        }

        await prisma.$transaction(operations);

        for (const notif of notificacoesPendentes) {
            await criarNotificacao(notif.usuarioId, notif.titulo, notif.mensagem, '/perfil/carreira');
        }

        revalidatePath('/admin/alunos');
        revalidatePath('/admin/promocoes');
        revalidatePath('/admin/antiguidade');

        return { success: true, message: `${alunos.length} alunos processados com sucesso.` };

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Erro ao processar transição.';
        return { success: false, message: errorMessage };
    }
}


export async function gerarQuadroDeAcesso(cicloId: string) {
    const admin = await getCurrentUserWithRelations();
    if (!admin) return { success: false, message: 'Não autorizado' };

    try {
        const ciclo = await prisma.cicloPromocao.findUnique({
            where: { id: cicloId },
        });

        if (!ciclo) throw new Error("Ciclo não encontrado.");

        await prisma.candidatoCiclo.deleteMany({
            where: { cicloId }
        });

        const alunos = await prisma.perfilAluno.findMany({
            where: { 
                usuario: { status: "ATIVO" },
                cargoId: { not: null } 
            },
            include: {
                usuario: true,
                cargo: true,
                tafs: { orderBy: { dataRealizacao: "desc" }, take: 1 },
                desempenhosEscolares: { orderBy: { anoLetivo: "desc" }, take: 1 },
            },
        });

        const operations = [];

        for (const aluno of alunos) {
            const conceito = parseFloat(aluno.conceitoAtual || "7.0");
            const notaEscolar = aluno.desempenhosEscolares[0]?.mediaFinal || 0;
            const notaTaf = aluno.tafs[0]?.mediaFinal || 0;

            if (conceito >= 8.0 || notaEscolar >= 6.0) {
                operations.push(prisma.candidatoCiclo.create({
                    data: {
                        cicloId: cicloId,
                        alunoId: aluno.id,
                        mediaEscolarSnapshot: notaEscolar,
                        conceitoSnapshot: conceito,
                        tafSnapshot: notaTaf,
                        comportamentoSnapshot: aluno.conceitoAtual,
                        resultado: 'PENDENTE'
                    }
                }));
            }
        }

        await prisma.$transaction(operations);

        revalidatePath(`/admin/promocoes/${cicloId}`);
        return { success: true, message: "Quadro de acesso gerado e atualizado com sucesso!" };

    } catch (error) {
        console.error("[GERAR_QUADRO_ACESSO]", error);
        return { success: false, message: "Erro ao gerar o quadro de acesso." };
    }
}



export async function efetivarPromocoesDoCiclo(candidatosAprovados: { alunoId: string, novoCargoId: string, modalidade: string }[], cicloId: string) {
    const admin = await getCurrentUserWithRelations();
    if (!admin) return { success: false, message: 'Não autorizado' };

    try {
        await prisma.$transaction(async (tx) => {
            for (const candidato of candidatosAprovados) {
                
                const perfilAtualizado = await tx.perfilAluno.update({
                    where: { id: candidato.alunoId },
                    data: {
                        cargoId: candidato.novoCargoId,
                        dataUltimaPromocao: new Date(),
                        modalidadeUltimaPromocao: candidato.modalidade,
                        conceitoAtual: "7.0", 
                    },
                    include: {
                        usuario: true,
                        cargo: true, 
                    }
                });

                await tx.cargoHistory.updateMany({
                    where: { alunoId: candidato.alunoId, status: 'ATIVO' },
                    data: { status: 'FECHADO', dataFim: new Date() }
                });

                await tx.cargoHistory.create({
                    data: {
                        alunoId: candidato.alunoId,
                        cargoId: candidato.novoCargoId,
                        cargoNomeSnapshot: perfilAtualizado.cargo?.nome || 'Desconhecido',
                        conceitoInicial: 7.0,
                        conceitoAtual: 7.0,
                        dataInicio: new Date(),
                        tipoPromocao: "AUTOMATICA",
                        status: 'ATIVO',
                        motivo: `Promovido no ciclo ${cicloId} via ${candidato.modalidade}`,
                    }
                });

                await tx.candidatoCiclo.update({
                    where: { cicloId_alunoId: { cicloId, alunoId: candidato.alunoId } },
                    data: { resultado: 'APROVADO' }
                });

                const titulo = "Parabéns, foi promovido! ";
                const mensagem = `A sua dedicação rendeu frutos. Acaba de ser promovido ao posto de ${perfilAtualizado.cargo?.nome} (Modalidade: ${candidato.modalidade}). O seu conceito foi redefinido para 7.0 conforme o RPGM.`;
                
                await criarNotificacao(perfilAtualizado.usuario.id, titulo, mensagem, "/perfil/carreira");
            }

            await tx.cicloPromocao.update({
                where: { id: cicloId },
                data: { status: 'FECHADO' } 
            });
        });

        revalidatePath("/admin/promocoes");
        return { success: true, message: "Promoções do Ciclo efetivadas com sucesso!" };

    } catch (error) {
        console.error("[EFETIVAR_PROMOCOES]", error);
        return { success: false, message: "Erro ao efetivar as promoções do ciclo." };
    }
}

export async function criarCicloPromocao(nome: string) {
    const admin = await getCurrentUserWithRelations();
    if (!admin) return { success: false, message: 'Não autorizado' };

    try {
        const novoCiclo = await prisma.cicloPromocao.create({
            data: {
                nome,
                status: 'ABERTO',
                dataReferencia: new Date(), 
            }
        });
        
        revalidatePath('/admin/promocoes');
        return { success: true, cicloId: novoCiclo.id };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao criar o ciclo de promoção.' };
    }
}

export async function apagarCicloPromocao(cicloId: string) {
    const admin = await getCurrentUserWithRelations();
    if (!admin) return { success: false, message: 'Não autorizado' };

    try {
        await prisma.candidatoCiclo.deleteMany({
            where: { cicloId }
        });

        await prisma.cicloPromocao.delete({
            where: { id: cicloId }
        });

        revalidatePath('/admin/promocoes');
        return { success: true, message: 'Ciclo apagado com sucesso.' };
    } catch (error) {
        console.error("[APAGAR_CICLO]", error);
        return { 
            success: false, 
            message: 'Erro ao apagar o ciclo. Se este ciclo já efetivou promoções no histórico, não pode ser apagado.' 
        };
    }
}

export async function encerrarCicloPromocao(cicloId: string) {
    const admin = await getCurrentUserWithRelations();
    if (!admin) return { success: false, message: 'Não autorizado' };

    try {
        await prisma.cicloPromocao.update({
            where: { id: cicloId },
            data: { status: 'FECHADO' } 
        });

        revalidatePath('/admin/promocoes');
        revalidatePath(`/admin/promocoes/${cicloId}`);
        return { success: true, message: 'Ciclo encerrado com sucesso.' };
    } catch (error) {
        console.error("[ENCERRAR_CICLO]", error);
        return { success: false, message: 'Erro ao encerrar o ciclo.' };
    }
}

function getCategoriaVaga(nomeCargo: string) {
    const nome = nomeCargo.toUpperCase();
    
    // Oficiais
    if (nome.includes('CORONEL') || nome.includes('MAJOR')) return 'superiores';
    if (nome.includes('CAPITÃO') || nome.includes('CAPITAO')) return 'intermediarios';
    if (nome.includes('TENENTE') && !nome.includes('SUBTENENTE')) return 'subalternos';
    
    // Praças
    if (nome.includes('SUBTENENTE') || nome.includes('ASPIRANTE')) return 'subtenentes';
    if (nome.includes('SARGENTO')) return 'sargentos';
    if (nome.includes('CABO')) return 'cabos';
    if (nome.includes('SOLDADO')) return 'soldados';
    
    return null;
}

export async function calcularVagasDisponiveis() {
    const limites = await prisma.quadroVagasAntiguidade.findUnique({
        where: { id: "singleton" }
    });

    if (!limites) {
        throw new Error("Quadro de Vagas não foi configurado no sistema.");
    }

    const alunosAtivos = await prisma.perfilAluno.findMany({
        where: { 
            usuario: { status: 'ATIVO' }, 
            cargoId: { not: null } 
        },
        include: { cargo: true }
    });

    const ocupadas = { superiores: 0, intermediarios: 0, subalternos: 0, subtenentes: 0, sargentos: 0, cabos: 0, soldados: 0 };

    alunosAtivos.forEach(aluno => {
        if (aluno.cargo) {
            const categoria = getCategoriaVaga(aluno.cargo.nome);
            if (categoria) {
                ocupadas[categoria]++;
            }
        }
    });

    return {
        superiores: Math.max(0, limites.superiores - ocupadas.superiores),
        intermediarios: Math.max(0, limites.intermediarios - ocupadas.intermediarios),
        subalternos: Math.max(0, limites.subalternos - ocupadas.subalternos),
        subtenentes: Math.max(0, limites.subtenentes - ocupadas.subtenentes),
        sargentos: Math.max(0, limites.sargentos - ocupadas.sargentos),
        cabos: Math.max(0, limites.cabos - ocupadas.cabos),
        soldados: Math.max(0, limites.soldados - ocupadas.soldados),
        
        _debug: { limites, ocupadas } 
    };
}