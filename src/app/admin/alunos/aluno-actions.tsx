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
import { Edit, MoreHorizontal, Trash2, UserCircle } from "lucide-react";
import Link from "next/link";
import { deleteAluno } from "./actions";
import { toast } from "sonner"; 

export function AlunoActions({ aluno }: { aluno: Usuario }) {
  
  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja apagar o aluno "${aluno.nome}"? Esta ação não pode ser desfeita e apagará todo o histórico dele.`)) {
      
      const resultado = await deleteAluno(aluno.id);

      if (resultado.success) {
        toast.success(resultado.message);
      } else {
        toast.error(resultado.message);
      }
    }
  };

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
          <Link href={`/admin/alunos/edit/${aluno.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href={`/admin/alunos/${aluno.id}`}>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Ver Perfil Completo</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Apagar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}