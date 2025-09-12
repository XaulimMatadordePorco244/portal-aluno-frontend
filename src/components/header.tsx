// src/components/header.tsx (VERSÃO COM ÍCONES E ESTILO ATUALIZADO)
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  Home, 
  FileText, 
  Calendar,
  User, // Ícone para Ficha
  ClipboardCheck, // Ícone para Frequência
  FileWarning, // Ícone para Anotações
  ClipboardList // Ícone para Minhas Partes
} from "lucide-react";
import { UserNav } from "@/components/UserNav";

export function Header({ user }: { user: any }) { 
  return (
    <header className="bg-slate-800 text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <a href="/dashboard" className="text-xl font-bold flex items-center gap-2">
            <img src="/logo.png" alt="Logo da Guarda Mirim" className="h-10 w-10"/>
            Guarda Mirim
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors">
              <Home className="h-4 w-4 mr-1" />
              Início
            </a>

            {/* Menu "Meus Dados" com ÍCONES e ESTILO ATUALIZADO */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none transition-colors cursor-pointer">
                Meus Dados <ChevronDown className="h-4 w-4 ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 text-gray-300 border-slate-700">
                <DropdownMenuItem asChild>
                  <a href="/profile" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white">
                    <User className="mr-2 h-4 w-4" />
                    <span>Minha Ficha</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/frequency" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    <span>Frequência</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/evaluations" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white">
                    <FileWarning className="mr-2 h-4 w-4" />
                    <span>Anotações</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/my-reports" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    <span>Minhas Partes</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none transition-colors cursor-pointer">
                Institucional <ChevronDown className="h-4 w-4 ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 text-gray-300 border-slate-700">
                <DropdownMenuItem asChild>
                  <a href="/regulations" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Regulamento</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="#" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Calendário de Eventos</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        
        <div className="flex items-center">
          {user ? (
            <UserNav user={user} />
          ) : (
            <a href="/login" className="text-sm font-medium hover:text-white">Entrar</a>
          )}
        </div>
      </div>
    </header>
  );
}