'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { marcarComoLida } from '@/app/actions/feedback-actions'
import { toast } from 'sonner'
import { Search, CheckCheck, Mail } from 'lucide-react'

type FeedbackAdmin = {
  id: string
  assunto: string
  mensagem: string
  destinatario: string
  lida: boolean
  createdAt: Date
  aluno: {
    nomeDeGuerra: string | null
    numero: string | null
  }
}

export default function PainelFeedbackAdmin({ feedbacksIniciais }: { feedbacksIniciais: FeedbackAdmin[] }) {
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos') 
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const feedbacksFiltrados = feedbacksIniciais.filter((item) => {
    const textoMatch = 
      item.assunto.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      item.mensagem.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      item.aluno.nomeDeGuerra?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      item.destinatario.toLowerCase().includes(filtroTexto.toLowerCase())

    const statusMatch = 
      filtroStatus === 'todos' ? true :
      filtroStatus === 'lida' ? item.lida === true :
      item.lida === false

    return textoMatch && statusMatch
  })

  async function handleMarcarLida(id: string) {
    setLoadingId(id)
    await marcarComoLida(id)
    setLoadingId(null)
    toast.success('Marcada como lida!')
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg shadow-sm border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por assunto, aluno ou mensagem..." 
            className="pl-9 bg-background"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-48">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="nao_lida">Não Lidas</SelectItem>
              <SelectItem value="lida">Lidas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Mostrando {feedbacksFiltrados.length} mensagens</span>
        </div>

        {feedbacksFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
             <Mail className="h-10 w-10 mb-2 opacity-20" />
             <p>Nenhum feedback encontrado com esses filtros.</p>
          </div>
        )}

        {feedbacksFiltrados.map((item) => (
          <Card 
            key={item.id} 
            className={`
              transition-all duration-200 
              ${!item.lida 
                ? 'border-l-4 border-l-primary shadow-md bg-card' 
                : 'opacity-75 bg-muted/30 border-l-4 border-l-transparent hover:opacity-100'
              }
            `}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-bold text-lg text-foreground">
                      {item.aluno.numero ? item.aluno.numero : 'S/N'} - {item.aluno.nomeDeGuerra || 'Aluno Desconhecido'}
                    </span>
                    <Badge variant={item.lida ? "secondary" : "default"}>
                      {item.lida ? "Lida" : "Nova"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:gap-4">
                    <span>Enviado em {new Date(item.createdAt).toLocaleString('pt-BR')}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Para: <strong className="text-foreground">{item.destinatario}</strong></span>
                  </div>
                </div>
                
                {!item.lida && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="shrink-0 gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                    onClick={() => handleMarcarLida(item.id)}
                    disabled={loadingId === item.id}
                  >
                    {loadingId === item.id ? (
                        'Marcando...' 
                    ) : (
                        <>
                            <CheckCheck className="h-4 w-4" />
                            Marcar como Lida
                        </>
                    )}
                  </Button>
                )}
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md border border-border/50">
                <h4 className="font-semibold mb-2 text-foreground flex items-center gap-2">
                    <span className="text-muted-foreground font-normal text-sm uppercase tracking-wider">Assunto:</span>
                    {item.assunto}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {item.mensagem}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}