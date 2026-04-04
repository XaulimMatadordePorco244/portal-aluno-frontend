'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Timer, Dumbbell, Activity, Save } from 'lucide-react'
import { toast } from 'sonner'

import { calcularNotaIndividual } from '@/app/admin/taf/actions/calcular-nota' 
import { salvarTaf } from '@/app/admin/taf/actions/taf-actions' 

type ApoioTipo = 'BARRA' | 'FLEXAO'

interface TafFormProps {
  alunoId: string
  genero: 'MASCULINO' | 'FEMININO' 
  nomeAluno: string
  initialData?: {
    id: string
    bimestre: number
    abdominalQtd: number
    apoioTipo: ApoioTipo
    apoioValor: number
    corridaTempo: number
    observacoes?: string | null
  } | null
}

export default function TafForm({ alunoId, genero, nomeAluno, initialData }: TafFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  
  const [bimestre, setBimestre] = useState<string>(initialData?.bimestre?.toString() || '1')
  const [abdominal, setAbdominal] = useState<string>(initialData ? initialData.abdominalQtd.toString() : '')
  const [apoioTipo, setApoioTipo] = useState<ApoioTipo>(initialData?.apoioTipo || 'BARRA')
  const [apoioValor, setApoioValor] = useState<string>(initialData ? initialData.apoioValor.toString() : '')
  
  const [corridaMin, setCorridaMin] = useState<string>(
    initialData?.corridaTempo ? Math.floor(initialData.corridaTempo / 60).toString() : ''
  )
  const [corridaSeg, setCorridaSeg] = useState<string>(
    initialData?.corridaTempo ? (initialData.corridaTempo % 60).toString() : ''
  )

  const [notas, setNotas] = useState<{ abdominal: number; apoio: number; corrida: number }>({ 
    abdominal: 0, 
    apoio: 0, 
    corrida: 0 
  })

  const isEditing = !!initialData

  useEffect(() => {
    const calcular = async () => {
      const nAbd = abdominal 
        ? await calcularNotaIndividual(genero, 'ABDOMINAL', parseInt(abdominal)) 
        : 0
      
      const nApoio = apoioValor 
        ? await calcularNotaIndividual(genero, apoioTipo, parseFloat(apoioValor)) 
        : 0
      
      const totalSegundos = (parseInt(corridaMin || '0') * 60) + parseInt(corridaSeg || '0')
      const nCorrida = totalSegundos > 0 
        ? await calcularNotaIndividual(genero, 'CORRIDA', totalSegundos) 
        : 0

      setNotas({ 
        abdominal: nAbd, 
        apoio: nApoio, 
        corrida: nCorrida 
      })
    }
    calcular()
  }, [abdominal, apoioTipo, apoioValor, corridaMin, corridaSeg, genero])

  const mediaPrevista = ((notas.abdominal + notas.apoio + notas.corrida) / 3).toFixed(2)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    
    formData.append('alunoId', alunoId)
    formData.append('genero', genero)
    formData.append('bimestre', bimestre)
    formData.append('apoioTipo', apoioTipo)
    
    const totalSegundos = (parseInt(corridaMin || '0') * 60) + parseInt(corridaSeg || '0')
    formData.append('corridaTempo', totalSegundos.toString())

    try {
      const res = await salvarTaf(formData)

      if (res.success) {
        toast.success(res.message)
        router.push(`/admin/taf`) 
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Erro ao salvar TAF')
      } else {
        toast.error('Erro desconhecido ao salvar TAF')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 ">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {isEditing ? 'Editar TAF' : `Lançamento de TAF - ${new Date().getFullYear()}`}
        </h2>
        <span className="text-sm bg-muted px-3 py-1 rounded-md border font-mono">
            {genero}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="space-y-2">
            <Label>Aluno</Label>
            <Input value={nomeAluno} disabled className="bg-muted" />
         </div>
         <div className="space-y-2">
            <Label>Bimestre</Label>
            <Select value={bimestre} onValueChange={(v: string) => setBimestre(v)} disabled={isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="1">1º Bimestre</SelectItem>
                    <SelectItem value="2">2º Bimestre</SelectItem>
                    <SelectItem value="3">3º Bimestre</SelectItem>
                    <SelectItem value="4">4º Bimestre</SelectItem>
                </SelectContent>
            </Select>
            <input type="hidden" name="anoLetivo" value={new Date().getFullYear()} />
            {isEditing && <input type="hidden" name="bimestre" value={bimestre} />}
         </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-base flex justify-between items-center">
                <span className="flex items-center gap-2"><Activity className="w-4 h-4"/> Abdominal (Repetições)</span>
                <span className={`text-sm px-2 py-0.5 rounded ${notas.abdominal >= 6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Nota: {notas.abdominal.toFixed(1)}
                </span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Input 
                name="abdominalQtd" 
                type="number" 
                placeholder="Qtd. Repetições" 
                value={abdominal}
                onChange={e => setAbdominal(e.target.value)}
            />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-base flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4"/>
                    <Select 
                      value={apoioTipo} 
                      onValueChange={(v: ApoioTipo) => setApoioTipo(v)}
                    >
                        <SelectTrigger className="h-8 w-32 ml-2">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="BARRA">Barra Fixa</SelectItem>
                            <SelectItem value="FLEXAO">Flexão</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <span className={`text-sm px-2 py-0.5 rounded ${notas.apoio >= 6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Nota: {notas.apoio.toFixed(1)}
                </span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                    {apoioTipo === 'BARRA' ? 'Tempo em segundos (Suspensão)' : 'Quantidade de Repetições'}
                </Label>
                <Input 
                    name="apoioValor" 
                    type="number" 
                    placeholder={apoioTipo === 'BARRA' ? "Ex: 45 (segundos)" : "Ex: 20 (repetições)"} 
                    value={apoioValor}
                    onChange={e => setApoioValor(e.target.value)}
                />
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-base flex justify-between items-center">
                <span className="flex items-center gap-2"><Timer className="w-4 h-4"/> Corrida (Tempo)</span>
                <span className={`text-sm px-2 py-0.5 rounded ${notas.corrida >= 6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Nota: {notas.corrida.toFixed(1)}
                </span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex gap-2 items-end">
                <div className="flex-1">
                    <Label className="text-xs">Minutos</Label>
                    <Input 
                        type="number" 
                        placeholder="00" 
                        value={corridaMin}
                        onChange={e => setCorridaMin(e.target.value)}
                    />
                </div>
                <span className="pb-2 font-bold">:</span>
                <div className="flex-1">
                    <Label className="text-xs">Segundos</Label>
                    <Input 
                        type="number" 
                        placeholder="00" 
                        max={59}
                        value={corridaSeg}
                        onChange={e => setCorridaSeg(e.target.value)}
                    />
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg flex justify-between items-center border">
        <span className="font-semibold text-lg">Média Final Prevista:</span>
        <span className={`text-3xl font-bold ${parseFloat(mediaPrevista) >= 6 ? 'text-blue-600' : 'text-red-600'}`}>
            {mediaPrevista}
        </span>
      </div>

      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea 
          name="observacoes" 
          placeholder="Ex: Aluno sentiu dores no joelho..." 
          defaultValue={initialData?.observacoes || ''} 
        />
      </div>

      <Button type="submit" className="w-full font-bold text-lg" disabled={loading}>
        {loading ? 'Salvando...' : (isEditing ? 'Atualizar TAF' : 'Lançar TAF')} <Save className="ml-2 w-5 h-5" />
      </Button>
    </form>
  )
}