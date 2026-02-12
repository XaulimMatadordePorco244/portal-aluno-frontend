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

export const metadata: Metadata = { title: 'Calendário Institucional' }

export default async function AdminCalendarioPage() {
  const eventos = await prisma.gmEventoCalendario.findMany({
    orderBy: { data: 'desc' }
  })

  return (
    <div className="mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarDays className="w-8 h-8 text-primary" />
          Calendário Institucional
        </h1>
        <p className="text-muted-foreground">
          Adicione feriados, eventos e avisos que aparecerão para todos os alunos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Novo Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={criarEvento} className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input name="titulo" required />
              </div>

              <div className="space-y-2">
                <Label>Data</Label>
                <Input name="data" type="date" required />
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select name="tipo" required defaultValue="FERIADO">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FERIADO">Feriado / Recesso</SelectItem>
                    <SelectItem value="AULA_EXTRA">Aula Extra / Obrigatória</SelectItem>
                    <SelectItem value="CANCELADO">Aula Cancelada</SelectItem>
                    <SelectItem value="EVENTO">Evento / Solenidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input name="descricao" />
              </div>

              <Button type="submit" className="w-full">
                Adicionar ao Calendário
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                className="rounded-md border shadow-sm"
                modifiers={{
                  evento: eventos.map(e => e.data)
                }}
                modifiersStyles={{
                  evento: {
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    fontWeight: 'bold'
                  }
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eventos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventos.map(evt => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-4 border rounded-lg shadow-sm hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-muted rounded border">
                        <span className="text-xs font-bold uppercase">
                          {evt.data
                            .toLocaleDateString('pt-BR', { month: 'short' })
                            .slice(0, 3)}
                        </span>
                        <span className="text-xl font-bold">
                          {evt.data.getDate()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold">{evt.titulo}</h4>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span className="capitalize">
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
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                ))}
                {eventos.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum evento cadastrado.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
