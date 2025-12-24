'use client'


import { alternarFrequencia } from './actions'
import { Check, X, ShieldAlert, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Props {
  alunos: any[]
  frequencias: any[]
  datas: string[]
  tipo: string
}

export function MapaFrequenciaClient({ alunos, frequencias, datas, tipo }: Props) {
  
  const getStatus = (alunoId: string, dataIso: string) => {
    const reg = frequencias.find(f => f.alunoId === alunoId && f.data.toISOString().startsWith(dataIso))
    return reg ? reg.status : null
  }

  const handleClick = async (alunoId: string, dataIso: string) => {
    const statusAtual = getStatus(alunoId, dataIso)
    try {
        await alternarFrequencia(alunoId, dataIso, tipo, statusAtual)
        toast.success("Atualizado")
    } catch {
        toast.error("Erro ao atualizar")
    }
  }

  return (
    <TooltipProvider>
    <table className="w-full text-sm text-left border-collapse relative">
      <thead className="text-muted-foreground uppercase text-xs sticky top-0 z-30 shadow-sm">
        <tr>
          <th className="p-3 font-medium border-b border-r sticky left-0 top-0 z-40 bg-muted/95 backdrop-blur w-64 min-w-[200px]">
             Aluno / Mirim
          </th>
          
          {datas.map(d => {
             const [mes, dia] = d.split('-')
             const urlEdicao = `/admin/frequencia/lancamento?data=${d}&tipo=${tipo}`

             return (
                <th key={d} className="p-1 border-b border-r text-center min-w-[50px] bg-muted/95 backdrop-blur align-middle">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link 
                                href={urlEdicao}
                                className="flex flex-col items-center justify-center hover:bg-primary/10 rounded cursor-pointer py-1 transition-colors group"
                            >
                                <span className="font-bold text-foreground">{dia}</span>
                                <span className="text-[10px]">{mes}</span>
                                <Edit2 className="w-3 h-3 mt-1 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Editar chamada do dia {dia}/{mes}</p>
                        </TooltipContent>
                    </Tooltip>
                </th>
             )
          })}
        </tr>
      </thead>
      
      <tbody>
        {alunos.map((aluno) => (
          <tr key={aluno.id} className="hover:bg-muted/5 group border-b last:border-0">
            <td className="p-3 font-medium border-r sticky left-0 bg-background group-hover:bg-muted/5 z-20 whitespace-nowrap shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
              <span className="text-muted-foreground text-xs mr-2 font-bold bg-muted px-1.5 py-0.5 rounded">
                {aluno.graduacao}
              </span>
              {aluno.nomeDeGuerra}
            </td>
            
            {datas.map(d => {
              const status = getStatus(aluno.id, d)
              return (
                <td 
                    key={`${aluno.id}-${d}`} 
                    onClick={() => handleClick(aluno.id, d)}
                    className="p-1 border-r text-center cursor-pointer hover:bg-muted/20 transition-colors select-none"
                >
                    <div className={cn(
                        "w-8 h-8 mx-auto rounded flex items-center justify-center transition-all",
                        status === 'PRESENTE' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                        status === 'FALTA' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                        status === 'JUSTIFICADA' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                        !status && "text-muted-foreground/10 hover:text-muted-foreground"
                    )}>
                        {status === 'PRESENTE' && <Check className="w-4 h-4" />}
                        {status === 'FALTA' && <X className="w-4 h-4" />}
                        {status === 'JUSTIFICADA' && <ShieldAlert className="w-4 h-4" />}
                        {!status && <span className="text-xs">•</span>}
                    </div>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
    </TooltipProvider>
  )
}