"use client";

import { Usuario } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, UserMinus, UserCircle, RefreshCw, UserPlus } from "lucide-react";
import Link from "next/link";
import { inativarAluno, reativarAluno } from "./actions";
import { toast } from "sonner"; 

export function AlunoActions({ aluno }: { aluno: Usuario }) {
  
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

  const isInativo = aluno.status === "INATIVO";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        
        <DropdownMenuItem asChild>
          <Link href={`/admin/alunos/${aluno.id}`}>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Ver Perfil Completo</span>
          </Link>
        </DropdownMenuItem>

        {!isInativo && (
          <DropdownMenuItem asChild>
            <Link href={`/admin/alunos/edit/${aluno.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Editar Dados</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

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
  );
}