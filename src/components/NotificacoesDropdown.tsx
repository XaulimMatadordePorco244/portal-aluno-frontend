"use client";

import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Notificacao = {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  createdAt: string;
};

export function NotificacoesDropdown() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotificacoes = async () => {
    try {
      const res = await fetch("/api/notificacoes");
      if (res.ok) {
        const data = await res.json();
        setNotificacoes(data);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações", error);
    }
  };

  useEffect(() => {
    fetchNotificacoes();
    const interval = setInterval(fetchNotificacoes, 60000);
    return () => clearInterval(interval);
  }, []);

  const marcarComoLidas = async () => {
    try {
      await fetch("/api/notificacoes", { method: "PATCH" });
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    } catch (error) {
      console.error("Erro ao marcar como lidas", error);
    }
  };

  const naoLidasCount = notificacoes.filter((n) => !n.lida).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {naoLidasCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {naoLidasCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-semibold">Notificações</span>
          {naoLidasCount > 0 && (
            <Button variant="ghost" size="sm" onClick={marcarComoLidas} className="h-auto p-1 text-xs">
              <Check className="mr-1 h-3 w-3" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notificacoes.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação no momento.
            </div>
          ) : (
            <div className="flex flex-col">
              {notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={`p-4 border-b last:border-0 transition-colors hover:bg-muted/50 ${
                    !notificacao.lida ? "bg-muted/20" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm ${!notificacao.lida ? "font-semibold" : "font-medium"}`}>
                      {notificacao.titulo}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(notificacao.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notificacao.mensagem}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}