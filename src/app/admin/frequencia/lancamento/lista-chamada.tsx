'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PerfilAluno, StatusFrequencia } from '@prisma/client'
import { toast } from 'sonner'
import { CalendarIcon, CheckCheck, Save, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { buscarFrequenciaDoDia, salvarListaFrequencia } from '@/app/actions/frequencia-actions'

interface ListaChamadaProps {
  alunos: (PerfilAluno & { usuario: { nome: string } })[]
}

export function ListaChamada({ alunos }: ListaChamadaProps) {
  const [data, setData] = useState<Date>(new Date())
  const [tipo, setTipo] = useState<string>('GERAL')
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [chamada, setChamada] = useState<Record<string, StatusFrequencia>>({})

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      try {
        const existentes = await buscarFrequenciaDoDia(data, tipo)
        const novoMapa: Record<string, StatusFrequencia> = {}
        
        existentes.forEach(reg => {
          novoMapa[reg.alunoId] = reg.status
        })
        setChamada(novoMapa)
      } catch (e) {
        console.error(e)
        toast.error("Erro ao carregar dados.")
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [data, tipo])

  const toggleStatus = (alunoId: string, status: StatusFrequencia) => {
    setChamada(prev => ({ ...prev, [alunoId]: status }))
  }

  const marcarTodosPresentes = () => {
    const novoMapa: Record<string, StatusFrequencia> = {}
    alunos.forEach(a => novoMapa[a.id] = StatusFrequencia.PRESENTE)
    setChamada(novoMapa)
    toast.success('Todos marcados como presente!')
  }

  const salvar = async () => {
    setLoading(true)
    const registros = Object.entries(chamada).map(([alunoId, status]) => ({
      alunoId,
      status
    }))

    if (registros.length === 0) {
      toast.warning('Marque a presença de pelo menos um aluno.')
      setLoading(false)
      return
    }

    const res = await salvarListaFrequencia(data, tipo, registros)
    if (res.success) {
      toast.success(res.message)
    } else {
      toast.error(res.message)
    }
    setLoading(false)
  }

  const alunosFiltrados = alunos
    .filter(a => a.nomeDeGuerra?.toLowerCase().includes(busca.toLowerCase()) || a.usuario.nome.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => (a.nomeDeGuerra || '').localeCompare(b.nomeDeGuerra || ''))

  const presentes = Object.values(chamada).filter(s => s === 'PRESENTE').length
  const faltas = Object.values(chamada).filter(s => s === 'FALTA').length

  return (
    <div className="space-y-6">
      <div className="bg-card p-4 rounded-lg border shadow-sm flex flex-col md:flex-row gap-6 justify-between md:items-center">
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full sm:w-60 justify-start text-left font-normal", !data && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data ? format(data, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={data} onSelect={(d) => d && setData(d)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Atividade</span>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Selecione" />
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

        <div className="flex gap-3 justify-start md:justify-end items-center">
           <div className="flex flex-col items-center px-4 py-2 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">PRESENTES</span>
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{presentes}</span>
           </div>
           <div className="flex flex-col items-center px-4 py-2 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400">FALTAS</span>
              <span className="text-xl font-bold text-red-700 dark:text-red-300">{faltas}</span>
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
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={marcarTodosPresentes} className="flex-1 md:flex-none">
            <CheckCheck className="mr-2 h-4 w-4 text-emerald-600" />
            Todos Presentes
          </Button>
          <Button onClick={salvar} disabled={loading} className="flex-1 md:flex-none min-w-[140px]">
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar Chamada'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alunosFiltrados.map((aluno) => {
            const status = chamada[aluno.id]
            return (
                <div key={aluno.id} className={cn(
                    "p-3 rounded-lg border flex items-center justify-between gap-3 transition-all duration-200 shadow-sm",
                    status === 'FALTA' 
                        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50" 
                    : status === 'JUSTIFICADA' 
                        ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50" 
                    : status === 'PRESENTE' 
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50" 
                    : "bg-card hover:border-muted-foreground/30"
                )}>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate text-foreground">
                           {aluno.nomeDeGuerra || aluno.usuario.nome.split(' ')[0]}
                        </p>
                        <p className="text-xs text-muted-foreground truncate" title={aluno.usuario.nome}>
                           {aluno.usuario.nome}
                        </p>
                    </div>
                    
                    <div className="flex shrink-0 gap-1 bg-background dark:bg-secondary/30 p-1 rounded-md border shadow-sm">
                        <button 
                            onClick={() => toggleStatus(aluno.id, 'PRESENTE')}
                            className={cn("h-8 w-8 rounded flex items-center justify-center font-bold text-xs transition-all", 
                                status === 'PRESENTE' 
                                  ? "bg-emerald-600 text-white shadow-sm scale-105 ring-1 ring-emerald-600" 
                                  : "hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400")}
                            title="Presente"
                        >
                            P
                        </button>
                        <button 
                            onClick={() => toggleStatus(aluno.id, 'FALTA')}
                            className={cn("h-8 w-8 rounded flex items-center justify-center font-bold text-xs transition-all", 
                                status === 'FALTA' 
                                  ? "bg-red-600 text-white shadow-sm scale-105 ring-1 ring-red-600" 
                                  : "hover:bg-red-100 dark:hover:bg-red-900/40 text-muted-foreground hover:text-red-700 dark:hover:text-red-400")}
                            title="Falta"
                        >
                            F
                        </button>
                        <button 
                            onClick={() => toggleStatus(aluno.id, 'JUSTIFICADA')}
                            className={cn("h-8 w-8 rounded flex items-center justify-center font-bold text-xs transition-all", 
                                status === 'JUSTIFICADA' 
                                  ? "bg-amber-500 text-white shadow-sm scale-105 ring-1 ring-amber-500" 
                                  : "hover:bg-amber-100 dark:hover:bg-amber-900/40 text-muted-foreground hover:text-amber-700 dark:hover:text-amber-400")}
                            title="Justificada"
                        >
                            J
                        </button>
                    </div>
                </div>
            )
        })}
      </div>
      
      {alunosFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/30">
             <Search className="h-10 w-10 mb-2 opacity-20" />
             <p>Nenhum aluno encontrado.</p>
          </div>
      )}
    </div>
  )
}