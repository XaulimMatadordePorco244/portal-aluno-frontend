import { User } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface FotoHoverProps {
    src?: string | null
    alt?: string
    className?: string
    size?: number 
}

export function FotoHover({ src, alt = "Foto", className, size = 40 }: FotoHoverProps) {
    return (
        <div className="relative group inline-block shrink-0">
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    width={size}  
                    height={size} 
                    className={cn("w-10 h-10 rounded-full object-cover border cursor-pointer shadow-sm", className)}
                />
            ) : (
                <div className={cn("w-10 h-10 rounded-full border bg-muted flex items-center justify-center text-muted-foreground shadow-sm cursor-default", className)}>
                    <User className="w-5 h-5 opacity-50" />
                </div>
            )}

            {src && (
                <div className="fixed inset-0 z-100 hidden group-hover:flex items-center justify-center bg-black/60 pointer-events-none">
                    <Image
                        src={src}
                        alt={alt}
                        width={600} 
                        height={600}
                        className="w-64 h-64 md:w-96 md:h-96 object-cover rounded-xl shadow-2xl border-4 border-white"
                    />
                </div>
            )}
        </div>
    )
}