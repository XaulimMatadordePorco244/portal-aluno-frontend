'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Edit2, Loader2, Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { atualizarVagasAntiguidade } from './actions'

type VagasProps = {
  superiores: number; intermediarios: number; subalternos: number;
  subtenentes: number; sargentos: number; cabos: number; soldados: number;
}

export function EditarVagasDialog({ vagasAtuais }: { vagasAtuais: VagasProps }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<VagasProps>(vagasAtuais)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) })
  }

  const handleSave = async () => {
    setLoading(true)
    const res = await atualizarVagasAntiguidade(formData)
    setLoading(false)

    if (res.success) {
      toast.success('Quadro de vagas atualizado!')
      setOpen(false)
    } else {
      toast.error(res.error || 'Erro ao atualizar.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Edit2 className="w-4 h-4 mr-2" />
          Definir Vagas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Quadro de Vagas</DialogTitle>
          <DialogDescription>
            Defina o limite máximo de alunos promovidos por antiguidade em cada categoria.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-red-600 uppercase border-b pb-1">Oficiais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Superiores</Label>
                <Input type="number" name="superiores" min="0" value={formData.superiores} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Intermediários</Label>
                <Input type="number" name="intermediarios" min="0" value={formData.intermediarios} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Subalternos</Label>
                <Input type="number" name="subalternos" min="0" value={formData.subalternos} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-blue-600 uppercase border-b pb-1">Praças</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Subtenentes</Label>
                <Input type="number" name="subtenentes" min="0" value={formData.subtenentes} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sargentos</Label>
                <Input type="number" name="sargentos" min="0" value={formData.sargentos} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cabos</Label>
                <Input type="number" name="cabos" min="0" value={formData.cabos} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Soldados</Label>
                <Input type="number" name="soldados" min="0" value={formData.soldados} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}