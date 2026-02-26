"use client";

import { useState, useEffect } from "react";
import { BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export function PushNotificationManager() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }

    setPermission(Notification.permission);

    if (Notification.permission === "default") {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowPrompt(false);

      if (result === "granted") {
        toast.success("Notificações ativadas com sucesso!");
     
      } else {
        toast.info("Você bloqueou as notificações. Pode alterar isso nas configurações do navegador.");
      }
    } catch (error) {
      console.error("Erro ao pedir permissão:", error);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem("push-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  if (typeof window !== "undefined" && localStorage.getItem("push-prompt-dismissed") === "true") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-primary text-primary-foreground p-4 rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center justify-center h-10 w-10 bg-primary-foreground/20 rounded-full shrink-0">
          <BellRing className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-sm">Ativar notificações?</h3>
          <p className="text-xs text-primary-foreground/80 leading-relaxed">
            Receba alertas de novas escalas, feedbacks e atualizações importantes diretamente no seu ecrã, mesmo com o portal fechado.
          </p>
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="secondary" 
              className="w-full text-xs font-semibold"
              onClick={requestPermission}
            >
              Sim, ativar
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="w-full text-xs hover:bg-primary-foreground/10"
              onClick={dismissPrompt}
            >
              Agora não
            </Button>
          </div>
        </div>
        <button onClick={dismissPrompt} className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}