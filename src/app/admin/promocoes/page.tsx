import prisma from '@/lib/prisma';
import CiclosListClient from './CiclosListClient';

export default async function GestaoPromocoesPage() {
    const ciclos = await prisma.cicloPromocao.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            _count: {
                select: { candidatos: true } 
            }
        }
    });

    return (
        <div >
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Ciclos de Promoção</h1>
                    <p className="text-slate-500 mt-1">
                        Faça a gestão dos quadros de acesso baseados no RPGM.
                    </p>
                </div>
            </div>

            <CiclosListClient ciclosIniciais={ciclos} />
        </div>
    );
}