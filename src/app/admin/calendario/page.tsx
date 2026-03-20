import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { CalendarDays, Trash2 } from 'lucide-react'
import prisma from '@/lib/prisma'
import { criarEvento, deletarEvento } from './actions'
import { Calendar } from '@/components/ui/calendar'
import { eachDayOfInterval, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const metadata: Metadata = { title: 'Calendário Institucional' }

export default async function AdminCalendarioPage() {
  const eventos = await prisma.gmEventoCalendario.findMany({
    orderBy: { data: 'desc' }
  })

  const diasComEvento = eventos.flatMap(evt => {
    if (evt.dataFim) {
      return eachDayOfInterval({ start: evt.data, end: evt.dataFim })
    }
    return [evt.data]
  })

  return (
    <div className="mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarDays className="w-8 h-8 text-primary" />
          Calendário Institucional
        </h1>
        <p className="text-muted-foreground">
          Adicione feriados, recessos prolongados, eventos e avisos gerais.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <Card className="lg:col-span-1 h-fit shadow-sm">
          <CardHeader>
            <CardTitle>Novo Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={criarEvento} className="space-y-5">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input name="titulo" required placeholder="Ex: Férias Coletivas" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input name="data" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Fim (Opcional)</Label>
                  <Input name="dataFim" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Evento</Label>
                <Select name="tipo" required defaultValue="FERIADO">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AULA">Aula</SelectItem>
                    <SelectItem value="AULA_EXTRA">Aula Extra</SelectItem>
                    <SelectItem value="CANCELADO">Aula Cancelada</SelectItem>
                    <SelectItem value="FERIADO">Feriado / Recesso</SelectItem>
                    <SelectItem value="EVENTO">Evento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input name="descricao" placeholder="Detalhes adicionais..." />
              </div>

              <Button type="submit" className="w-full mt-2">
                Adicionar ao Calendário
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Visão Geral do Mês</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center p-6 bg-muted/10">
              <Calendar
                mode="multiple"
                className="rounded-lg border bg-card p-4 shadow-sm w-full max-w-lg"
                classNames={{
                  months: "w-full",
                  month: "space-y-4 w-full",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex w-full justify-between mb-2",
                  head_cell: "text-muted-foreground rounded-md w-full font-medium text-[0.8rem] capitalize",
                  row: "flex w-full w-full mt-2 justify-between",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 w-full",
                  day: "h-10 w-10 md:h-12 md:w-12 p-0 font-normal aria-selected:opacity-100 mx-auto flex items-center justify-center rounded-md hover:bg-muted transition-colors",
                }}
                modifiers={{
                  evento: diasComEvento
                }}
                modifiersStyles={{
                  evento: {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    fontWeight: 'bold',
                    borderRadius: '0.375rem'
                  }
                }}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Eventos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventos.map(evt => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-4 border rounded-lg shadow-sm hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">

                      <div className="flex flex-col items-center justify-center min-w-16 px-2 py-1.5 h-14 bg-primary/10 text-primary rounded-md border border-primary/20 text-center">
                        {evt.dataFim ? (
                          <span className="text-[11px] font-bold leading-tight">
                            {format(evt.data, "dd/MM")} <br /> a <br /> {format(evt.dataFim, "dd/MM")}
                          </span>
                        ) : (
                          <>
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {format(evt.data, "MMM", { locale: ptBR }).replace('.', '')}
                            </span>
                            <span className="text-xl font-black leading-none mt-0.5">
                              {evt.data.getDate()}
                            </span>
                          </>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-foreground">{evt.titulo}</h4>
                        <div className="flex gap-2 text-sm text-muted-foreground mt-0.5">
                          <span className="capitalize font-medium text-primary/80">
                            {evt.tipo.replace('_', ' ').toLowerCase()}
                          </span>
                          {evt.descricao && <span>• {evt.descricao}</span>}
                        </div>
                      </div>
                    </div>

                    <form action={deletarEvento.bind(null, evt.id)}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                ))}

                {eventos.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                    <CalendarDays className="h-10 w-10 mb-2 opacity-20" />
                    <p>Nenhum evento agendado.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}