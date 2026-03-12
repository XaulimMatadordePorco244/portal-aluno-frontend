'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select'
import { Calculator, Save, ArrowLeft, AlertCircle, Clock, FileEdit, School } from 'lucide-react'
import { salvarBoletim } from '@/app/admin/alunos/actions/boletim-actions' 
import { toast } from 'sonner' 

interface BoletimFormProps {
  alunoId: string
  dadosIniciais?: {
    mediaB1?: number | null
    mediaB2?: number | null
    mediaB3?: number | null
    mediaB4?: number | null
    faltasB1?: number | null
    faltasB2?: number | null
    faltasB3?: number | null
    faltasB4?: number | null
    observacoes?: string | null
    anoLetivo: number
    situacao?: string | null
  }
  dadosEscolares: {
    escola: string | null
    serie: string | null
    turma: string | null
  }
  anoAtual: number
}

export default function BoletimForm({ alunoId, dadosIniciais, dadosEscolares, anoAtual }: BoletimFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [situacao, setSituacao] = useState(dadosIniciais?.situacao || 'CURSANDO')

  const [notas, setNotas] = useState({
    b1: dadosIniciais?.mediaB1?.toString() || '',
    b2: dadosIniciais?.mediaB2?.toString() || '',
    b3: dadosIniciais?.mediaB3?.toString() || '',
    b4: dadosIniciais?.mediaB4?.toString() || '',
  })

  const [faltas, setFaltas] = useState({
    b1: dadosIniciais?.faltasB1?.toString() || '0',
    b2: dadosIniciais?.faltasB2?.toString() || '0',
    b3: dadosIniciais?.faltasB3?.toString() || '0',
    b4: dadosIniciais?.faltasB4?.toString() || '0',
  })

  const [vermelhas, setVermelhas] = useState({
    b1: '0',
    b2: '0',
    b3: '0',
    b4: '0',
  })
  
  const [previaMF, setPreviaMF] = useState<string>('-')
  const [totalFaltas, setTotalFaltas] = useState<number>(0)
  const [totalVermelhas, setTotalVermelhas] = useState<number>(0)

  useEffect(() => {
    const vals = [parseFloat(notas.b1), parseFloat(notas.b2), parseFloat(notas.b3), parseFloat(notas.b4)]
    const notasValidas = vals.filter(n => !isNaN(n))
    
    if (notasValidas.length > 0) {
      const soma = notasValidas.reduce((a, b) => a + b, 0)
      const media = soma / 4 
      setPreviaMF(media.toFixed(1))
    } else {
      setPreviaMF('-')
    }
  }, [notas])

  useEffect(() => {
    const vals = [
        parseInt(faltas.b1) || 0, 
        parseInt(faltas.b2) || 0, 
        parseInt(faltas.b3) || 0, 
        parseInt(faltas.b4) || 0
    ]
    const total = vals.reduce((a, b) => a + b, 0)
    setTotalFaltas(total)
  }, [faltas])

  useEffect(() => {
    const vals = [
        parseInt(vermelhas.b1) || 0, 
        parseInt(vermelhas.b2) || 0, 
        parseInt(vermelhas.b3) || 0, 
        parseInt(vermelhas.b4) || 0
    ]
    const total = vals.reduce((a, b) => a + b, 0)
    setTotalVermelhas(total)
  }, [vermelhas])

  const handleNotaChange = (val: string, key: string) => {
    setNotas(prev => ({ ...prev, [key]: val }))
  }

  const handleFaltaChange = (val: string, key: string) => {
    setFaltas(prev => ({ ...prev, [key]: val }))
  }

  const handleVermelhaChange = (val: string, key: string) => {
    setVermelhas(prev => ({ ...prev, [key]: val }))
  }

  const getColor = (val: string) => {
    const num = parseFloat(val)
    if (isNaN(num)) return 'text-foreground'
    return num < 6.0 ? 'text-red-600 font-bold' : 'text-blue-600 font-bold'
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    formData.append('alunoId', alunoId)
    formData.append('situacao', situacao) 
    const res = await salvarBoletim(formData)
    
    if (res.success) {
      toast.success(res.message)
      router.refresh() 
    } else {
      toast.error(res.message)
    }
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" type="button" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <div className="text-sm text-muted-foreground font-medium border px-3 py-1 rounded-md">
            Ano Letivo: {dadosIniciais?.anoLetivo || anoAtual}
            <input type="hidden" name="anoLetivo" value={dadosIniciais?.anoLetivo || anoAtual} />
        </div>
      </div>

      <div className="bg-muted/30 border border-border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full hidden sm:block">
            <School className="h-6 w-6 text-primary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Escola Atual</p>
              <p className="text-sm font-semibold text-foreground">{dadosEscolares?.escola || 'Não informada'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Série</p>
              <p className="text-sm font-semibold text-foreground">{dadosEscolares?.serie || 'Não informada'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Turma</p>
              <p className="text-sm font-semibold text-foreground">{dadosEscolares?.turma || 'Não informada'}</p>
            </div>
          </div>
        </div>
        
        <Button variant="outline" size="icon" asChild title="Editar Dados Escolares" className="shrink-0 ml-4">
          <Link href={`/admin/alunos/${alunoId}/dados-escolares`}>
            <FileEdit className="h-4 w-4 text-primary" />
          </Link>
        </Button>
      </div>

      <Card className="bg-muted/30 border-primary/10">
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((bim) => (
                <div key={bim} className="bg-background p-4 rounded-lg border shadow-sm space-y-3">
                    <span className="font-bold text-sm text-muted-foreground uppercase flex justify-between">
                        {bim}º Bimestre
                    </span>
                    
                    <div>
                        <Label className="text-xs mb-1 block">Média (0-10)</Label>
                        <Input 
                            name={`mediaB${bim}`} 
                            type="number" 
                            step="0.1" 
                            min="0" max="10"
                            placeholder="-"
                            value={notas[`b${bim}` as keyof typeof notas]}
                            onChange={(e) => handleNotaChange(e.target.value, `b${bim}`)}
                            className={`text-lg h-10 ${getColor(notas[`b${bim}` as keyof typeof notas])}`}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-[10px] mb-1 block truncate">Faltas</Label>
                            <Input 
                                name={`faltasB${bim}`} 
                                type="number" 
                                min="0"
                                className="h-8 text-sm px-2"
                                value={faltas[`b${bim}` as keyof typeof faltas]}
                                onChange={(e) => handleFaltaChange(e.target.value, `b${bim}`)}
                            />
                        </div>
                        <div>
                            <Label className="text-[10px] mb-1 block truncate text-red-600">Vermelhas</Label>
                            <Input 
                                type="number" 
                                min="0"
                                className="h-8 text-sm px-2 border-red-100 focus-visible:ring-red-500"
                                value={vermelhas[`b${bim}` as keyof typeof vermelhas]}
                                onChange={(e) => handleVermelhaChange(e.target.value, `b${bim}`)}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Situação Anual do Aluno</Label>
                <Select value={situacao} onValueChange={setSituacao}>
                  <SelectTrigger className={`h-12 text-base font-semibold ${
                    situacao === 'APROVADO' ? 'text-emerald-600 bg-emerald-50' :
                    situacao === 'REPROVADO' ? 'text-red-600 bg-red-50' : ''
                  }`}>
                    <SelectValue placeholder="Selecione a situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CURSANDO">Em Cursando / Pendente</SelectItem>
                    <SelectItem value="APROVADO">Aprovado</SelectItem>
                    <SelectItem value="RECUPERACAO">Em Recuperação Final</SelectItem>
                    <SelectItem value="REPROVADO">Reprovado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Atenção: O aluno só concorrerá às promoções se o status for marcado manualmente como "Aprovado".
                </p>
              </div>

              <div className="space-y-2">
                  <Label>Observações Escolares</Label>
                  <Textarea 
                    name="observacoes" 
                    defaultValue={dadosIniciais?.observacoes || ''} 
                    className="h-24 resize-none"
                    placeholder="Ex: Aluno com dificuldade em matemática; Apresentou atestado médico no B2..." 
                  />
              </div>
          </div>
          
          <div className="w-full md:w-1/3 space-y-4">
             <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-4">
                
                <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                   <div className="flex items-center gap-2 text-primary font-medium">
                       <Calculator className="h-5 w-5" />
                       <span>Prévia MF</span>
                   </div>
                   <span className={`text-3xl font-bold ${parseFloat(previaMF) < 6 && previaMF !== '-' ? 'text-red-600' : 'text-foreground'}`}>
                       {previaMF}
                   </span>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                       <Clock className="h-4 w-4" />
                       <span>Total Faltas</span>
                   </div>
                   <span className="text-xl font-bold text-foreground">
                       {totalFaltas}
                   </span>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
                       <AlertCircle className="h-4 w-4" />
                       <span>Total Vermelhas</span>
                   </div>
                   <span className="text-xl font-bold text-red-600">
                       {totalVermelhas}
                   </span>
                   <input type="hidden" name="qtdNotasVermelhas" value={totalVermelhas} />
                </div>

             </div>

             <Button type="submit" size="lg" className="w-full font-bold shadow-lg" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Boletim'} <Save className="ml-2 h-4 w-4" />
             </Button>
          </div>
      </div>
    </form>
  )
}