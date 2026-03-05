import { User } from "lucide-react"
import { cn } from "@/lib/utils"

interface FotoHoverProps {
    src?: string | null
    alt?: string
    className?: string
}

export function FotoHover({ src, alt = "Foto", className }: FotoHoverProps) {
    return (
        <div className="relative group inline-block shrink-0">
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className={cn("w-10 h-10 rounded-full object-cover border cursor-pointer shadow-sm", className)}
                />
            ) : (
                <div className={cn("w-10 h-10 rounded-full border bg-muted flex items-center justify-center text-muted-foreground shadow-sm cursor-default", className)}>
                    <User className="w-5 h-5 opacity-50" />
                </div>
            )}

            {src && (
                <div className="fixed inset-0 z-50 hidden group-hover:flex items-center justify-center bg-black/60 pointer-events-none">
                    <img
                        src={src}
                        alt={alt}
                        className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-xl shadow-2xl border-4 border-white"
                    />
                </div>
            )}
        </div>
    )
}