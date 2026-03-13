"use client";

import { useState } from "react";
import { Usuario } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { 
  Edit, MoreHorizontal, UserMinus, UserCircle, 
  RefreshCw, UserPlus, Shield, ShieldOff, Loader2 
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner"; 

import { inativarAluno, reativarAluno, gerirPrivilegiosAluno, TipoPromocao } from "./actions";

export function AlunoActions({ aluno }: { aluno: Usuario }) {
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [promoteType, setPromoteType] = useState<TipoPromocao>('PROMOVER_MANTER');
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = aluno.role === "ADMIN";
  const isInativo = aluno.status === "INATIVO";

  const handleInativar = async () => {
    if (confirm(`Tem certeza que deseja DESLIGAR o aluno "${aluno.nome}" da instituição?\n\nO acesso dele será bloqueado e o bloco de anotações atual será encerrado.`)) {
      const resultado = await inativarAluno(aluno.id);
      if (resultado.success) toast.success(resultado.message);
      else toast.error(resultado.message);
    }
  };

  const handleReativar = async (modo: 'ZERAR' | 'RESTAURAR') => {
    const msg = modo === 'RESTAURAR'
      ? `Deseja reativar "${aluno.nome}" e RESTAURAR o seu cargo e bloco de notas antigo?`
      : `Deseja reativar "${aluno.nome}" ZERANDO a sua carreira (voltando como Soldado/Base)?`;
      
    if (confirm(msg)) {
      const resultado = await reativarAluno(aluno.id, modo);
      if (resultado.success) toast.success(resultado.message);
      else toast.error(resultado.message);
    }
  };

  const handlePromoverSubmit = async () => {
    if (confirmText !== "PROMOVER") return;
    
    setIsLoading(true);
    const res = await gerirPrivilegiosAluno(aluno.id, promoteType);
    setIsLoading(false);
    
    if (res?.success) {
      toast.success(res.message);
      setIsPromoteOpen(false);
      setConfirmText(""); 
    } else {
      toast.error(res?.message || "Erro ao promover aluno.");
    }
  };

  const handleReverterAdmin = async () => {
    if (confirm(`Tem certeza que deseja REMOVER os privilégios de Admin de "${aluno.nome}"?\n\nEle voltará a ter apenas acesso de Aluno no sistema.`)) {
      const res = await gerirPrivilegiosAluno(aluno.id, 'REVERTER');
      if (res?.success) toast.success(res.message);
      else toast.error(res?.message || "Erro ao reverter privilégios.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          
          <DropdownMenuItem asChild>
            <Link href={`/admin/alunos/${aluno.id}`}>
              <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Ver Perfil Completo</span>
            </Link>
          </DropdownMenuItem>

          {!isInativo && (
            <DropdownMenuItem asChild>
              <Link href={`/admin/alunos/edit/${aluno.id}`}>
                <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Editar Dados</span>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {!isInativo && (
            <>
              {isAdmin ? (
                <DropdownMenuItem onClick={handleReverterAdmin} className="text-red-600 focus:text-red-600 focus:bg-red-50 font-medium cursor-pointer">
                  <ShieldOff className="mr-2 h-4 w-4" />
                  <span>Remover Privilégios</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => setIsPromoteOpen(true)} className="text-purple-600 focus:text-purple-600 focus:bg-purple-50 font-medium cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Promover a Admin</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
            </>
          )}

          {!isInativo && (
            <DropdownMenuItem onClick={handleInativar} className="text-orange-600 focus:text-orange-600 focus:bg-orange-50 font-medium cursor-pointer">
              <UserMinus className="mr-2 h-4 w-4" />
              <span>Desligar Aluno</span>
            </DropdownMenuItem>
          )}

          {isInativo && (
            <>
              <DropdownMenuItem onClick={() => handleReativar('RESTAURAR')} className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 font-medium cursor-pointer">
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Reativar (Restaurar)</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => handleReativar('ZERAR')} className="text-blue-600 focus:text-blue-600 focus:bg-blue-50 font-medium cursor-pointer">
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Reativar (Zerar Carreira)</span>
              </DropdownMenuItem>
            </>
          )}

        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isPromoteOpen} onOpenChange={setIsPromoteOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-600">
              <Shield className="h-5 w-5" />
              Promover a Administrador
            </DialogTitle>
            <DialogDescription>
              Você está prestes a dar acesso total ao sistema para <strong>{aluno.nome}</strong>. Como deseja tratar o histórico de aluno dele?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <RadioGroup 
              value={promoteType} 
              onValueChange={(val) => setPromoteType(val as TipoPromocao)}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 border p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                <RadioGroupItem value="PROMOVER_MANTER" id="manter" className="mt-1" />
                <Label htmlFor="manter" className="cursor-pointer">
                  <span className="block font-semibold">Manter Jornada Ativa</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    O aluno ganha acesso Admin, mas continua a receber notas, manter o cargo militar/escolar e participar das rotinas.
                  </span>
                </Label>
              </div>

              <div className="flex items-start space-x-3 border p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                <RadioGroupItem value="PROMOVER_ENCERRAR" id="encerrar" className="mt-1" />
                <Label htmlFor="encerrar" className="cursor-pointer">
                  <span className="block font-semibold">Encerrar Jornada</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    O aluno vira Admin, e o seu ciclo como aluno é encerrado no histórico (como se fosse uma graduação/efetivação).
                  </span>
                </Label>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label className="text-destructive font-semibold">
                Digite PROMOVER para confirmar
              </Label>
              <Input 
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="PROMOVER"
                className="border-destructive/50 focus-visible:ring-destructive"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPromoteOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handlePromoverSubmit}
              disabled={confirmText !== "PROMOVER" || isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
              Confirmar Promoção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}