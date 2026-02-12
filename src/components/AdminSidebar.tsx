"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  FileSearch,
  BookOpen,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Users, 
  TrendingUp, 
  Megaphone,
  CalendarCheck, 
  GraduationCap, 
  Briefcase, 
  Calendar, 
  FileSpreadsheet, 
  Activity,
  MessageSquare,
  Medal, 
  ScrollText,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/Button";

interface NavLinkProps {
  link: {
    href: string;
    label: string;
    icon: React.ElementType;
    disabled?: boolean;
  };
  pathname: string;
  isCollapsed: boolean;
}

const NavLink = ({ link, pathname, isCollapsed }: NavLinkProps) => (
  <Link
    href={link.disabled ? "#" : link.href}
    className={cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors mb-1",
      pathname.startsWith(link.href) && link.href !== "/admin" || pathname === link.href
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
      link.disabled && "cursor-not-allowed hover:bg-transparent opacity-50",
      isCollapsed && "justify-center px-2"
    )}
    title={link.label}
  >
    <link.icon className={cn("h-5 w-5 shrink-0 transition-all", isCollapsed ? "h-6 w-6" : "")} />
    <span className={cn("whitespace-nowrap transition-all duration-300 origin-left", 
      isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
    )}>
      {link.label}
    </span>
  </Link>
);

const NavSectionTitle = ({ title, isCollapsed }: { title: string, isCollapsed: boolean }) => (
  <h3 className={cn(
    "px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-4 mb-2 truncate",
    isCollapsed && "hidden"
  )}>
    {title}
  </h3>
);

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const operationalLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/partes", label: "Analisar Processos", icon: FileSearch },
  ];

  const managementLinks = [
    { href: "/admin/alunos", label: "Alunos", icon: Users },
    { href: "/admin/cargos/gerenciar", label: "Cargos", icon: Medal },
    { href: "/admin/regulamentos", label: "Regulamentos", icon: BookOpen },
    { href: "/admin/promocoes", label: "Promoções", icon: TrendingUp },
    { href: "/admin/comunicacoes-internas", label: "Comunicação Interna", icon: Megaphone },
    { href: "/admin/classificacao-geral", label: "Classificação Geral", icon: TrendingUp },
    { href: "/admin/frequencia", label: "Frequência", icon: CalendarCheck },
    { href: "/admin/nota-escolar", label: "Nota Escolar", icon: GraduationCap },
    { href: "/admin/anotacoes", label: "Anotações", icon: ClipboardList },
    { href: "/admin/sessoes-funcoes", label: "Sessões e Funções", icon: Briefcase },
    { href: "/admin/calendario", label: "Calendário", icon: Calendar },
    { href: "/admin/qes", label: "QES", icon: ScrollText },
    { href: "/admin/taf", label: "TAF", icon: Activity },
    { href: "/admin/qpe", label: "QPE", icon: FileSpreadsheet },
    { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
    { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  ];

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen z-40 border-r bg-background hidden md:flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full shadow-md bg-background border hover:bg-muted p-0"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className="flex flex-col h-full overflow-y-auto py-4 px-2 scrollbar-hide">
        
        <div className={cn(
          "flex items-center gap-2 px-2 mb-6 transition-all",
          isCollapsed ? "justify-center" : ""
        )}>
          <Image
            src="/img/logo.png"
            alt="Logo Guarda Mirim"
            width={40}
            height={40}
            className="rounded-full w-8 h-8 object-contain shrink-0"
          />
          <div className={cn("flex flex-col overflow-hidden", isCollapsed && "hidden")}>
             <span className="font-bold text-sm whitespace-nowrap">Administração</span>
             <span className="text-xs text-muted-foreground whitespace-nowrap">Guarda Mirim</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <NavSectionTitle title="Operacional" isCollapsed={isCollapsed} />
          {operationalLinks.map((link) => (
            <NavLink key={link.href} link={link} pathname={pathname} isCollapsed={isCollapsed} />
          ))}

          {isCollapsed && <div className="my-2 border-t mx-2" />}

          <NavSectionTitle title="Gerenciamento" isCollapsed={isCollapsed} />
          {managementLinks.map((link) => (
            <NavLink key={link.href} link={link} pathname={pathname} isCollapsed={isCollapsed} />
          ))}
        </nav>
        
        <div className="h-8 shrink-0" />
      </div>
    </aside>
  );
}