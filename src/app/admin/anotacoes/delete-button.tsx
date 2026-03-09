"use client";

import { useTransition } from "react";
import { Trash, Loader2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteAnotacao } from "@/actions/anotacoes";

interface DeleteButtonProps {
  id: string;
}

export function DeleteAnotacaoButton({ id }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const confirm = window.confirm("Tem certeza que deseja excluir este registro?");
    
    if (confirm) {
      startTransition(async () => {
        await deleteAnotacao(id);
    
      });
    }
  };

  return (
    <DropdownMenuItem 
      onClick={handleDelete}
      disabled={isPending}
      className="text-destructive focus:bg-destructive/5 focus:text-destructive cursor-pointer flex items-center gap-2 font-medium"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash className="h-4 w-4" />
      )}
      {isPending ? "Excluindo..." : "Excluir Registro"}
    </DropdownMenuItem>
  );
}