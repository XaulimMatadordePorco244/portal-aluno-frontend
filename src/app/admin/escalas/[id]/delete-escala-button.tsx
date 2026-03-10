"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteEscalaButton({ escalaId }: { escalaId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir esta escala? Esta ação não pode ser desfeita.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/escalas/${escalaId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao excluir a escala");
      }

      router.push("/admin/escalas");
      router.refresh();
      
    } catch (error) {
      console.error("[DELETE_ERROR]", error);
      alert("Ocorreu um erro ao excluir a escala. Tente novamente.");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? "Excluindo..." : "Excluir Escala"}
    </button>
  );
}