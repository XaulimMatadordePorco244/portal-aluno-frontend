import { Metadata } from 'next'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'

export const metadata: Metadata = { title: 'Sessões e Funções' }

export default async function AlunoOrganizacaoPage() {
    const sessoes = await prisma.gmSessao.findMany({ orderBy: { ordem: 'asc' } })

    return (
        <div >

            <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <div>
                        <h2 className="text-4xl font-bold tracking-tight">Sessões</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sessoes.map((s) => (
                        <Card key={s.id} className="flex flex-col border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-200">
                            <CardHeader className="pb-2 pt-5 px-5 flex flex-row justify-between items-start space-y-0">
                                <span className="font-black text-3xl text-slate-800 dark:text-slate-100">{s.codigo}</span>
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
                                    SESSÃO
                                </Badge>
                            </CardHeader>

                            <CardContent className="px-5 pb-5 flex flex-col flex-1">
                                <div className="mb-3">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                                        Responsáveis
                                    </span>
                                    <div className="flex flex-col gap-1">
                                        {s.responsaveis.split(' - ').map((resp, idx) => (
                                            <div key={idx} className="font-semibold text-sm text-primary flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                                {resp}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="mt-auto mb-3 opacity-50" />

                                <div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                                        Atribuições
                                    </span>
                                    <p className="text-xs text-muted-foreground leading-relaxed uppercase font-medium">
                                        {s.atribuicoes}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

        </div>
    )
}