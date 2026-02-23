"use client"

import { useTransition } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import { deleteInformativo } from "../actions"

export function DeleteInformativoButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  

  const handleDelete = () => {
    if (!confirm("Tem certeza que deseja excluir este informativo?")) return

    startTransition(async () => {
      const result = await deleteInformativo(id)
      if (result.error) {
        toast.error("Erro ao excluir: " + result.error)
      } else {
        toast.success("Informativo removido com sucesso.")
      }
    })
  }

  return (
    <Button 
      variant="destructive" 
      size="icon" 
      onClick={handleDelete} 
      disabled={isPending}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}