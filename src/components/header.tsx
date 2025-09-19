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
import { LogoutButton } from "./LogoutButton"; // Importamos o novo botão

// A interface User pode ser simplificada
interface User {
  nome: string;
  nomeDeGuerra: string | null;
  cargo: string | null;
}

// A estrutura de dados dos links do menu permanece a mesma
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
    <header className="bg-slate-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2">
            <Image src="/logo.png" alt="Logo da Guarda Mirim" width={40} height={40} />
            <span>Guarda Mirim</span>
          </Link>
        </div>
        
        {/* Navegação de Desktop (sem alterações) */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Início
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none transition-colors cursor-pointer">
              Meus Dados <ChevronDown className="h-4 w-4 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 text-gray-300 border-slate-700">
              <DropdownMenuItem asChild><Link href="/profile" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white"><User className="mr-2 h-4 w-4" /><span>Minha Ficha</span></Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/frequency" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white"><ClipboardCheck className="mr-2 h-4 w-4" /><span>Frequência</span></Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/evaluations" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white"><FileWarning className="mr-2 h-4 w-4" /><span>Anotações</span></Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/my-reports" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white"><ClipboardList className="mr-2 h-4 w-4" /><span>Minhas Partes</span></Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none transition-colors cursor-pointer">
              Institucional <ChevronDown className="h-4 w-4 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 text-gray-300 border-slate-700">
              <DropdownMenuItem asChild><Link href="/regulations" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white"><FileText className="mr-2 h-4 w-4" /><span>Regulamento</span></Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="#" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white"><Calendar className="mr-2 h-4 w-4" /><span>Calendário de Eventos</span></Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        
        <div className="flex items-center gap-2">
          {/* ===== MODIFICAÇÃO 1: Escondemos o UserNav no mobile ===== */}
          <div className="hidden md:block">
            {user ? <UserNav user={user} /> : <Link href="/login" className="text-sm font-medium hover:text-white">Entrar</Link>}
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700 focus:ring-slate-600">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              
              {/* ===== MODIFICAÇÃO 2: Layout do Sheet ajustado e botão Sair adicionado ===== */}
              <SheetContent className="bg-slate-800 text-white border-l-slate-700 w-[280px] p-4 flex flex-col">
                <SheetHeader>
                  <SheetTitle className="sr-only">Menu Principal</SheetTitle>
                  <SheetDescription className="sr-only">
                    Navegação principal do portal do aluno.
                  </SheetDescription>
                </SheetHeader>
                
                {/* O conteúdo principal do menu ocupa o espaço disponível */}
                <nav className="flex flex-col gap-2 mt-4 text-base flex-1">
                  <Link href="/dashboard" className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-700 transition-colors text-gray-200 hover:text-white font-medium">
                    <Home className="h-5 w-5" />
                    Início
                  </Link>
                  <Separator className="my-2 bg-slate-700" />
                  
                  {menuGroups.map((group) => (
                    <div key={group.title} className="flex flex-col gap-1">
                      <h3 className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">{group.title}</h3>
                      {group.links.map(link => (
                        <Link key={link.href} href={link.href} className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-700 transition-colors text-gray-300 hover:text-white text-sm">
                          <link.icon className="h-5 w-5 text-gray-400" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </nav>

                {/* Este `div` é empurrado para o final do menu */}
                <div className="mt-auto pt-4 border-t border-slate-700">
                  <div className="p-2 rounded-md hover:bg-slate-700 transition-colors text-sm text-red-400 hover:text-red-300">
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