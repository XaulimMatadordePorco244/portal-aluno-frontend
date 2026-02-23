'use client'

import { Button } from '@/components/ui/Button'
import { marcarComoLida } from '@/app/actions/feedback-actions'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function BotaoMarcarLida({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await marcarComoLida(id)
    if (res.success) {
      toast.success('Marcada como lida')
    } else {
      toast.error('Erro ao atualizar')
      setLoading(false)
    }
  }

  return (
    <Button 
      size="sm" 
      variant="outline" 
      onClick={handleClick} 
      disabled={loading}
      className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
    >
      <CheckCircle2 size={14} />
      {loading ? '...' : 'Marcar como Lida'}
    </Button>
  )
}