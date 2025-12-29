import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  AlertCircle, 
  Home, 
  User, 
  ArrowLeft
} from 'lucide-react';

export default function PromoverNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="w-full max-w-md border-dashed border-2">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-muted p-3 rounded-full">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Aluno Não Encontrado</CardTitle>
            <CardDescription className="text-base">
              Desculpe, não foi possível encontrar o aluno para realizar a transição de cargo.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Verifique se o ID do aluno está correto ou se você tem as permissões necessárias para acessar esta página.
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Erro 404 - Recurso não encontrado</span>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin">
              <Home className="h-4 w-4" />
              Painel Admin
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin/alunos">
              <User className="h-4 w-4" />
              Gerenciar Alunos
            </Link>
          </Button>
          
          <Button asChild className="gap-2">
            <Link href="/admin/alunos/cargos">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Lista
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}