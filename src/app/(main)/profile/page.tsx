// src/app/(main)/profile/page.tsx

"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { UserCircle, Save } from 'lucide-react';

// Componente para um campo de informação (AGORA SEM ÍCONE)
const InfoField = ({ label, value }: { label: string; value: string | number; }) => (
  <div className="border-b py-3">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-md font-semibold text-gray-800">{value}</p>
  </div>
);

export default function ProfilePage() {
  // Dados de exemplo
  const aluno = {
    nomeCompleto: 'Michael Santos',
    numero: '2024-015',
    conceito: 'Excelente',
    companhia: '1ª Companhia',
    graduacao: 'Aluno Soldado',
    anoIngresso: 2024,
    emailInicial: 'michael.santos@email.com',
  };

  const [email, setEmail] = useState(aluno.emailInicial);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      console.log('Novo e-mail para salvar:', email);
      alert('E-mail de recuperação atualizado com sucesso!');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto border border-gray-200">
        
        {/* Cabeçalho do Perfil */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b">
          <UserCircle className="w-24 h-24 text-gray-400" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{aluno.nomeCompleto}</h1>
            <p className="text-md text-gray-600">Nº: {aluno.numero}</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            
            {/* Coluna da Esquerda - Dados Institucionais */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Dados Institucionais</h2>
              <InfoField label="Companhia" value={aluno.companhia} />
              <InfoField label="Graduação" value={aluno.graduacao} />
              <InfoField label="Ano de Ingresso" value={aluno.anoIngresso} />
              <InfoField label="Conceito" value={aluno.conceito} />
            </div>

            {/* Coluna da Direita - E-mail Editável */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Informações de Acesso</h2>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Label htmlFor="email" className="text-sm font-medium text-gray-600">
                  E-mail de Recuperação
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Este e-mail será usado para recuperar sua senha. Mantenha-o sempre atualizado.
                </p>
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="mt-8 pt-6 border-t flex justify-end">
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Salvando...' : 'Salvar E-mail'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}