"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileSearch, Users } from "lucide-react";
import { cn } from "@/lib/utils"; 

export function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/partes", label: "Gerenciar Partes", icon: FileSearch },
        { href: "/admin/alunos", label: "Gerenciar Alunos", icon: Users, disabled: true },
    ];

    return (
        <aside className="w-64 flex-shrink-0 border-r bg-background p-4 hidden md:block">
            <nav className="flex flex-col space-y-1">
                <h3 className="text-lg font-semibold mb-2 px-3">Administração</h3>
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.disabled ? "#" : link.href}
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            pathname === link.href
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted",
                            link.disabled && "cursor-not-allowed text-muted-foreground hover:bg-transparent"
                        )}
                    >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}