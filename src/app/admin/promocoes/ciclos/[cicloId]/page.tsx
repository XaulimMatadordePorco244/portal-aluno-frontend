import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import QuadroAcessoClient, { CicloListagem } from './AlunosAptosClient';

export default async function CicloDetalhesPage({ 
    params 
}: { 
    params: Promise<{ cicloId: string }> 
}) {
    const { cicloId } = await params;

    const ciclo = await prisma.cicloPromocao.findUnique({
        where: { id: cicloId }, 
        include: {
            candidatos: {
                include: {
                    aluno: {
                        select: {
                            id: true,
                            cargoId: true,
                            cargo: { select: { id: true, nome: true, abreviacao: true, precedencia: true } },
                            usuario: { select: { id: true, nome: true, nomeDeGuerra: true } }
                        }
                    }
                }
            }
        }
    });

    if (!ciclo) return notFound();

    const cargos = await prisma.cargo.findMany({
        where: { tipo: { not: 'CURSO' } },
        orderBy: { precedencia: 'asc' },
        select: { id: true, nome: true, abreviacao: true, precedencia: true }
    });

    const cicloFormatado: CicloListagem = {
        id: ciclo.id,
        nome: ciclo.nome,
        status: ciclo.status,
        candidatos: ciclo.candidatos.map(c => ({
            id: c.id,
            alunoId: c.alunoId,
            modalidade: c.modalidade,
            resultado: c.resultado,
            conceitoSnapshot: c.conceitoSnapshot,
            mediaEscolarSnapshot: c.mediaEscolarSnapshot,
            tafSnapshot: c.tafSnapshot,
            motivoReprovacao: c.motivoReprovacao,
            aluno: {
                id: c.aluno.id,
                cargoId: c.aluno.cargoId,
                cargo: c.aluno.cargo ? {
                    id: c.aluno.cargo.id,
                    nome: c.aluno.cargo.nome,
                    abreviacao: c.aluno.cargo.abreviacao,
                    precedencia: c.aluno.cargo.precedencia
                } : null,
                usuario: {
                    id: c.aluno.usuario.id,
                    nome: c.aluno.usuario.nome,
                    nomeDeGuerra: c.aluno.usuario.nomeDeGuerra
                }
            }
        }))
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Alunos Aptos</h1>
                <p className="text-slate-500 mt-1">
                    Ciclo: <span className="font-semibold">{ciclo.nome || 'Promoções'}</span> 
                    {ciclo.status === 'FECHADO' && <span className="ml-3 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">ENCERRADO</span>}
                </p>
            </div>

            <QuadroAcessoClient ciclo={cicloFormatado} cargos={cargos} />
        </div>
    );
}