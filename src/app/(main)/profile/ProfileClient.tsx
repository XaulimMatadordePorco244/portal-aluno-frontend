"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/Input"; 
import { Label } from "@/components/ui/label";
import { UserCircle } from 'lucide-react'; 
import { Usuario, Cargo, PerfilAluno, Companhia, Escola } from '@prisma/client';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

type UserWithRelations = Usuario & {
  perfilAluno: (PerfilAluno & {
    cargo: Cargo | null;
    companhia: Companhia | null;
    escola: Escola | null; 
  }) | null;
};

const InfoRow = ({ label, value, className = "" }: { label: string, value: React.ReactNode, className?: string }) => (
  <div className={`py-3 border-b border-border/50 last:border-0 ${className}`}>
    <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
      {label}
    </span>
    <span className="text-sm md:text-base text-foreground font-medium">
      {value || <span className="text-muted-foreground italic font-normal">Não informado</span>}
    </span>
  </div>
);

export default function ProfileClient({ user }: { user: UserWithRelations }) {
  const [email, setEmail] = useState(user.email || '');
  const [,setIsLoading] = useState(false);

  const perfil = user.perfilAluno;

  const handleSaveEmail = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      alert('E-mail atualizado!');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b  border-border">
        <div className="shrink-0">
          {user.fotoUrl ? (
            <Image 
              src={user.fotoUrl} 
              alt="Foto" 
              width={100} 
              height={100} 
              className="rounded-full object-cover w-24 h-24 border border-border shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border border-border">
              <UserCircle className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <div className="text-center md:text-left space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {user.nome}
          </h1>
          
          <p className="text-lg font-medium text-primary">
            {perfil?.cargo?.nome || 'Sem Cargo'} 
            {perfil?.companhia && <span className="text-muted-foreground font-normal"> • {perfil.companhia.nome}</span>}
          </p>

          <p className="text-sm text-muted-foreground">
            Nome de Guerra: <strong className="text-foreground">{user.nomeDeGuerra}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="space-y-8">
          
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">Dados Institucionais</h3>
            <div className="bg-card rounded-lg border border-border px-4 shadow-sm">
              <InfoRow label="Número" value={perfil?.numero} />
              <InfoRow label="Ano de Ingresso" value={perfil?.anoIngresso} />
              
              <InfoRow 
                label="Conceito Atual" 
                value={perfil?.conceitoAtual ? Number(perfil.conceitoAtual).toFixed(2).replace('.', ',') : null} 
              />
              
              <InfoRow label="Situação" value={perfil?.foraDeData ? "Ingresso fora de data" : "Regular"} />
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">Dados Pessoais</h3>
            <div className="bg-card rounded-lg border border-border px-4 shadow-sm">
              <InfoRow label="CPF" value={user.cpf} />
              <InfoRow label="RG" value={`${user.rg || ''} ${user.rgEstadoEmissor ? `(${user.rgEstadoEmissor})` : ''}`} />
              <InfoRow label="Data de Nascimento" value={formatDate(user.dataNascimento)} />
              <InfoRow label="Endereço" value={perfil?.endereco} />
            </div>
          </section>

        </div>

        <div className="space-y-8">

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">Saúde e Aptidão</h3>
            <div className="bg-card rounded-lg border border-border px-4 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Tipo Sanguíneo" value={perfil?.tipagemSanguinea?.replace('_', ' ').replace('POSITIVO', '+').replace('NEGATIVO', '-')} />
                <InfoRow label="Gênero" value={user.genero === 'MASCULINO' ? 'Masculino' : user.genero === 'FEMININO' ? 'Feminino' : user.genero} />
              </div>
              <InfoRow label="Status de Aptidão Física" value={perfil?.aptidaoFisicaStatus?.replace(/_/g, ' ')} />
              {perfil?.aptidaoFisicaObs && (
                 <InfoRow label="Observações Médicas" value={perfil.aptidaoFisicaObs} />
              )}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">Escolaridade</h3>
            <div className="bg-card rounded-lg border border-border px-4 shadow-sm">
              <InfoRow label="Escola" value={perfil?.escola?.nome} />
              <InfoRow label="Série / Ano Escolar" value={perfil?.serieEscolar?.replace(/_/g, ' ')} />
              {perfil?.fazCursoExterno && (
                <InfoRow label="Curso Externo" value={perfil.cursoExternoDescricao} />
              )}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">Configurações de Acesso</h3>
            <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
              <form onSubmit={handleSaveEmail} className="space-y-3">
                <Label htmlFor="email" className="text-xs uppercase font-semibold text-muted-foreground">E-mail de Recuperação</Label>
                <div className="flex gap-3">
                  <Input 
                    id="email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background"
                    required
                    disabled
                  />
                </div>
              </form>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}