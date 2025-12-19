'use client'

import { useState } from 'react'
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

interface GerenciadorProps {
  regras: RegraTaf[]
}

export default function TabelaGerenciador({ regras }: GerenciadorProps) {
  const masc = regras.filter(r => r.genero === 'MASCULINO')
  const fem = regras.filter(r => r.genero === 'FEMININO')

  return (
    <Tabs defaultValue="MASCULINO" className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="MASCULINO">Masculino</TabsTrigger>
          <TabsTrigger value="FEMININO">Feminino</TabsTrigger>
        </TabsList>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Valores de tempo estão em segundos.</span>
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
        <Card key={exercicio} className="overflow-hidden">
          <CardHeader className="bg-muted/40 py-3">
            <CardTitle className="text-base font-bold flex justify-between items-center">
                {exercicio}
                <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded border">
                    {itens[0].tipoMedida === 'TEMPO_SEG' ? 'Segundos' : 'Repetições'}
                </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
                <thead className="bg-muted/20 text-muted-foreground">
                    <tr>
                        <th className="px-4 py-2 text-left font-medium w-20">Mín</th>
                        <th className="px-4 py-2 text-left font-medium w-20">Máx</th>
                        <th className="px-4 py-2 text-left font-medium w-20">Nota</th>
                        <th className="w-10"></th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {itens.map(item => (
                        <LinhaEditavel key={item.id} item={item} />
                    ))}
                </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function LinhaEditavel({ item }: { item: RegraTaf }) {
    return (
        <tr className="hover:bg-muted/10 group">
            <form action={async (formData) => {
                const res = await atualizarRegra(formData)
                if(res.success) toast.success('Atualizado!')
                else toast.error('Erro ao atualizar')
            }}>
                <input type="hidden" name="id" value={item.id} />
                
                <td className="p-2">
                    <Input 
                        name="valorMinimo" 
                        defaultValue={item.valorMinimo} 
                        className="h-8 w-16 px-2 text-center" 
                        type="number" 
                        step="0.1"
                    />
                </td>
                <td className="p-2">
                    <Input 
                        name="valorMaximo" 
                        defaultValue={item.valorMaximo ?? ''} 
                        placeholder="∞"
                        className="h-8 w-16 px-2 text-center" 
                        type="number" 
                        step="0.1"
                    />
                </td>
                <td className="p-2">
                    <div className="flex items-center gap-1 font-bold text-blue-600">
                        <Input 
                            name="nota" 
                            defaultValue={item.nota} 
                            className="h-8 w-16 px-2 text-center font-bold" 
                            type="number" 
                            step="0.1"
                            max="10"
                        />
                    </div>
                </td>
                <td className="p-2 text-right">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        type="submit"
                        title="Salvar Linha"
                    >
                        <Save className="h-4 w-4 text-primary" />
                    </Button>
                </td>
            </form>
        </tr>
    )
}