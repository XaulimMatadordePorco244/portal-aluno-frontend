import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Award, 
  Users, 
  Clock, 
  GraduationCap, 
  Star
} from 'lucide-react';

export default function ConfiguracoesPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
        <p className="text-muted-foreground">Gerencie parâmetros gerais e regras de carreira.</p>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5" /> Regras de Promoção
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <Link href="/admin/configuracoes/regras/antiguidade">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-l-4 border-l-slate-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Clock className="h-5 w-5" />
                            Por Antiguidade
                        </CardTitle>
                        <CardDescription>Critérios de tempo e conceito</CardDescription>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Defina o tempo mínimo de interstício e nota comportamental para promoção regular.
                    </CardContent>
                </Card>
            </Link>

            <Link href="/admin/configuracoes/regras/merito-escolar">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <GraduationCap className="h-5 w-5" />
                            Mérito Escolar
                        </CardTitle>
                        <CardDescription>Critérios de desempenho acadêmico</CardDescription>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Configurar média escolar mínima e notas disciplinares exigidas na escola regular.
                    </CardContent>
                </Card>
            </Link>

            <Link href="/admin/configuracoes/regras/honra-ao-merito">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-l-4 border-l-amber-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Star className="h-5 w-5" />
                            Honra ao Mérito
                        </CardTitle>
                        <CardDescription>Critérios de destaque excepcional</CardDescription>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Configurar pontuação para alunos que se destacam acima da média da tropa.
                    </CardContent>
                </Card>
            </Link>

            <Link href="/admin/vagas">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-l-4 border-l-emerald-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="h-5 w-5" />
                            Quadro de Vagas
                        </CardTitle>
                        <CardDescription>Limites por patente</CardDescription>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Controle o número máximo de vagas disponíveis para promoção por antiguidade.
                    </CardContent>
                </Card>
            </Link>

        </div>
      </div>
    </div>
  );
}