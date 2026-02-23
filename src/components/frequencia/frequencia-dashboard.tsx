'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle2, Clock, CalendarDays, XCircle, Info, ListFilter, X } from 'lucide-react'
import { isSameDay, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ItemCalendario {
    tipoOrigem: 'FREQUENCIA' | 'INSTITUCIONAL'
    id: string
    data: Date
    status?: 'PRESENTE' | 'FALTA' | 'JUSTIFICADA'
    tipoAula?: string
    titulo?: string
    tipoEvento?: 'FERIADO' | 'AULA_EXTRA' | 'CANCELADO' | 'EVENTO'
    descricao?: string | null
    observacao?: string | null
}

interface DashboardProps {
    itens: ItemCalendario[]
}

type TipoFiltro = 'PRESENTE' | 'FALTA' | 'JUSTIFICADA' | null

export function FrequenciaDashboard({ itens }: DashboardProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [filtroAtivo, setFiltroAtivo] = useState<TipoFiltro>(null)

    const frequencias = itens.filter(i => i.tipoOrigem === 'FREQUENCIA')
    const totalAulas = frequencias.length
    const presentes = frequencias.filter(f => f.status === 'PRESENTE').length
    const faltas = frequencias.filter(f => f.status === 'FALTA').length
    const justificadas = frequencias.filter(f => f.status === 'JUSTIFICADA').length

    const aproveitamento = totalAulas > 0
        ? Math.round(((presentes + justificadas) / totalAulas) * 100)
        : 100

    const diasPresentes = frequencias.filter(f => f.status === 'PRESENTE').map(f => f.data)
    const diasFaltas = frequencias.filter(f => f.status === 'FALTA').map(f => f.data)
    const diasJustificadas = frequencias.filter(f => f.status === 'JUSTIFICADA').map(f => f.data)

    const eventosInst = itens.filter(i => i.tipoOrigem === 'INSTITUCIONAL')
    const diasFeriado = eventosInst.filter(e => e.tipoEvento === 'FERIADO' || e.tipoEvento === 'CANCELADO').map(e => e.data)
    const diasEvento = eventosInst.filter(e => e.tipoEvento === 'EVENTO' || e.tipoEvento === 'AULA_EXTRA').map(e => e.data)

    const handleDateSelect = (newDate: Date | undefined) => {
        setDate(newDate)
        setFiltroAtivo(null) 
    }

    const handleFilterSelect = (tipo: TipoFiltro) => {
        if (filtroAtivo === tipo) {
            setFiltroAtivo(null) 
        } else {
            setFiltroAtivo(tipo)
        }
    }

    const itensDoDia = date
        ? itens.filter(i => isSameDay(i.data, date))
        : []

    const listaFiltrada = filtroAtivo
        ? frequencias.filter(f => f.status === filtroAtivo).sort((a, b) => b.data.getTime() - a.data.getTime())
        : []

    const getCardHeaderColor = () => {
        switch (filtroAtivo) {
            case 'FALTA': return 'border-t-red-500 bg-red-50/50 dark:bg-red-950/20'
            case 'JUSTIFICADA': return 'border-t-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
            case 'PRESENTE': return 'border-t-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
            default: return 'border-t-blue-500 bg-muted/10'
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            <div className="lg:col-span-4 space-y-6">

                <Card className="border-l-4 border-l-emerald-600 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <CheckCircle2 className="w-24 h-24" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription>Sua Assiduidade</CardDescription>
                        <CardTitle className="text-4xl font-bold flex items-baseline gap-2 text-emerald-700 dark:text-emerald-400">
                            {aproveitamento}%
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={aproveitamento} className="h-2 mb-6 bg-emerald-100 [&>div]:bg-emerald-600" />
                        
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <button 
                                onClick={() => handleFilterSelect('PRESENTE')}
                                className={`flex flex-col items-center p-2 rounded-lg transition-all hover:bg-muted ${filtroAtivo === 'PRESENTE' ? 'bg-emerald-100 ring-2 ring-emerald-500 dark:bg-emerald-900/40' : ''}`}
                            >
                                <span className="font-bold text-2xl text-emerald-600">{presentes}</span>
                                <span className="text-xs text-muted-foreground font-medium">Presentes</span>
                            </button>

                            <button 
                                onClick={() => handleFilterSelect('FALTA')}
                                className={`flex flex-col items-center p-2 rounded-lg transition-all hover:bg-muted ${filtroAtivo === 'FALTA' ? 'bg-red-100 ring-2 ring-red-500 dark:bg-red-900/40' : ''}`}
                            >
                                <span className="font-bold text-2xl text-red-600">{faltas}</span>
                                <span className="text-xs text-muted-foreground font-medium">Faltas</span>
                            </button>

                            <button 
                                onClick={() => handleFilterSelect('JUSTIFICADA')}
                                className={`flex flex-col items-center p-2 rounded-lg transition-all hover:bg-muted ${filtroAtivo === 'JUSTIFICADA' ? 'bg-amber-100 ring-2 ring-amber-500 dark:bg-amber-900/40' : ''}`}
                            >
                                <span className="font-bold text-2xl text-amber-600">{justificadas}</span>
                                <span className="text-xs text-muted-foreground font-medium">Justif.</span>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`h-fit border-t-4 transition-colors duration-300 ${getCardHeaderColor()}`}>
                    <CardHeader className="pb-4 border-b flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                            {filtroAtivo ? (
                                <>
                                    <ListFilter className="w-5 h-5" />
                                    <span>
                                        {filtroAtivo === 'PRESENTE' && 'Histórico de Presenças'}
                                        {filtroAtivo === 'FALTA' && 'Relatório de Faltas'}
                                        {filtroAtivo === 'JUSTIFICADA' && 'Justificativas'}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Clock className="w-5 h-5" />
                                    <span>{date ? format(date, "d 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}</span>
                                </>
                            )}
                        </CardTitle>
                        {filtroAtivo && (
                            <Button variant="ghost" size="icon" onClick={() => setFiltroAtivo(null)} className="h-8 w-8">
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </CardHeader>
                    
                    <CardContent className="pt-0 min-h-[300px] p-0">
                        <ScrollArea className="h-[300px] p-6 w-full">
                            {filtroAtivo ? (
                                <div className="space-y-4">
                                    {listaFiltrada.length > 0 ? (
                                        listaFiltrada.map((item) => (
                                            <div key={item.id} className="flex flex-col gap-1 pb-3 border-b last:border-0 animate-in fade-in slide-in-from-right-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-sm">
                                                        {format(item.data, "dd/MM/yyyy")}
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {item.tipoAula?.replace('INST_', '') || 'Geral'}
                                                    </Badge>
                                                </div>
                                                
                                                {(item.observacao) ? (
                                                    <p className="text-sm text-foreground bg-muted/50 p-2 rounded-md mt-1">
                                                        <span className="font-semibold text-xs text-muted-foreground block mb-0.5">Motivo/Obs:</span>
                                                        {item.observacao}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground italic mt-1">
                                                        {item.status === 'FALTA' ? 'Sem justificativa registrada.' : 'Sem observações.'}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
                                            <CheckCircle2 className="w-10 h-10 mb-2 opacity-20" />
                                            <p>Nenhum registro encontrado.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {itensDoDia.length > 0 ? (
                                        <div className="space-y-4">
                                            {itensDoDia.map((item) => (
                                                <div key={item.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2">
                                                    <div className="mt-1">
                                                        {item.tipoOrigem === 'FREQUENCIA' && item.status === 'PRESENTE' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                                        {item.tipoOrigem === 'FREQUENCIA' && item.status === 'FALTA' && <XCircle className="w-5 h-5 text-red-500" />}
                                                        {item.tipoOrigem === 'FREQUENCIA' && item.status === 'JUSTIFICADA' && <AlertCircle className="w-5 h-5 text-amber-500" />}
                                                        {item.tipoOrigem === 'INSTITUCIONAL' && <Info className="w-5 h-5 text-blue-500" />}
                                                    </div>

                                                    <div className="flex-1">
                                                        {item.tipoOrigem === 'FREQUENCIA' ? (
                                                            <>
                                                                <h4 className="font-semibold text-base">
                                                                    {item.status === 'PRESENTE' ? 'Presença Confirmada' : item.status === 'FALTA' ? 'Falta Registrada' : 'Falta Justificada'}
                                                                </h4>
                                                                <p className="text-sm text-muted-foreground mb-1">
                                                                    {item.tipoAula === 'GERAL' ? 'Instrução de Rotina' : item.tipoAula?.replace('INST_', 'Instrutor ')}
                                                                </p>
                                                                {item.observacao && (
                                                                     <p className="text-xs bg-muted p-1.5 rounded text-muted-foreground">
                                                                        {item.observacao}
                                                                     </p>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <h4 className="font-semibold text-base text-blue-700 dark:text-blue-400">{item.titulo}</h4>
                                                                <Badge variant="secondary" className="mt-1 mb-1 text-[10px]">{item.tipoEvento}</Badge>
                                                                {item.descricao && <p className="text-sm text-muted-foreground mt-1">{item.descricao}</p>}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-6 gap-2 mt-10">
                                            <CalendarDays className="w-8 h-8 opacity-20" />
                                            <p className="text-sm">Nada registrado nesta data.</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-8">
                <Card className="h-full flex flex-col shadow-md">
                    <CardHeader>
                        <CardTitle>Calendário de Atividades</CardTitle>
                        <CardDescription>
                            {filtroAtivo 
                                ? 'Modo de visualização de lista ativo. Clique em uma data para voltar.' 
                                : 'Visualize sua frequência e eventos da Guarda Mirim.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-2 sm:p-6 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            className="rounded-md border w-full max-w-full"
                            classNames={{
                                month: "space-y-4 w-full",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex w-full",
                                head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                                row: "flex w-full mt-2",
                                cell: "h-9 w-9 p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center rounded-md transition-all hover:bg-accent hover:text-accent-foreground",
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                day_today: "bg-accent text-accent-foreground font-bold border border-primary/50",
                            }}
                            modifiers={{
                                presente: diasPresentes,
                                falta: diasFaltas,
                                justificada: diasJustificadas,
                                feriado: diasFeriado,
                                evento: diasEvento
                            }}
                            modifiersClassNames={{
                                presente: 'bg-emerald-100 text-emerald-700 font-bold hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300',
                                falta: 'bg-red-100 text-red-700 font-bold hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300',
                                justificada: 'bg-amber-100 text-amber-700 font-bold hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300',
                                feriado: 'bg-slate-100 text-slate-500 font-medium line-through decoration-slate-400 dark:bg-slate-800 dark:text-slate-400',
                                evento: 'bg-blue-50 text-blue-600 font-bold border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                            }}
                        />
                    </CardContent>
                    <div className="p-4 border-t bg-muted/10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></div>
                             <span>Presente</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
                             <span>Falta</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></div>
                             <span>Justificada</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded bg-blue-50 border border-blue-300"></div>
                             <span>Evento GM</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded bg-slate-100 border border-slate-300 line-through decoration-slate-400 text-slate-400">abc</div>
                             <span>Feriado/Canc.</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}