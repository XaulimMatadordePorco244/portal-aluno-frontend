'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Edit2, Loader2, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { salvarComandantes } from '@/app/admin/antiguidade/actions'

interface ModalProps {
  efetivo: {
    id: string
    numero: string | null
    nome: string
    cargo: string
  }[]
  comandanteAtualId?: string
  subComandanteAtualId?: string
}

export default function ModalDefinirComando({ efetivo, comandanteAtualId, subComandanteAtualId }: ModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cmdId, setCmdId] = useState(comandanteAtualId || "none")
  const [subId, setSubId] = useState(subComandanteAtualId || "none")

  async function handleSalvar() {
    setLoading(true)
    const res = await salvarComandantes(cmdId, subId)
    
    if (res.success) {
      toast.success(res.message)
      setOpen(false)
    } else {
      toast.error(res.message)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-primary text-primary hover:bg-primary/10">
          <Edit2 className="w-4 h-4" />
          Definir Comandos
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            Alterar Cadeia de Comando
          </DialogTitle>
          <DialogDescription>
            Selecione os alunos que ocuparão as funções de Comando Geral da tropa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="font-bold text-primary">Comandante Geral</Label>
            <Select value={cmdId} onValueChange={setCmdId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o Comandante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-muted-foreground">Nenhum (Vago)</SelectItem>
                {efetivo.map(aluno => (
                  <SelectItem key={aluno.id} value={aluno.id}>
                    {aluno.numero ? `${aluno.numero} - ` : ''} {aluno.cargo} {aluno.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-primary">Sub Comandante Geral</Label>
            <Select value={subId} onValueChange={setSubId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o Sub Comandante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-muted-foreground">Nenhum (Vago)</SelectItem>
                {efetivo.map(aluno => (
                  <SelectItem key={aluno.id} value={aluno.id}>
                    {aluno.numero ? `${aluno.numero} - ` : ''} {aluno.cargo} {aluno.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}