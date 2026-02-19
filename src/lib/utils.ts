import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return null;

  return new Date(date).toLocaleDateString('pt-BR', {
    timeZone: 'UTC'
  });
};

export const formatCivilDate = (date: Date | string) => {
  return format(
    startOfDay(parseISO(date.toString())),
    'dd/MM/yyyy',
    { locale: ptBR }
  );
};
