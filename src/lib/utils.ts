import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format} from 'date-fns';
import { ptBR } from 'date-fns/locale';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return null;

  const d = new Date(date);

  const normalized = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  );

  return format(normalized, 'dd/MM/yyyy', { locale: ptBR });
};

export const formatCivilDate = (date: Date | string) => {
  const d = new Date(date);

  const normalized = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  );

  return format(normalized, 'dd/MM/yyyy', { locale: ptBR });
};

export const normalizeDate = (date: Date | string | null | undefined) => {
  if (!date) return null;

  const d = new Date(date);

  return new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate()
  ));
};