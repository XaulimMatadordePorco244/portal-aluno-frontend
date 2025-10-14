"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/Button"; 
import { Input } from "@/components/ui/Input"; 
import { Label } from "@/components/ui/label";
import { UserCircle, Save } from 'lucide-react';
import { User, Cargo } from '@prisma/client';
import FormattedName from '@/components/FormattedName';


type UserWithCargo = User & {
  cargo?: Cargo | null;
};

const InfoField = ({ label, value }: { label: string; value: string | number | null | undefined; }) => (
  <div className="border-b py-3">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-md font-semibold text-foreground">{value || 'Não informado'}</p>
  </div>
);

export default function ProfileClient({ user }: { user: UserWithCargo }) {
  const [email, setEmail] = useState(user.email || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      console.log('Novo e-mail para salvar:', email);
      alert('E-mail de recuperação atualizado com sucesso! (Simulação)');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="bg-card rounded-xl shadow-lg p-8 max-w-4xl mx-auto border">
        
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b">
          <UserCircle className="w-24 h-24 text-muted-foreground" />
          <div>
              <h1 className="text-3xl text-foreground">
              <FormattedName fullName={user.nome} warName={user.nomeDeGuerra} />
            </h1>
            <p className="text-md text-muted-foreground">Nº: {user.numero || 'N/A'}</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground mb-2">Dados Institucionais</h2>
              <InfoField label="Companhia" value={user.companhia} />
              <InfoField label="Graduação/Posto" value={user.cargo?.nome} />
              <InfoField label="Ano de Ingresso" value={user.anoIngresso} />
              <InfoField label="Conceito" value={user.conceito} />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground mb-2">Informações de Acesso</h2>
                    <div className="p-3 bg-accent border rounded-md">
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                  E-mail de Recuperação
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Este e-mail será usado para recuperar sua senha. Mantenha-o sempre atualizado.
                </p>
              </div>
            </div>
          </div>

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