"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image'; 
import { Button } from "@/components/ui/Button"; 
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha no login');
      }

      router.push('/dashboard');

    } catch (err) { 
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        
        {}
        <Image 
          src="/logo.png" 
          alt="Logo da Guarda Mirim" 
          width={120} 
          height={120} 
          className="mx-auto"
          priority 
        />
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Mural do Aluno</h1>
          <p className="text-gray-500">Acesse sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              type="text"
              placeholder="Digite seu CPF"
              required
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Carregando..." : "Entrar"}
          </Button>
        </form>
        <div className="text-center">
            <a href="/forgot-password" className="text-sm text-primary hover:underline">
              Esqueceu a Senha?
            </a>
        </div>
      </div>
    </div>
  );
}