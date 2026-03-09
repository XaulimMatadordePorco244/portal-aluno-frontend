"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";


export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    try {
      router.back();
    } catch {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-background to-secondary/5 p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 bg-destructive/20 rounded-full animate-pulse" />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-destructive/10 backdrop-blur-sm">
            <ShieldAlert className="h-14 w-14 text-destructive animate-bounce" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-7xl font-black bg-linear-to-r from-destructive to-destructive/60 bg-clip-text text-transparent">
            404
          </h1>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Página não encontrada
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              A página ou recurso que você está procurando não existe, foi movido 
              ou você não tem permissão para acessá-lo.
            </p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 text-sm text-muted-foreground">
          <p>Você pode tentar:</p>
          <ul className="mt-2 space-y-1">
            <li>• Verificar se a URL está correta</li>
            <li>• Voltar para a página anterior</li>
            <li>• Ir para o início do dashboard</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            variant="outline" 
            size="lg"
            className="flex-1 gap-2 hover:bg-destructive/10 transition-all"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
          
          <Button 
            size="lg"
            className="flex-1 gap-2 group"
            asChild
          >
            <Link href="/">
              <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>Ir para o Início</span>
            </Link>
          </Button>
        </div>

       
      </div>
    </div>
  );
}