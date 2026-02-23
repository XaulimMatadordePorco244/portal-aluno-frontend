"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";

const cleanCpf = (value: string) => value.replace(/\D/g, '');

export default function LoginPage() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        body: JSON.stringify({ cpf: cleanCpf(cpf), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha no login');
      }
      if (data.user.role === "ADMIN") {
        router.push('/admin');
        return;
      }

      if (data.user.role === "ALUNO") {
        router.push('/dashboard');
        return;
      }


    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleaned = cleanCpf(rawValue);
    if (cleaned.length <= 11) {
      let formatted = cleaned;
      if (cleaned.length > 3) formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
      if (cleaned.length > 6) formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
      if (cleaned.length > 9) formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
      setCpf(formatted);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-lg border">

        <div className="flex flex-col items-center text-center space-y-2">
          <div className="rounded-full bg-primary/5 p-3 mb-2">
            <Image
              src="/img/logo.svg"
              alt="Logo da Guarda Mirim"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Mural do Aluno</h1>
          <p className="text-sm text-muted-foreground">
            Entre com suas credenciais para acessar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                required
                value={cpf}
                onChange={handleCpfChange}
                disabled={isLoading}
                maxLength={14}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pl-9 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? "Ocultar senha" : "Mostrar senha"}
                </span>
              </Button>
            </div>
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full font-bold" disabled={isLoading} size="lg">
            {isLoading ? "Autenticando..." : "Entrar no Portal"}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground mt-4">
          &copy; {new Date().getFullYear()} Guarda Mirim de Naviraí-MS
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";