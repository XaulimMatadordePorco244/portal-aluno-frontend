import prisma from "@/lib/prisma";
import { CheckCircle2, XCircle, AlertTriangle, User, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils"; 

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ValidationResultPage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.usuario.findFirst({
    where: {
      perfilAluno: { id: id }
    },
    include: {
      perfilAluno: { include: { cargo: true, companhia: true } }
    }
  });

  if (!user) {
    return <InvalidState message="QR Code inválido ou registro não encontrado no sistema." />;
  }

  const isActive = user.status === 'ATIVO';
  const cargo = user.perfilAluno?.cargo?.nome || "Não Informado";
  const numero = user.perfilAluno?.numero || "N/A";
  const nomeGuerra = user.perfilAluno?.nomeDeGuerra || "Aluno";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-6 transition-colors duration-300">
      
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

        <div className={cn(
            "relative p-6 text-center overflow-hidden",
            isActive ? "bg-emerald-600 dark:bg-emerald-700" : "bg-destructive"
        )}>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white to-transparent" />
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm mb-3 shadow-sm">
                    {isActive ? 
                        <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} /> : 
                        <XCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                    }
                </div>
                <h1 className="text-2xl font-bold text-white uppercase tracking-wider drop-shadow-md">
                    {isActive ? "Documento Válido" : "Documento Inválido"}
                </h1>
                <p className="text-white/90 text-xs font-medium mt-1 uppercase tracking-widest opacity-80">
                    Sistema de Verificação 
                </p>
            </div>
        </div>
        <div className="p-6">
            
            <div className="flex flex-col items-center sm:flex-row gap-5 mb-8">
                <div className={cn(
                    "relative w-24 h-28 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 shadow-sm shrink-0",
                    isActive ? "border-emerald-600/30 dark:border-emerald-500/30" : "border-destructive/30"
                )}>
                    {user.fotoUrl ? (
                        <Image src={user.fotoUrl} alt="Foto do Aluno" fill className="object-cover" priority />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-muted text-muted-foreground">
                            <User className="w-8 h-8 mb-1 opacity-50" />
                            <span className="text-[10px] font-bold uppercase">Sem Foto</span>
                        </div>
                    )}
                </div>

                <div className="text-center sm:text-left flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-foreground leading-tight wrap-break-word">
                        {user.nome}
                    </h2>
                    <p className="text-sm text-muted-foreground uppercase font-medium mt-1 tracking-wide">
                        {nomeGuerra}
                    </p>
                    <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-secondary text-secondary-foreground border border-border">
                        {cargo}
                    </div>
                </div>
            </div>

            <div className="bg-muted/30 rounded-lg border border-border p-1">
                <div className="divide-y divide-border">
                    <InfoRow label="Número" value={numero} />
                    <InfoRow label="CPF" value={user.cpf} />
                    <InfoRow label="Companhia" value={user.perfilAluno?.companhia?.nome || "-"} />
                    <InfoRow 
                        label="Situação Cadastral" 
                        value={user.status} 
                        isStatus 
                        statusColor={isActive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"} 
                    />
                </div>
            </div>

            <div className="mt-8 space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground opacity-60">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verificado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <Link href="/validar" className="block">
                    <Button variant="outline" className="w-full h-11 text-base font-medium border-border hover:bg-muted/50 transition-all">
                        Realizar Nova Consulta
                    </Button>
                </Link>
            </div>

        </div>
      </div>

    </div>
  );
}

interface InfoRowProps {
    label: string;
    value: string;
    isStatus?: boolean;
    statusColor?: string;
}

function InfoRow({ label, value, isStatus, statusColor }: InfoRowProps) {
    return (
        <div className="flex justify-between items-center py-3 px-3 hover:bg-muted/40 transition-colors">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
            <span className={cn(
                "text-sm font-medium text-right truncate pl-4",
                isStatus ? cn("font-bold", statusColor) : "text-foreground"
            )}>
                {value}
            </span>
        </div>
    )
}

function InvalidState({ message }: { message: string }) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-card border border-border p-8 rounded-xl shadow-lg text-center max-w-sm w-full animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Registro Não Encontrado</h2>
                <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                    {message}
                </p>
                <Link href="/validar">
                    <Button size="lg" className="w-full font-bold">Voltar para Validação</Button>
                </Link>
            </div>
        </div>
    )
}