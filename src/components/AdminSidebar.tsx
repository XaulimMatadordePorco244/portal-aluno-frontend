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
  Settings,
  Cake,
  Scale
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
      (pathname.startsWith(link.href) && link.href !== "/admin") || pathname === link.href
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
    "px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-5 mb-2 truncate",
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
    { href: "/admin/comunicacoes-internas", label: "Comunicação Interna", icon: Megaphone },
  ];

  const efetivoLinks = [
    { href: "/admin/alunos", label: "Alunos", icon: Users },
    { href: "/admin/aniversariantes", label: "Aniversariantes", icon: Cake },
    { href: "/admin/cargos/gerenciar", label: "Cargos", icon: Medal },
    { href: "/admin/promocoes", label: "Promoções", icon: TrendingUp },
    { href: "/admin/antiguidade", label: "Antiguidade", icon: Medal },
    { href: "/admin/sessoes-funcoes", label: "Sessões e Funções", icon: Briefcase },
    { href: "/admin/escalas", label: "Escalas", icon: ClipboardList },
  ];

  const academicoLinks = [
    { href: "/admin/turmas", label: "Turmas", icon: Users },
    { href: "/admin/calendario", label: "Calendário", icon: Calendar },
    { href: "/admin/frequencia", label: "Frequência", icon: CalendarCheck },
    { href: "/admin/nota-escolar", label: "Nota Escolar", icon: GraduationCap },
    { href: "/admin/dados-escolares", label: "Dados Escolares", icon: GraduationCap },
    { href: "/admin/materiais", label: "Materiais Auxiliares", icon: BookOpen },
    { href: "/admin/atividades", label: "Atividades", icon: ClipboardList },
        { href: "/admin/vagas", label: "Quadro de Vagas", icon: Settings },

  ];

  const avaliacoesLinks = [
    { href: "/admin/classificacao-geral", label: "Classificação Geral", icon: TrendingUp },
    { href: "/admin/taf", label: "TAF", icon: Activity },
    { href: "/admin/qes", label: "QES", icon: ScrollText },
    { href: "/admin/qpe", label: "QPE", icon: FileSpreadsheet },
    { href: "/admin/anotacoes", label: "Anotações", icon: ClipboardList },
  ];

  const sistemaLinks = [
    { href: "/admin/regulamentos", label: "Regulamentos", icon: Scale },
    { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
    { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
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
        className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full shadow-md bg-background border hover:bg-muted p-0 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className={cn(
        "flex items-center gap-2 px-4 py-6 border-b bg-background/95 backdrop-blur z-10 transition-all shrink-0",
        isCollapsed ? "justify-center px-2" : ""
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

      <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-hide">
        <nav className="flex flex-col gap-1 pb-8">
          
          <NavSectionTitle title="Geral" isCollapsed={isCollapsed} />
          {operationalLinks.map((link) => (
            <NavLink key={link.href} link={link} pathname={pathname} isCollapsed={isCollapsed} />
          ))}

          {isCollapsed && <div className="my-2 border-t mx-2" />}

          <NavSectionTitle title="Efetivo" isCollapsed={isCollapsed} />
          {efetivoLinks.map((link) => (
            <NavLink key={link.href} link={link} pathname={pathname} isCollapsed={isCollapsed} />
          ))}

          {isCollapsed && <div className="my-2 border-t mx-2" />}

          <NavSectionTitle title="Acadêmico" isCollapsed={isCollapsed} />
          {academicoLinks.map((link) => (
            <NavLink key={link.href} link={link} pathname={pathname} isCollapsed={isCollapsed} />
          ))}

          {isCollapsed && <div className="my-2 border-t mx-2" />}

          <NavSectionTitle title="Avaliações & Índices" isCollapsed={isCollapsed} />
          {avaliacoesLinks.map((link) => (
            <NavLink key={link.href} link={link} pathname={pathname} isCollapsed={isCollapsed} />
          ))}

          {isCollapsed && <div className="my-2 border-t mx-2" />}

          <NavSectionTitle title="Sistema" isCollapsed={isCollapsed} />
          {sistemaLinks.map((link) => (
            <NavLink key={link.href} link={link} pathname={pathname} isCollapsed={isCollapsed} />
          ))}

        </nav>
      </div>
    </aside>
  );
}