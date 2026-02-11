import { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Save, Building2 } from 'lucide-react'
import prisma from '@/lib/prisma'
import { atualizarSessao, listarAlunosParaSelect } from './actions' 
import { redirect } from 'next/navigation'
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth'
import { ResponsavelSelect } from './responsavel-select' 

export const metadata: Metadata = { title: 'Admin - Sessões e Funções' }

export default async function OrganizacaoPage() {
  const user = await getCurrentUserWithRelations()
  if (!user || !canAccessAdminArea(user)) redirect('/dashboard')

  const sessoes = await prisma.gmSessao.findMany({ orderBy: { ordem: 'asc' } })
  
  const alunosOpcoes = await listarAlunosParaSelect()

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Estrutura Organizacional</h1>
        <p className="text-muted-foreground">Gerencie as Sessões (G1-G9).</p>
      </div>

      <Tabs defaultValue="sessoes" className="w-full">
        <TabsList>
          <TabsTrigger value="sessoes" className="gap-2"><Building2 className="w-4 h-4"/> Sessões </TabsTrigger>
        </TabsList>

        <TabsContent value="sessoes" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {sessoes.map((sessao) => (
              <form key={sessao.id} action={atualizarSessao} className="group">
                <input type="hidden" name="id" value={sessao.id} />
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted font-bold text-lg">
                      {sessao.codigo}
                    </div>
                    
                    <div className="flex-1 grid gap-4 w-full md:grid-cols-2">
                       <div className="space-y-1">
                          <label className="text-xs text-muted-foreground ml-1">Responsáveis (Oficiais)</label>
                          <ResponsavelSelect 
                              valorInicial={sessao.responsaveis} 
                              opcoes={alunosOpcoes} 
                          />
                       </div>

                       <div className="space-y-1">
                          <label className="text-xs text-muted-foreground ml-1">Atribuições</label>
                          <Input name="atribuicoes" defaultValue={sessao.atribuicoes} className="h-10" />
                       </div>
                    </div>

                    <Button size="icon" variant="ghost" type="submit" className="opacity-0 group-hover:opacity-100 transition-opacity self-end md:self-center">
                      <Save className="w-4 h-4 text-primary" />
                    </Button>
                  </CardContent>
                </Card>
              </form>
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}