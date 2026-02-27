"use client";

import { User, Slash } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/Button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminNotificacoesDropdown } from "@/components/AdminNotificacoesDropdown"; 

export function AdminHeader({
    userName,
    userImage,
}: {
    userName: string;
    userImage?: string | null;
}) {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);

    const labels: Record<string, string> = {
        admin: "Admin",
        dashboard: "Dashboard",
        alunos: "Alunos",
        instrutores: "Instrutores",
        novo: "Novo",
        editar: "Editar",
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b bg-background px-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                {segments.map((segment, index) => {
                    const href = "/" + segments.slice(0, index + 1).join("/");
                    const isLast = index === segments.length - 1;

                    const label =
                        labels[segment] ??
                        segment.charAt(0).toUpperCase() + segment.slice(1);

                    return (
                        <div key={href} className="flex items-center gap-2">
                            {!isLast ? (
                                <Link
                                    href={href}
                                    className="hover:text-foreground transition-colors"
                                >
                                    {label}
                                </Link>
                            ) : (
                                <span className="text-foreground font-semibold">
                                    {label}
                                </span>
                            )}

                            {!isLast && (
                                <Slash className="h-4 w-4 text-muted-foreground/50" />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="ml-auto flex items-center gap-4">
                
                <ThemeToggle />

                <AdminNotificacoesDropdown />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9 border">
                                <AvatarImage src={userImage || undefined} alt="Avatar" />
                                <AvatarFallback>
                                    <User className="h-5 w-5" />
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {userName}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    Conectado como Admin
                                </p>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                            <Link href="/dashboard">Voltar ao Portal do Aluno</Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem>Configurações</DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            Sair do Sistema
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}