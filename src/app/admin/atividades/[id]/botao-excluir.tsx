"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export function BotaoExcluirAtividade({ id }: { id: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta atividade? Ela sumirá do painel de todos os alunos.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/atividades/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error("Falha ao excluir");

      toast.success("Atividade excluída com sucesso!");
      router.push('/admin/atividades');
      router.refresh();
    } catch (error) {
      toast.error("Erro ao excluir atividade.");
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleDelete} 
      disabled={isDeleting}
    >
      <Trash2 className="w-4 h-4 mr-2" />
      {isDeleting ? "A excluir..." : "Excluir Tarefa"}
    </Button>
  );
}