'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Save, AlertCircle } from 'lucide-react'
import { atualizarRegra } from './actions'
import { toast } from 'sonner'

type RegraTaf = {
  id: string
  genero: string
  exercicio: string
  tipoMedida: string
  valorMinimo: number
  valorMaximo: number | null
  nota: number
}

export default function TabelaGerenciador({ regras }: { regras: RegraTaf[] }) {
  const masc = regras.filter(r => r.genero === 'MASCULINO')
  const fem = regras.filter(r => r.genero === 'FEMININO')

  return (
    <Tabs defaultValue="MASCULINO" className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="MASCULINO">Masculino</TabsTrigger>
          <TabsTrigger value="FEMININO">Feminino</TabsTrigger>
        </TabsList>
        <div className="text-sm text-muted-foreground flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded dark:text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            <span>Atenção: Tempos de corrida/barra devem ser em segundos totais.</span>
        </div>
      </div>

      <TabsContent value="MASCULINO">
        <ListaExercicios dados={masc} />
      </TabsContent>

      <TabsContent value="FEMININO">
        <ListaExercicios dados={fem} />
      </TabsContent>
    </Tabs>
  )
}

function ListaExercicios({ dados }: { dados: RegraTaf[] }) {
  const grupos = dados.reduce((acc, curr) => {
    if (!acc[curr.exercicio]) acc[curr.exercicio] = []
    acc[curr.exercicio].push(curr)
    return acc
  }, {} as Record<string, RegraTaf[]>)

  Object.keys(grupos).forEach(key => {
    grupos[key].sort((a, b) => b.nota - a.nota)
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(grupos).map(([exercicio, itens]) => (
        <Card key={exercicio} className="border shadow-sm">
          <CardHeader className="bg-muted/30 py-3 border-b">
            <CardTitle className="text-base font-bold flex justify-between items-center uppercase tracking-wide">
                {exercicio}
                <span className="text-[10px] font-normal text-muted-foreground bg-background px-2 py-1 rounded border shadow-sm">
                    {itens[0].tipoMedida === 'TEMPO_SEG' ? 'Segundos' : 'Repetições'}
                </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-[80px_80px_80px_1fr] gap-2 p-2 bg-muted/10 text-muted-foreground text-xs font-bold uppercase border-b text-center">
                <div>Mínimo</div>
                <div>Máximo</div>
                <div>Nota</div>
                <div>Ação</div>
            </div>

            <div className="divide-y max-h-[400px] overflow-y-auto">
                {itens.map(item => (
                    <LinhaEditavel key={item.id} item={item} />
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function LinhaEditavel({ item }: { item: RegraTaf }) {
    return (
        <form 
            action={async (formData) => {
                const res = await atualizarRegra(formData)
                if(res.success) toast.success('Atualizado!')
                else toast.error('Erro ao atualizar')
            }}
            className="grid grid-cols-[80px_80px_80px_1fr] gap-2 p-2 items-center hover:bg-blue-50/50 dark:hover:bg-blue-900/10 group transition-all duration-200"
        >
            <input type="hidden" name="id" value={item.id} />
            
            <div className="flex justify-center">
                <Input 
                    name="valorMinimo" 
                    defaultValue={item.valorMinimo} 
                    className="h-8 w-full px-1 text-center font-medium bg-background/50 focus:bg-background border-transparent hover:border-input focus:border-primary transition-all" 
                    type="number" 
                    step="0.1"
                />
            </div>

            <div className="flex justify-center">
                <Input 
                    name="valorMaximo" 
                    defaultValue={item.valorMaximo ?? ''} 
                    placeholder="∞"
                    className="h-8 w-full px-1 text-center font-medium bg-background/50 focus:bg-background border-transparent hover:border-input focus:border-primary transition-all" 
                    type="number" 
                    step="0.1"
                />
            </div>

            <div className="flex justify-center">
                <div className="relative w-full">
                    <Input 
                        name="nota" 
                        defaultValue={item.nota} 
                        className="h-8 w-full px-1 text-center font-bold text-blue-600 bg-blue-50/50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900 focus:ring-blue-500" 
                        type="number" 
                        step="0.1"
                        max="10"
                    />
                </div>
            </div>

            <div className="flex justify-center">
                <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-primary/10"
                    type="submit"
                    title="Salvar alteração"
                >
                    <Save className="h-4 w-4" />
                </Button>
            </div>
        </form>
    )
}