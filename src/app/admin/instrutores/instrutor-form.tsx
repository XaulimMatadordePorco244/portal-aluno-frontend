'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { salvarInstrutor } from './actions'
import { Loader2, Search, CheckSquare, Square, Check } from 'lucide-react'

interface AlunoOpcao {
  id: string;
  nome: string;
  numero: string | null;
  cargoAbreviacao: string | null;
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
  const [busca, setBusca] = useState('')
  
  const [selectedAlunos, setSelectedAlunos] = useState<Set<string>>(
    new Set(initialData?.alunosIds || [])
  )

  const alunosFiltrados = useMemo(() => {
    if (!busca.trim()) return alunosDisponiveis;
    const termo = busca.toLowerCase();
    return alunosDisponiveis.filter(aluno => 
      aluno.nome.toLowerCase().includes(termo) || 
      (aluno.numero && aluno.numero.toLowerCase().includes(termo)) ||
      (aluno.cargoAbreviacao && aluno.cargoAbreviacao.toLowerCase().includes(termo))
    );
  }, [alunosDisponiveis, busca]);

  const toggleAluno = (id: string) => {
    const newSet = new Set(selectedAlunos)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedAlunos(newSet)
  }

  const selecionarTodosVisiveis = () => {
    const newSet = new Set(selectedAlunos)
    alunosFiltrados.forEach(aluno => newSet.add(aluno.id))
    setSelectedAlunos(newSet)
  }

  const limparSelecao = () => {
    setSelectedAlunos(new Set())
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
    <form action={handleSubmit} className="space-y-8 ">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      <div className="space-y-3 bg-card p-6 border rounded-xl shadow-sm">
        <Label htmlFor="nome" className="text-base">Nome do Instrutor <span className="text-red-500">*</span></Label>
        <Input 
          id="nome" 
          name="nome" 
          defaultValue={initialData?.nome || ''} 
          placeholder="Ex: Sgt. Mendonça" 
          className="max-w-md"
          required 
        />
      </div>

      <div className="space-y-4 bg-card p-6 border rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
          <div>
            <Label className="text-base">Alunos Vinculados</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Listados por ordem oficial de antiguidade.
            </p>
          </div>
          <div className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
            {selectedAlunos.size} aluno(s) selecionado(s)
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nome, número ou patente..."
              className="pl-9"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={selecionarTodosVisiveis}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Marcar Visíveis
            </Button>
            <Button type="button" variant="outline" onClick={limparSelecao}>
              <Square className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-2 pb-2">
          {alunosFiltrados.map(aluno => {
            const isSelected = selectedAlunos.has(aluno.id);
            const numeroFormatado = aluno.numero ? aluno.numero : 'S/N';
            const cargoFormatado = aluno.cargoAbreviacao ? aluno.cargoAbreviacao : 'S/C';

            return (
              <label 
                key={aluno.id} 
                className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 
                  ${isSelected 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-border bg-card hover:border-primary/40 hover:bg-muted/50'
                  }`}
              >
                <input
                  type="checkbox"
                  name="alunos" 
                  value={aluno.id}
                  checked={isSelected}
                  onChange={() => toggleAluno(aluno.id)}
                  className="sr-only" 
                />
                
                <div className={`flex items-center justify-center w-5 h-5 mr-4 rounded border transition-colors
                  ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background'}
                `}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="flex-1 flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                    {numeroFormatado}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {cargoFormatado} GM {aluno.nome}
                  </span>
                </div>
              </label>
            )
          })}
          
          {alunosFiltrados.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
              <Search className="w-8 h-8 mb-2 opacity-20" />
              <span className="text-sm font-medium">Nenhum aluno encontrado na busca.</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} size="lg" className="w-48">
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          {initialData ? 'Salvar Edição' : 'Cadastrar Instrutor'}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => window.history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}