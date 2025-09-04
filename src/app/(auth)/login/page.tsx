

"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileText, Lock, Eye, LoaderCircle } from "lucide-react"; 

export default function LoginPage() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  

  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(''); 

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    

    setError('');
    setIsLoading(true);

  
    setTimeout(() => {
  
      if (password === '123456') {
      
        alert(`Login bem-sucedido!\nBem-vindo, CPF: ${cpf}`);
        
      } else {
        setError('CPF ou senha inválidos. Tente novamente.');
      }

      
      setIsLoading(false);
    }, 2000); 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
        
        <img 
          className="block mx-auto h-24 w-24"
          src="/logo.png" 
          alt="Logo da Guarda Mirim"
        />
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black">
            Mural - Guarda Mirim
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              id="cpf" 
              type="text" 
              required
              placeholder="000.000.000-00"
              className="pl-10"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              disabled={isLoading} 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              id="password" 
              type="password" 
              required
              placeholder="Password"
              className="pl-10 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading} 
            />
            <Eye className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 cursor-pointer text-gray-500" />
          </div>

          {}
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <Button type="submit" className="w-full !mt-6 bg-blue-600 text-white hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle className="animate-spin" /> 
            ) : (
              'Entrar' 
            )}
          </Button>
        </form>

        <div className="text-center">
          <a href="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
            Esqueceu a Senha?
          </a>
        </div>

      </div>
    </div>
  );
}