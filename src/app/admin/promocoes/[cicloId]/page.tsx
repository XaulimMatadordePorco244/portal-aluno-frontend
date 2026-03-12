import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import QuadroAcessoClient from './AlunosAptosClient';
import { calcularVagasDisponiveis } from '@/app/actions/transicoes'; 

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
                        include: {
                            usuario: true,
                            cargo: true,
                            desempenhosEscolares: { orderBy: { anoLetivo: 'desc' }, take: 1 }
                        }
                    }
                }
            }
        }
    });

    if (!ciclo) return notFound();

    const cargos = await prisma.cargo.findMany({
        where: { tipo: { not: 'CURSO' } },
        orderBy: { precedencia: 'asc' }
    });

    const vagas = await calcularVagasDisponiveis();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Alunos Aptos</h1>
                <p className="text-slate-500 mt-1">
                    Ciclo: <span className="font-semibold">{ciclo.nome || 'Promoções'}</span> 
                    {ciclo.status === 'FECHADO' && <span className="ml-3 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">ENCERRADO</span>}
                </p>
            </div>

            <QuadroAcessoClient ciclo={ciclo} cargos={cargos} vagas={vagas} />
        </div>
    );
}