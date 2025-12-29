'use client'

import { useState } from 'react'
import { enviarFeedback, editarFeedback, excluirFeedback } from '@/app/actions/feedback-actions'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Trash2, Pencil, Loader2, CheckCircle, Clock, Send } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Feedback = {
  id: string
  assunto: string
  mensagem: string
  destinatario: string
  lida: boolean
  createdAt: Date
}

type AdminBasico = { id: string; nome: string }

interface Props {
  admins: AdminBasico[]
  alunoId: string
  historicoInicial: Feedback[]
}

export default function FormularioFeedback({ admins, alunoId, historicoInicial }: Props) {
  const [loading, setLoading] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({ destinatario: '', assunto: '', mensagem: '' })

  async function handleSubmit(dados: FormData) {
    setLoading(true)
    let res

    if (editandoId) {
      res = await editarFeedback(editandoId, alunoId, dados)
    } else {
      res = await enviarFeedback(alunoId, dados)
    }

    setLoading(false)

    if (res.success) {
      toast.success(res.message)
      resetForm()
    } else {
      toast.error(res.message)
    }
  }

  function resetForm() {
    setFormData({ destinatario: '', assunto: '', mensagem: '' })
    setEditandoId(null)
  }

  function handleEditar(item: Feedback) {
    setEditandoId(item.id)
    setFormData({
      destinatario: item.destinatario,
      assunto: item.assunto,
      mensagem: item.mensagem
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleExcluir(id: string) {
    if (!confirm('Tem certeza que deseja apagar esta mensagem?')) return
    const res = await excluirFeedback(id, alunoId)
    if (res.success) toast.success(res.message)
    else toast.error(res.message)
  }

  return (
    <div className="space-y-8">
      
      <Card className={`transition-colors duration-300 ${editandoId ? "border-primary ring-1 ring-primary/20" : ""}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            {editandoId && <Pencil className="w-5 h-5 text-primary" />}
            <CardTitle>{editandoId ? 'Editar Mensagem' : 'Nova Mensagem'}</CardTitle>
          </div>
          <CardDescription>
            {editandoId ? 'Atualize as informações abaixo.' : 'Sua mensagem será enviada diretamente para a coordenação.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Para quem?</Label>
                <Select 
                  name="destinatario" 
                  value={formData.destinatario} 
                  onValueChange={(v) => setFormData({...formData, destinatario: v})}
                  required
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.nome}>{admin.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assunto</Label>
                <Input 
                  name="assunto" 
                  value={formData.assunto}
                  onChange={(e) => setFormData({...formData, assunto: e.target.value})}
                  required 
                  className="bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea 
                name="mensagem" 
                value={formData.mensagem}
                onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
                className="min-h-[120px] bg-background resize-none" 
                placeholder="Digite sua mensagem aqui..."
                required 
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editandoId ? null : <Send className="mr-2 h-4 w-4" />}
                {editandoId ? 'Salvar Alterações' : 'Enviar Mensagem'}
              </Button>
              
              {editandoId && (
                <Button variant="outline" type="button" onClick={resetForm} disabled={loading} className="bg-background">
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          Minhas Mensagens 
          <Badge variant="secondary" className="ml-2">{historicoInicial.length}</Badge>
        </h3>
        
        {historicoInicial.length === 0 && (
           <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
             <p>Você ainda não enviou nenhuma mensagem.</p>
           </div>
        )}
        
        <div className="grid gap-4">
          {historicoInicial.map((item) => (
            <Card key={item.id} className="relative overflow-hidden group hover:shadow-md transition-all duration-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={`
                        ${item.lida 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }
                      `}
                    >
                      {item.lida 
                        ? <><CheckCircle className="w-3 h-3 mr-1" /> Lida</> 
                        : <><Clock className="w-3 h-3 mr-1" /> Aguardando</>
                      }
                    </Badge>
                    <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {!item.lida && (
                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" 
                        onClick={() => handleEditar(item)}
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                        onClick={() => handleExcluir(item.id)}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <h4 className="font-semibold text-lg leading-none mb-1">{item.assunto}</h4>
                  <p className="text-xs text-muted-foreground">Enviado para: {item.destinatario}</p>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md border border-border/50 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {item.mensagem}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}