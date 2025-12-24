'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PerfilAluno, StatusFrequencia } from '@prisma/client'
import { toast } from 'sonner'
import { CalendarIcon, CheckCheck, Save, Search, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { buscarFrequenciaDoDia, salvarListaFrequencia } from '@/app/actions/frequencia-actions'

interface ListaChamadaProps {
  alunos: (PerfilAluno & { usuario: { nome: string } })[]
}

export function ListaChamada({ alunos }: ListaChamadaProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const dataUrl = searchParams.get('data')
  const tipoUrl = searchParams.get('tipo')

const dataInicial = dataUrl ? new Date(dataUrl + 'T12:00:00') : new Date()

  const [data, setData] = useState<Date>(dataInicial)
  const [tipo, setTipo] = useState<string>(tipoUrl || 'GERAL')
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(false)

  const [chamada, setChamada] = useState<Record<string, StatusFrequencia>>({})
  const [observacoes, setObservacoes] = useState<Record<string, string>>({})

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      try {
        const existentes = await buscarFrequenciaDoDia(data, tipo)
        const novoMapa: Record<string, StatusFrequencia> = {}
        const mapaObs: Record<string, string> = {}

        existentes.forEach(reg => {
          novoMapa[reg.alunoId] = reg.status
          if (reg.observacao) mapaObs[reg.alunoId] = reg.observacao
        })

        setChamada(novoMapa)
        setObservacoes(mapaObs)
      } catch (e) {
        console.error(e)
        toast.error('Erro ao carregar dados.')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [data, tipo])

  const toggleStatus = (alunoId: string, status: StatusFrequencia) => {
    setChamada(prev => ({ ...prev, [alunoId]: status }))
  }

  const handleObservacao = (alunoId: string, texto: string) => {
    setObservacoes(prev => ({ ...prev, [alunoId]: texto }))
  }

  const marcarTodosPresentes = () => {
    const novoMapa: Record<string, StatusFrequencia> = {}
    alunos.forEach(a => (novoMapa[a.id] = StatusFrequencia.PRESENTE))
    setChamada(novoMapa)
    toast.success('Todos marcados como presente!')
  }

  const salvar = async () => {
    setLoading(true)

    const registros = Object.entries(chamada).map(([alunoId, status]) => ({
      alunoId,
      status,
      observacao: observacoes[alunoId] || null
    }))

    if (registros.length === 0) {
      toast.warning('Marque a presença de pelo menos um aluno.')
      setLoading(false)
      return
    }

    const res = await salvarListaFrequencia(data, tipo, registros)
    if (res.success) {
      toast.success(res.message)
      router.push('/admin/frequencia')
    } else toast.error(res.message)

    setLoading(false)
  }

  const alunosFiltrados = alunos
    .filter(
      a =>
        a.nomeDeGuerra?.toLowerCase().includes(busca.toLowerCase()) ||
        a.usuario.nome.toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) => (a.nomeDeGuerra || '').localeCompare(b.nomeDeGuerra || ''))

  const presentes = Object.values(chamada).filter(s => s === 'PRESENTE').length
  const faltas = Object.values(chamada).filter(s => s === 'FALTA').length

  return (
    <div className="space-y-6">
      <div className="bg-card p-4 rounded-lg border shadow-sm flex flex-col md:flex-row gap-6 justify-between md:items-center">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Data
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full sm:w-60 justify-start text-left font-normal',
                    !data && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data}
                  onSelect={d => d && setData(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Atividade
            </span>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GERAL">Geral (Dia Comum)</SelectItem>
                <SelectItem value="INST_CUNHA">Inst. Cunha</SelectItem>
                <SelectItem value="INST_JOSIANE">Inst. Josiane</SelectItem>
                <SelectItem value="INST_KAREN">Inst. Karen</SelectItem>
                <SelectItem value="INST_MENDONCA">Inst. Mendonça</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col items-center px-4 py-2 rounded bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              PRESENTES
            </span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {presentes}
            </span>
          </div>
          <div className="flex flex-col items-center px-4 py-2 rounded bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800/50">
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400">
              FALTAS
            </span>
            <span className="text-xl font-bold text-red-700 dark:text-red-300">
              {faltas}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar aluno..."
            className="pl-9"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={marcarTodosPresentes}
            className="flex-1 md:flex-none"
          >
            <CheckCheck className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Todos Presentes
          </Button>
          <Button
            onClick={salvar}
            disabled={loading}
            className="flex-1 md:flex-none min-w-[140px]"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar Chamada'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alunosFiltrados.map(aluno => {
          const status = chamada[aluno.id]
          return (
            <div
              key={aluno.id}
              className={cn(
                'p-3 rounded-lg border flex items-center justify-between gap-3 shadow-sm transition-colors',
                !status
                  ? 'bg-muted/30 border-border'
                  : status === 'FALTA'
                  ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/50'
                  : status === 'JUSTIFICADA'
                  ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50'
                  : status === 'PRESENTE'
                  ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50'
                  : 'bg-card'
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">
                  {aluno.nomeDeGuerra || aluno.usuario.nome.split(' ')[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {aluno.usuario.nome}
                </p>
              </div>

              <div className="flex shrink-0 gap-1 bg-background p-1 rounded-md border shadow-sm">
                <button
                  onClick={() => toggleStatus(aluno.id, 'PRESENTE')}
                  className={cn(
                    'h-8 w-8 rounded flex items-center justify-center font-bold text-xs transition-colors',
                    status === 'PRESENTE'
                      ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  P
                </button>
                <button
                  onClick={() => toggleStatus(aluno.id, 'FALTA')}
                  className={cn(
                    'h-8 w-8 rounded flex items-center justify-center font-bold text-xs transition-colors',
                    status === 'FALTA'
                      ? 'bg-red-600 text-white dark:bg-red-500'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  F
                </button>
                <button
                  onClick={() => toggleStatus(aluno.id, 'JUSTIFICADA')}
                  className={cn(
                    'h-8 w-8 rounded flex items-center justify-center font-bold text-xs transition-colors',
                    status === 'JUSTIFICADA'
                      ? 'bg-amber-500 text-white dark:bg-amber-400'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  J
                </button>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        'h-8 w-8 rounded flex items-center justify-center transition-colors',
                        observacoes[aluno.id]
                          ? 'bg-blue-100 text-blue-600 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50'
                          : 'text-gray-400 hover:bg-muted dark:text-gray-500'
                      )}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3">
                    <Textarea
                      placeholder="Ex: Saiu mais cedo, atestado..."
                      value={observacoes[aluno.id] || ''}
                      onChange={e =>
                        handleObservacao(aluno.id, e.target.value)
                      }
                      className="h-20 text-sm"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
