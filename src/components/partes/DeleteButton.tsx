"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteButton({ parteId }: { parteId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja EXCLUIR este rascunho? Esta ação não pode ser desfeita.")) {
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/partes/${parteId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Erro ao excluir");

            router.push("/partes"); 
            router.refresh(); 

        } catch {
            alert("Erro ao excluir parte.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isLoading}
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Excluir
        </Button>
    );
}