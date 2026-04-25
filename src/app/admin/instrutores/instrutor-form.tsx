'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { salvarInstrutor } from './actions'
import { Loader2 } from 'lucide-react'

interface AlunoOpcao {
  id: string;
  nome: string;
  numero: string | null;
}

interface InstrutorFormProps {
  initialData?: {
    id: string
    nome: string
    alunosIds?: string[] 
  } | null
  alunosDisponiveis: AlunoOpcao[] 
}

export function InstrutorForm({ initialData, alunosDisponiveis }: InstrutorFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedAlunos, setSelectedAlunos] = useState<Set<string>>(
    new Set(initialData?.alunosIds || [])
  )

  const toggleAluno = (id: string) => {
    const newSet = new Set(selectedAlunos)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedAlunos(newSet)
  }

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

      <div className="space-y-2">
        <Label>Alunos Vinculados a este Instrutor</Label>
        <div className="border rounded-md p-4 max-h-64 overflow-y-auto space-y-3 bg-muted/30">
          {alunosDisponiveis.map(aluno => (
            <label key={aluno.id} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="alunos" 
                value={aluno.id}
                checked={selectedAlunos.has(aluno.id)}
                onChange={() => toggleAluno(aluno.id)}
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary bg-background"
              />
              <span className="text-sm font-medium">
                {aluno.numero ? `${aluno.numero} - ` : ''}{aluno.nome}
              </span>
            </label>
          ))}
          {alunosDisponiveis.length === 0 && (
            <span className="text-sm text-muted-foreground">Nenhum aluno ativo encontrado.</span>
          )}
        </div>
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