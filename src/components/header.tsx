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
  ChevronDown, Home, FileText, Calendar, User, ClipboardCheck, 
  FileWarning, ClipboardList, Menu
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
      { href: "/profile", label: "Minha Ficha", icon: User },
      { href: "/frequency", label: "Frequência", icon: ClipboardCheck },
      { href: "/evaluations", label: "Anotações", icon: FileWarning },
      { href: "/my-reports", label: "Minhas Partes", icon: ClipboardList },
    ]
  },
  {
    title: "Institucional",
    links: [
      { href: "/regulations", label: "Regulamento", icon: FileText },
      { href: "#", label: "Calendário de Eventos", icon: Calendar },
    ]
  }
];

export function Header({ user }: { user: User | null }) { 
  return (
 
    <header className="bg-slate-800 text-white dark:bg-gray-900 dark:border-b dark:border-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2">
            <Image src="/logo.png" alt="Logo da Guarda Mirim" width={40} height={40} />
            <span>Guarda Mirim</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Início
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none transition-colors cursor-pointer">
              Meus Dados <ChevronDown className="h-4 w-4 ml-1" />
            </DropdownMenuTrigger>
            
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link href="/profile" className="flex items-center w-full cursor-pointer"><User className="mr-2 h-4 w-4" /><span>Minha Ficha</span></Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/frequency" className="flex items-center w-full cursor-pointer"><ClipboardCheck className="mr-2 h-4 w-4" /><span>Frequência</span></Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/evaluations" className="flex items-center w-full cursor-pointer"><FileWarning className="mr-2 h-4 w-4" /><span>Anotações</span></Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/my-reports" className="flex items-center w-full cursor-pointer"><ClipboardList className="mr-2 h-4 w-4" /><span>Minhas Partes</span></Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none transition-colors cursor-pointer">
              Institucional <ChevronDown className="h-4 w-4 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link href="/regulations" className="flex items-center w-full cursor-pointer"><FileText className="mr-2 h-4 w-4" /><span>Regulamento</span></Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="#" className="flex items-center w-full cursor-pointer"><Calendar className="mr-2 h-4 w-4" /><span>Calendário de Eventos</span></Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:block">
            {user ? <UserNav user={user} /> : <Link href="/login" className="text-sm font-medium hover:text-white">Entrar</Link>}
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-slate-600">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              
              <SheetContent className="w-[280px] p-4 flex flex-col">
                <SheetHeader>
                  <SheetTitle className="sr-only">Menu Principal</SheetTitle>
                  <SheetDescription className="sr-only">Navegação principal do portal do aluno.</SheetDescription>
                </SheetHeader>
                
                <nav className="flex flex-col gap-2 mt-4 text-base flex-1">
                  <Link href="/dashboard" className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-accent transition-colors text-foreground font-medium">
                    <Home className="h-5 w-5" />
                    Início
                  </Link>

                  <Separator className="my-2" />
                  
                  {menuGroups.map((group) => (
                    <div key={group.title} className="flex flex-col gap-1">
                      <h3 className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.title}</h3>
                      {group.links.map(link => (
                        <Link key={link.href} href={link.href} className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground text-sm">
                          <link.icon className="h-5 w-5 text-muted-foreground" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </nav>

                <div className="mt-auto pt-4 border-t">
                  <div className="p-2 rounded-md hover:bg-destructive/90 transition-colors text-sm text-destructive hover:text-destructive-foreground">
                    <LogoutButton>
                      <span>Sair</span>
                    </LogoutButton>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}