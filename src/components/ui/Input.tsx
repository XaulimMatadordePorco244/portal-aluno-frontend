// src/components/ui/Input.tsx

import * as React from "react"
import { cn } from "@/lib/utils" // Importa a função utilitária do shadcn

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // --- Estilos Base (Vindos do Tema/shadcn) ---
          "flex h-10 w-full rounded-md border-1 border-input px-3 py-2 text-sm ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ",
          "disabled:cursor-not-allowed disabled:opacity-50",

          // --- Suas Customizações (O Seu Estilo Único!) ---
          "bg-black/5",
          "placeholder:text-gray-500",
          "[&:not(:placeholder-shown)]:text-black",
          "[&:not(:placeholder-shown)]:border-black",
          "focus:border-black",
          "transition-colors",

          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }