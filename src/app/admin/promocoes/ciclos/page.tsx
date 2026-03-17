import prisma from '@/lib/prisma';
import CiclosListClient from './CiclosListClient';

export default async function CiclosPromocaoPage() {
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
        <div className="space-y-6">

            
            <div>
                <h1 className="text-3xl font-bold text-foreground">Ciclos de Promoção</h1>
                <p className="text-slate-500 mt-1">
                    Faça a gestão dos quadros de acesso baseados no regulamento (RPGM).
                </p>
            </div>

            <CiclosListClient ciclosIniciais={ciclos} />
        </div>
    );
}