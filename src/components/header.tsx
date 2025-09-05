// src/components/header.tsx

"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Home, UserCircle, FileText, Calendar, Shield } from "lucide-react";

export function Header() {
  return (
    <header className="bg-slate-800 text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <a href="/dashboard" className="text-xl font-bold flex items-center gap-2">
            <img src="/logo.png" className="h-10  w-10"/>
            Guarda Mirim
          </a>
          <nav className="hidden md:flex items-center gap-4">
            <a href="/dashboard" className="flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors">
              <Home className="h-4 w-4 mr-1" />
              Início
            </a>

            {/* Menu Meus Dados */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none transition-colors">
                Meus Dados <ChevronDown className="h-4 w-4 ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800">
                <DropdownMenuLabel>Minhas Informações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-gray-300 hover:text-white focus:outline-none transition-colors">Minha Ficha</DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white focus:outline-none transition-colors">Frequência</DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white focus:outline-none transition-colors">Avaliações</DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white focus:outline-none transition-colors">Gerar Parte</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none transition-colors">
                Institucional <ChevronDown className="h-4 w-4 ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800">
                <DropdownMenuItem className=" text-gray-300 hover:text-white focus:outline-none transition-colors">
                  <FileText className="mr-2 h-4 w-4 " />
                  <a href="regulations"><span>Regulamento</span></a>
                </DropdownMenuItem>
                <DropdownMenuItem className=" text-gray-300 hover:text-white focus:outline-none transition-colors ">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Calendário de Eventos</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        
        <div  className="flex items-center">
          <a href="/profile"><UserCircle  className="h-8 w-8 text-gray-300 hover:text-white transition-colors cursor-pointer" /></a>
        </div>
      </div>
    </header>
  );
}