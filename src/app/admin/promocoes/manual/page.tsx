import prisma from '@/lib/prisma';
import AcaoManualClient, { AlunoSimples } from './AcaoManualClient';


export default async function PromocaoManualPage() {
    const alunosBrutos = await prisma.perfilAluno.findMany({
        where: { 
            usuario: { status: 'ATIVO' },
            cargoId: { not: null } 
        },
        include: {
            usuario: { select: { nome: true, nomeDeGuerra: true } },
            cargo: { select: { id: true, nome: true, precedencia: true } }
        },
        orderBy: [
            { cargo: { precedencia: 'asc' } },
            { usuario: { nomeDeGuerra: 'asc' } }
        ]
    });

    const alunosAtivos: AlunoSimples[] = alunosBrutos.map(aluno => ({
        id: aluno.id,
        usuario: aluno.usuario,
        cargo: aluno.cargo! 
    }));

    return (
        <div className="space-y-3">
            
            <div>
                <h1 className="text-3xl font-bold text-foreground">Ação Manual</h1>
                <p className="text-slate-500 mt-1">
                    Promova ou despromova alunos por exceção (Bravura, Punição, Decisão Judicial, etc).
                </p>
            </div>

            <AcaoManualClient alunos={alunosAtivos} />
        </div>
    );
}