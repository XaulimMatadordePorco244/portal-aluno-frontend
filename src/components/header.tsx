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
  User,
  ClipboardCheck, 
  FileWarning, 
  ClipboardList 
} from "lucide-react";
import { UserNav } from "@/components/UserNav";
import Image from 'next/image';
import Link from "next/link"; 

interface User {
  nome: string;
  nomeDeGuerra: string | null;
  cargo: string | null;
}


export function Header({ user }: { user: User | null }) { 
  return (
    <header className="bg-slate-800 text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2">
            {}
            <Image src="/logo.png" alt="Logo da Guarda Mirim" width={40} height={40} />
            Guarda Mirim
          </Link>
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
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white">
                    <User className="mr-2 h-4 w-4" />
                    <span>Minha Ficha</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/frequency" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    <span>Frequência</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/evaluations" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white">
                    <FileWarning className="mr-2 h-4 w-4" />
                    <span>Anotações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-reports" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    <span>Minhas Partes</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none transition-colors cursor-pointer">
                Institucional <ChevronDown className="h-4 w-4 ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 text-gray-300 border-slate-700">
                <DropdownMenuItem asChild>
                  <Link href="/regulations" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Regulamento</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#" className="flex items-center w-full cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-white hover:text-white">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Calendário de Eventos</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        
        <div className="flex items-center">
          {user ? (
            <UserNav user={user} />
          ) : (
            <Link href="/login" className="text-sm font-medium hover:text-white">Entrar</Link>
          )}
        </div>
      </div>
    </header>
  );
}