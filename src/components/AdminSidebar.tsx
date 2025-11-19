"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
    LayoutDashboard, 
    FileSearch, 
    Users,
    Shield,
    BookOpen,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    UserCog,
    FileQuestion,
    GanttChartSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/Button";

interface NavLinkProps {
    link: {
        href: string;
        label: string;
        icon: React.ElementType;
        disabled?: boolean;
    };
    pathname: string;
    isCollapsed: boolean;
}


const NavLink = ({ link, pathname, isCollapsed }: NavLinkProps) => (
    <Link
        href={link.disabled ? "#" : link.href}
        className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            
            pathname.startsWith(link.href) && link.href !== "/admin" || pathname === link.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            link.disabled && "cursor-not-allowed hover:bg-transparent opacity-50",
            isCollapsed && "justify-center"
        )}
        title={link.label} 
    >
        <link.icon className="h-5 w-5 flex shrink-0" />
        <span className={cn("whitespace-nowrap", isCollapsed && "hidden")}>{link.label}</span>
    </Link>
);


const NavSectionTitle = ({ title, isCollapsed }: { title: string, isCollapsed: boolean }) => (
    <h3 className={cn(
        "px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-1",
        isCollapsed && "hidden"
    )}>
        {title}
    </h3>
);

export function AdminSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

  
    const operationalLinks = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/partes", label: "Analisar Processos", icon: FileSearch },
        { href: "/admin/alunos", label: "Visualizar Alunos", icon: Users },
    ];
    
    
    const managementLinks = [
        { href: "/admin/gerenciar-alunos", label: "Gerenciar Alunos", icon: UserCog, disabled: true },
        { href: "/admin/cargos", label: "Gerenciar Cargos", icon: Shield, disabled: true },
        { href: "/admin/regulamentos", label: "Gerenciar Regulamentos", icon: BookOpen, disabled: true },
        { href: "/admin/anotacoes", label: "Gerenciar Anotações", icon: ClipboardList, disabled: true },
        { href: "/admin/qes", label: "Gerenciar QES", icon: FileQuestion, disabled: true },
        { href: "/admin/qpe", label: "Gerenciar QPE", icon: GanttChartSquare, disabled: true },
    ];

    return (
        <aside 
            className={cn(
                "relative shrink-0 border-r bg-background p-2 hidden md:flex flex-col transition-all duration-300",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex grow">
               
                <div className={cn(
                    "flex items-center gap-2 p-2 mb-4",
                    isCollapsed && "justify-center"
                )}>
                    <Image
                        src="/img/logo.png"
                        alt="Logo Guarda Mirim"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <span className={cn("font-bold", isCollapsed && "hidden")}>Administração</span>
                </div>
                
                <nav className="flex flex-col gap-1">
               
                    <NavSectionTitle title="" isCollapsed={isCollapsed} />
                    {operationalLinks.map((link) => (
                        <NavLink key={link.href} link={link} pathname={pathname} isCollapsed={isCollapsed} />
                    ))}
                    
                  
                    <NavSectionTitle title="Gerenciamento" isCollapsed={isCollapsed} />
                    {managementLinks.map((link) => (
                        <NavLink key={link.href} link={link} pathname={pathname} isCollapsed={isCollapsed} />
                    ))}
                </nav>
            </div>

           
            <div className={cn("mt-auto flex", isCollapsed ? "justify-center" : "justify-end")}>
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsCollapsed(!isCollapsed)} 
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>
        </aside>
    );
}