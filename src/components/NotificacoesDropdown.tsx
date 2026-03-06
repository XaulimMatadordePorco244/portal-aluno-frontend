"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { Bell, Check, BellRing } from "lucide-react"; 
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
  link: string | null;
  lida: boolean;
  createdAt: string;
};

function BotaoAtivarNotificacoes() {
  const [status, setStatus] = useState<"loading" | "inscrito" | "desativado" | "bloqueado" | "nao-suportado">("loading");

  useEffect(() => {
    const verificarInscricao = async () => {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        setStatus("nao-suportado");
        return;
      }

      if (Notification.permission === "denied") {
        setStatus("bloqueado");
        return;
      }

      if (Notification.permission === "granted") {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
              setStatus("inscrito"); 
              return;
            }
          }
        } catch (error) {
          console.error("Erro ao verificar subscrição:", error);
        }
      }

      setStatus("desativado");
    };

    verificarInscricao();

    window.addEventListener("push-inscricao-sucesso", verificarInscricao);
    return () => window.removeEventListener("push-inscricao-sucesso", verificarInscricao);
  }, []);

  if (status === "loading" || status === "inscrito" || status === "nao-suportado") {
    return null;
  }

  if (status === "bloqueado") {
    return (
      <div className="p-3 bg-red-50 border-b border-red-100 flex flex-col gap-2 items-center text-center">
        <p className="text-xs text-red-800 font-medium">
          Notificações bloqueadas no navegador.
        </p>
        <button 
          onClick={() => alert("Para receber notificações, clique no ícone de cadeado na barra de endereços do seu navegador e altere a permissão de Notificações para 'Permitir'.")}
          className="text-[11px] bg-red-100 hover:bg-red-200 text-red-800 py-1.5 px-3 rounded-md transition-colors"
        >
          Como desbloquear?
        </button>
      </div>
    );
  }

  const ativarNoCelular = async () => {
    window.dispatchEvent(new Event("forcar-inscricao-push"));
  };

  return (
    <div className="p-3 bg-blue-50 border-b border-blue-100 dark:bg-blue-950/30 dark:border-blue-900 flex flex-col gap-2 items-center text-center">
      <button 
        onClick={ativarNoCelular}
        className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-md flex items-center gap-1.5 transition-colors"
      >
        <BellRing className="w-3.5 h-3.5" />
        Ativar Notificações no Dispositivo
      </button>
    </div>
  );
}

export function NotificacoesDropdown() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter(); 

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

  const handleCliqueNotificacao = (notificacao: Notificacao) => {
    if (!notificacao.link) return;

    router.push(notificacao.link);
    setOpen(false);
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
        
        <BotaoAtivarNotificacoes />

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
                  onClick={() => handleCliqueNotificacao(notificacao)}
                  className={`p-4 border-b last:border-0 transition-colors ${
                    !notificacao.lida ? "bg-muted/20" : ""
                  } ${
                    notificacao.link ? "cursor-pointer hover:bg-muted/50" : "opacity-75 cursor-default"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm ${!notificacao.lida ? "font-semibold text-primary" : "font-medium"}`}>
                      {notificacao.titulo}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(notificacao.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <p className={`text-xs line-clamp-2 ${
                    notificacao.mensagem.includes('removido') || !notificacao.link 
                      ? 'text-destructive font-medium' 
                      : 'text-muted-foreground'
                  }`}>
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