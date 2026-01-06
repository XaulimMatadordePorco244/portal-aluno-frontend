"use client";

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
import { 
  ChevronDown, Home,
  Shield, MessageSquare, Menu,
  IdCard, ClipboardCheck, ScrollText, AlertCircle, ListTodo,
  CalendarClock, Trophy, Scale, Newspaper, Mail, Activity,
  Users, CalendarRange, Briefcase, LogOut
} from "lucide-react";
import { UserNav } from "@/components/UserNav";
import Image from 'next/image';
import Link from "next/link"; 
import { Button } from "./ui/Button"; 
import { Separator } from "./ui/separator";
import React from "react";
import { LogoutButton } from "./LogoutButton";
import { ThemeToggle } from "./ThemeToggle"; 

interface User {
  nome: string;
  nomeDeGuerra: string | null;
  cargo: string | null;
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
      { href: "/cargos", label: "Cargos e Funções", icon: Shield },
      { href: "/feedback", label: "Enviar Feedback", icon: MessageSquare }
    ]
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
    ]
  }
];

export function Header({ user }: { user: User | null }) { 
  return (
    <header className="bg-primary text-white dark:bg-gray-900 dark:border-b dark:border-gray-800 shadow-md sticky top-0 z-50">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2">
            <Image src="/img/logo.png" alt="Logo da Guarda Mirim" width={40} height={40} className="w-10 h-10 object-contain" />
            <span className="hidden sm:inline">Guarda Mirim</span>
            <span className="sm:hidden">GM</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Início
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none transition-colors cursor-pointer data-[state=open]:text-white">
              Meus Dados <ChevronDown className="h-4 w-4 ml-1" />
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="start" className="w-56">
              {menuGroups[0].links.map(link => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className="flex items-center w-full cursor-pointer">
                    <link.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{link.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none transition-colors cursor-pointer data-[state=open]:text-white">
              Institucional <ChevronDown className="h-4 w-4 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {menuGroups[1].links.map(link => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className="flex items-center w-full cursor-pointer">
                    <link.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{link.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <div className="hidden md:block">
            {user ? (
              <UserNav user={user} />
            ) : (
              <Link href="/login" className="text-sm font-medium hover:text-white px-3 py-2 rounded-md transition-colors">
                Entrar
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-0">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              
              <SheetContent side="right" className="w-[300px] p-0 flex flex-col h-full border-l-border">
                <SheetHeader className="p-4 border-b text-left bg-muted/40">
                  <SheetTitle className="flex items-center gap-2">
                     <Image src="/img/logo.png" alt="Logo" width={32} height={32} />
                     Menu Principal
                  </SheetTitle>
                  <SheetDescription className="sr-only">Navegação do sistema</SheetDescription>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto py-4 px-2">
                  <Link href="/dashboard" className="flex items-center gap-3 py-2.5 px-3 rounded-md hover:bg-accent transition-colors text-foreground font-medium mb-2">
                    <Home className="h-5 w-5" />
                    Início
                  </Link>

                  {menuGroups.map((group) => (
                    <div key={group.title} className="mb-4 last:mb-0">
                      <h3 className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                        {group.title}
                        <Separator className="ml-2 flex-1" />
                      </h3>
                      <div className="space-y-1">
                        {group.links.map(link => (
                          <Link key={link.href} href={link.href} className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-muted-foreground text-sm font-medium">
                            <link.icon className="h-4 w-4" />
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t bg-muted/20">
                  {user ? (
                    <div className="flex flex-col gap-4">
                       <div className="flex items-center gap-3 px-2">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.nome.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium truncate max-w-[180px]">{user.nomeDeGuerra || user.nome}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[180px]">{user.cargo || 'Aluno'}</span>
                          </div>
                       </div>
                       <LogoutButton>
                         <div className="flex items-center justify-center gap-2 w-full py-2 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors text-sm font-medium cursor-pointer">
                            <LogOut className="h-4 w-4" />
                            Sair do Sistema
                         </div>
                       </LogoutButton>
                    </div>
                  ) : (
                    <Link href="/login" className="flex items-center justify-center w-full py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
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