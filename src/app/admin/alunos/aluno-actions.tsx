"use client";

import { User } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteAluno } from "./actions";

export function AlunoActions({ aluno }: { aluno: User }) {
  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja apagar o aluno "${aluno.nome}"? Esta ação não pode ser desfeita.`)) {
      const formData = new FormData();
      formData.append('id', aluno.id);
      if (aluno.fotoUrl) {
        formData.append('fotoUrl', aluno.fotoUrl);
      }
      deleteAluno(formData);
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
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Apagar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}