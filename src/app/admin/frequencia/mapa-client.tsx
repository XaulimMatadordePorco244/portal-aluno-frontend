'use client'

import { useState } from 'react'
import { StatusFrequencia } from '@prisma/client'
import { alternarFrequencia } from './actions'
import { Check, X, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
      toast.success("Frequência atualizada")
    } catch (e) {
      toast.error("Erro ao atualizar")
    }
  }

  return (
    <table className="w-full text-sm text-left border-collapse">
      <thead className="bg-muted text-muted-foreground uppercase text-xs sticky top-0 z-20 shadow-sm">
        <tr>
          <th className="p-3 font-medium border-b sticky left-0 bg-muted z-10 w-48">Aluno</th>
          {datas.map(d => {
            const [ano, mes, dia] = d.split('-')
            return (
              <th key={d} className="p-2 border-b text-center min-w-[50px] border-l">
                {dia}/{mes}
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {alunos.map((aluno) => (
          <tr key={aluno.id} className="hover:bg-muted/5 group border-b last:border-0">
            <td className="p-3 font-medium border-r sticky left-0 bg-background group-hover:bg-muted/5 z-10">
              <span className="text-muted-foreground text-xs mr-1">{aluno.graduacao}</span>
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
                    status === 'PRESENTE' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    status === 'FALTA' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                    status === 'JUSTIFICADA' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                    !status && "text-muted-foreground/20 hover:text-muted-foreground"
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
  )
}