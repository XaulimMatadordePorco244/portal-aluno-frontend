'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { salvarInstrutor } from './actions'
import { Loader2 } from 'lucide-react'

interface InstrutorFormProps {
  initialData?: {
    id: string
    nome: string
  } | null
}

export function InstrutorForm({ initialData }: InstrutorFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await salvarInstrutor(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-xl">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      <div className="space-y-2">
        <Label htmlFor="nome">Nome do Instrutor <span className="text-red-500">*</span></Label>
        <Input 
          id="nome" 
          name="nome" 
          defaultValue={initialData?.nome || ''} 
          placeholder="Ex: Sgt. Mendonça" 
          required 
        />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Atualizar Instrutor' : 'Cadastrar Instrutor'}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}