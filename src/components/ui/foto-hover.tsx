import { User } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image" // <-- Importamos o Image do Next.js

interface FotoHoverProps {
    src?: string | null
    alt?: string
    className?: string
}

export function FotoHover({ src, alt = "Foto", className }: FotoHoverProps) {
    return (
        <div className="relative group inline-block shrink-0">
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    width={40}  
                    height={40} 
                    className={cn("w-10 h-10 rounded-full object-cover border cursor-pointer shadow-sm", className)}
                />
            ) : (
                <div className={cn("w-10 h-10 rounded-full border bg-muted flex items-center justify-center text-muted-foreground shadow-sm cursor-default", className)}>
                    <User className="w-5 h-5 opacity-50" />
                </div>
            )}

            {src && (
                <div className="fixed inset-0 z-50 hidden group-hover:flex items-center justify-center bg-black/60 pointer-events-none">
                    <Image
                        src={src}
                        alt={alt}
                        width={320}  
                        height={320}
                        className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-xl shadow-2xl border-4 border-white"
                    />
                </div>
            )}
        </div>
    )
}