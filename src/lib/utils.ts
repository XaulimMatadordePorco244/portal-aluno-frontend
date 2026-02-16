import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return null;

  return new Date(date).toLocaleDateString('pt-BR', {
    timeZone: 'UTC'
  });
};
