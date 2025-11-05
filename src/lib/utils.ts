import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma string de data (potencialmente UTC ingênua do SQLite) para o fuso horário de São Paulo (UTC-3).
 * @param isoString A string de data vinda da API (ex: "2024-10-30 17:00:00")
 * @returns A data e hora formatadas para pt-BR, fuso de São Paulo.
 */
export const formatUtcDateToBrazil = (isoString: string | null | undefined): string => {
  if (!isoString) return "-";

  try {
    let dateString = isoString;
    
    if (!dateString.endsWith("Z") && !/([+-]\d{2}:\d{2})$/.test(dateString)) {
      dateString = dateString.replace(" ", "T") + "Z";
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  } catch (e) {
    console.error("Erro ao formatar data:", e, "String original:", isoString);
    return isoString;
  }
};
