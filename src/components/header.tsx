// src/components/header.tsx

"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Home, UserCircle, FileText, Calendar } from "lucide-react";

export function Header() {
  return (
    <header className="bg-slate-800 text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <a href="/dashboard" className="text-xl font-bold flex items-center gap-2">
            {}
            <img src="/logo.png" alt="Logo da Guarda Mirim" className="h-10 w-10"/>
            Guarda Mirim
          </a>
          <nav className="hidden md:flex items-center gap-4">
            <a href="/dashboard" className="flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors">
              <Home className="h-4 w-4 mr-1" />
              Início
            </a>

            {}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none transition-colors cursor-pointer">
                Meus Dados <ChevronDown className="h-4 w-4 ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 text-white">
              
                
                <DropdownMenuItem className="cursor-pointer" asChild><a href="/profile">Minha Ficha</a></DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild><a href="/frequency">Frequência</a></DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild><a href="notes">Anotações</a></DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild><a href="/generate-report">Gerar Parte</a></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none transition-colors cursor-pointer">
                Institucional <ChevronDown className="h-4 w-4 ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 text-white">
                <DropdownMenuItem asChild>
                  <a href="/regulations" className="flex items-center w-full cursor-pointer">
                    
                    <span>Regulamento</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="#" className="flex items-center w-full cursor-pointer">
                    
                    <span>Calendário de Eventos</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        
        <div className="flex items-center">
          {}
          <a href="/profile">
            <UserCircle className="h-8 w-8 text-gray-300 hover:text-white transition-colors cursor-pointer" />
          </a>
        </div>
      </div>
    </header>
  );
}