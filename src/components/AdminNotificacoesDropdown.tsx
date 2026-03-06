"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { getNotificacoesAdmin, marcarNotificacaoAdminLida } from "@/actions/admin-notificacoes";

type Notificacao = {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  link: string | null;
  createdAt: Date;
};

export function AdminNotificacoesDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidasCount, setNaoLidasCount] = useState(0);
  
  const notificacoesConhecidas = useRef<Set<string>>(new Set());

  const fetchNotificacoes = useCallback(async (isPolling = false) => {
    try {
      const { notificacoes: dados, naoLidasCount: count } = await getNotificacoesAdmin();
      
      setNotificacoes(dados);
      setNaoLidasCount(count);

      if (isPolling) {
        const novas = dados.filter(n => !notificacoesConhecidas.current.has(n.id) && !n.lida);
        if (novas.length > 0) {
          toast.info("Atenção Admin: " + novas[0].titulo, {
            description: novas[0].mensagem,
            icon: <MessageSquareWarning className="h-4 w-4 text-amber-500" />
          });
        }
      }

      notificacoesConhecidas.current = new Set(dados.map(n => n.id));
    } catch (error) {
      console.error("Erro ao carregar notificações admin", error);
    }
  }, []);

  useEffect(() => {
    fetchNotificacoes(false);
    const interval = setInterval(() => fetchNotificacoes(true), 30000);
    return () => clearInterval(interval);
  }, [fetchNotificacoes]);

  const handleClicarNotificacao = async (notificacao: Notificacao) => {
    if (!notificacao.lida) {
      await marcarNotificacaoAdminLida(notificacao.id);
      setNaoLidasCount(prev => Math.max(0, prev - 1));
      setNotificacoes(prev => prev.map(n => n.id === notificacao.id ? { ...n, lida: true } : n));
    }

    if (notificacao.link) {
      setOpen(false);
      router.push(notificacao.link);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-muted/50">
          <Bell className="h-5 w-5 text-foreground" />
          {naoLidasCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 border-2 border-background text-[10px] font-bold text-white animate-in zoom-in">
              {naoLidasCount > 99 ? '99+' : naoLidasCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[380px] p-0 z-50 shadow-lg border-muted" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-amber-500/10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Alertas do Sistema</span>
          </div>
          {naoLidasCount > 0 && (
            <span className="text-xs text-amber-600 font-medium">
              {naoLidasCount} pendentes
            </span>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notificacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground space-y-2">
              <CheckCircle2 className="h-8 w-8 opacity-20" />
              <p className="text-sm">Tudo tranquilo no painel admin.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notificacoes.map((notificacao) => (
                <button
                  key={notificacao.id}
                  onClick={() => handleClicarNotificacao(notificacao)}
                  className={`w-full text-left p-4 border-b last:border-0 transition-all hover:bg-muted/60 relative ${
                    !notificacao.lida ? "bg-amber-500/5" : ""
                  } ${notificacao.link ? "cursor-pointer" : "cursor-default"}`}
                >
                  {!notificacao.lida && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full" />
                  )}
                  <div className="flex justify-between items-start mb-1 gap-2 pl-2">
                    <span className={`text-sm leading-tight ${!notificacao.lida ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>
                      {notificacao.titulo}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap pt-0.5">
                      {formatDistanceToNow(new Date(notificacao.createdAt), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                  <p className={`text-xs line-clamp-2 pl-2 mt-1 ${!notificacao.lida ? "text-foreground/80" : "text-muted-foreground/60"}`}>
                    {notificacao.mensagem}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}