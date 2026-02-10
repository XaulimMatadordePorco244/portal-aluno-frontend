"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDown,
  Home,
  Shield,
  MessageSquare,
  Menu,
  IdCard,
  ClipboardCheck,
  ScrollText,
  AlertCircle,
  ListTodo,
  CalendarClock,
  Trophy,
  Scale,
  Newspaper,
  Mail,
  Activity,
  Users,
  CalendarRange,
  Briefcase,
  LogOut,
  ShieldAlert,
} from "lucide-react";

import { UserNav } from "@/components/UserNav";
import { Button } from "./ui/Button";
import { Separator } from "./ui/separator";
import { LogoutButton } from "./LogoutButton";
import { ThemeToggle } from "./ThemeToggle";

interface User {
  nome: string;
  nomeDeGuerra: string | null;
  cargo: string | null;
  funcao: string | null;
  role?: string;
  fotoUrl?: string | null;
}

const menuGroups = [
  {
    title: "Meus Dados",
    links: [
      { href: "/profile", label: "Minha Ficha", icon: IdCard },
      { href: "/frequencia", label: "Frequência", icon: ClipboardCheck },
      { href: "/anotacoes", label: "Anotações", icon: ScrollText },
      { href: "/partes", label: "Minhas Partes", icon: AlertCircle },
      { href: "/minhas-tarefas", label: "Minhas Tarefas", icon: ListTodo },
      { href: "/cargos", label: "Histórico de Cargos", icon: Shield },
      { href: "/carteirinha", label: "Carteira de Identificação", icon: Shield },
      { href: "/feedback", label: "Enviar Feedback", icon: MessageSquare },
    ],
  },
  {
    title: "Institucional",
    links: [
      { href: "/qes", label: "Quadro de Estudo (QES)", icon: CalendarClock },
      { href: "/classification", label: "Classificação Geral", icon: Trophy },
      { href: "/regulations", label: "Regulamentos", icon: Scale },
      { href: "/informativos", label: "Informativos", icon: Newspaper },
      { href: "/comunicacoes-internas", label: "Comunicações Internas", icon: Mail },
      { href: "/taf", label: "Teste de Aptidão Física", icon: Activity },
      { href: "/quadros", label: "QOGM e QPGM", icon: Users },
      { href: "/escalas", label: "Escalas de Serviço", icon: CalendarRange },
      { href: "/sessoes-funcoes", label: "Sessões e Funções", icon: Briefcase },
    ],
  },
];

const commandLinks = [
  { href: "/comandante/partes", label: "Partes", icon: ShieldAlert },
];

export function Header({ user }: { user: User | null }) {
  const isAuthorized =
    user?.funcao === "Comandante Geral" ||
    user?.funcao === "COMANDANTE GERAL" ||
    user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-md dark:bg-gray-900 dark:border-b dark:border-gray-800 ">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
            <Image
              src="/img/logo.svg"
              alt="Logo da Guarda Mirim"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span className="hidden sm:inline">GUARDA MIRIM</span>
            <span className="sm:hidden">GM</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/dashboard"
            className="flex items-center text-sm font-medium text-gray-300 transition-colors hover:text-white"
          >
            <Home className="mr-1 h-4 w-4" />
            Início
          </Link>

          {menuGroups.map((group) => (
            <DropdownMenu key={group.title}>
              <DropdownMenuTrigger className="flex cursor-pointer items-center text-sm font-medium text-gray-300 transition-colors hover:text-white focus:outline-none data-[state=open]:text-white">
                {group.title} <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {group.links.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="flex w-full items-center cursor-pointer">
                      <link.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{link.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          {isAuthorized && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex cursor-pointer items-center text-sm font-medium text-gray-300 transition-colors hover:text-white focus:outline-none data-[state=open]:text-white">
                Comando <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {commandLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="flex w-full items-center cursor-pointer">
                      <link.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{link.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="hidden md:block">
            {user ? (
              <UserNav user={user} />
            ) : (
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-white"
              >
                Entrar
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 focus:ring-0 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="flex h-full w-[300px] flex-col p-0">
                <SheetHeader className="border-b bg-muted/40 p-4 text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <Image src="/img/logo.png" alt="Logo" width={32} height={32} />
                    Menu Principal
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Navegação do sistema
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-2 py-4">
                  <Link
                    href="/dashboard"
                    className="mb-2 flex items-center gap-3 rounded-md px-3 py-2.5 font-medium transition-colors hover:bg-accent"
                  >
                    <Home className="h-5 w-5" />
                    Início
                  </Link>

                  {isAuthorized && (
                    <div className="mb-4">
                      <h3 className="flex items-center px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Comando
                        <Separator className="ml-2 flex-1" />
                      </h3>
                      <div className="space-y-1">
                        {commandLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {menuGroups.map((group) => (
                    <div key={group.title} className="mb-4 last:mb-0">
                      <h3 className="flex items-center px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {group.title}
                        <Separator className="ml-2 flex-1" />
                      </h3>
                      <div className="space-y-1">
                        {group.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t bg-muted/20 p-4">
                  {user ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 px-2">
                        <Avatar className="h-10 w-10 border border-border/20">
                          {user.fotoUrl ? (
                             <AvatarImage 
                               src={user.fotoUrl} 
                               alt={user.nome} 
                               className="object-cover" 
                             />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 font-bold text-primary">
                             {user.nome.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                          <span className="max-w-[180px] truncate text-sm font-medium">
                            {user.nomeDeGuerra || user.nome}
                          </span>
                          <span className="max-w-[180px] truncate text-xs text-muted-foreground">
                            {user.cargo || "Aluno"}
                          </span>
                        </div>
                      </div>

                      <LogoutButton>
                        <div className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-destructive/10 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground">
                          <LogOut className="h-4 w-4" />
                          Sair do Sistema
                        </div>
                      </LogoutButton>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="flex w-full items-center justify-center rounded-md bg-primary py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Entrar na Conta
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}