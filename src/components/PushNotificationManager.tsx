"use client";

import { useState, useEffect } from "react";
import { BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { salvarSubscricao } from "@/actions/push-actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    if (Notification.permission === "default") {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleForceSubscribe = async () => {
      setIsSubscribing(true);
      try {
        await subscribeToPush();
        toast.success("Notificações ativadas com sucesso!");
      } finally {
        setIsSubscribing(false);
      }
    };

    window.addEventListener("forcar-inscricao-push", handleForceSubscribe);
    return () => {
      window.removeEventListener("forcar-inscricao-push", handleForceSubscribe);
    };
  }, []);

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) throw new Error("VAPID Key não encontrada");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      await salvarSubscricao(JSON.parse(JSON.stringify(subscription)));
      window.dispatchEvent(new Event("push-inscricao-sucesso"));
      
    } catch (error) {
      console.error("Erro na subscrição push:", error);
      toast.error("Não foi possível ligar as notificações.");
    }
  };

  const requestPermission = async () => {
    setIsSubscribing(true);
    try {
      const result = await Notification.requestPermission();
      setShowPrompt(false);

      if (result === "granted") {
        await subscribeToPush();
        toast.success("Notificações ativadas com sucesso!");
      } else {
        toast.info("Notificações bloqueadas pelo navegador.");
      }
    } catch (error) {
      console.error("Erro ao pedir permissão:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem("push-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;
  if (typeof window !== "undefined" && localStorage.getItem("push-prompt-dismissed") === "true") return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-primary text-primary-foreground p-4 rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center justify-center h-10 w-10 bg-primary-foreground/20 rounded-full shrink-0">
          <BellRing className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-sm">Ativar notificações?</h3>
          <p className="text-xs text-primary-foreground/80 leading-relaxed">
            Receba atualizações importantes diretamente no seu ecrã.
          </p>
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="secondary" className="w-full text-xs font-semibold text-primary" onClick={requestPermission} disabled={isSubscribing}>
              {isSubscribing ? "A ativar..." : "Sim, ativar"}
            </Button>
            <Button size="sm" variant="ghost" className="w-full text-xs hover:bg-primary-foreground/10" onClick={dismissPrompt} disabled={isSubscribing}>
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