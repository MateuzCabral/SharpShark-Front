import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- INÍCIO DA ALTERAÇÃO ---
/**
 * Formata uma string de data (potencialmente UTC ingênua do SQLite) para o fuso horário de São Paulo (UTC-3).
 * @param isoString A string de data vinda da API (ex: "2024-10-30 17:00:00")
 * @returns A data e hora formatadas para pt-BR, fuso de São Paulo.
 */
export const formatUtcDateToBrazil = (isoString: string | null | undefined): string => {
  if (!isoString) return "-";

  try {
    let dateString = isoString;
    
    // CORREÇÃO: Se a string não tiver 'Z' (UTC) ou offset (+/-), 
    // adicione 'Z' para forçar o JS a interpretá-la como UTC.
    // Isso corrige o problema do SQLite que "esquece" o fuso horário.
    if (!dateString.endsWith("Z") && !/([+-]\d{2}:\d{2})$/.test(dateString)) {
      // Substitui espaço por 'T' (padrão ISO) e adiciona 'Z'
      dateString = dateString.replace(" ", "T") + "Z";
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-"; // Retorna "-" se a data for inválida

    // Formata para o fuso horário de São Paulo (BRT/UTC-3)
    return date.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo", // Garante a conversão para UTC-3
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit', // Adicionado segundos para mais detalhes
    });

  } catch (e) {
    console.error("Erro ao formatar data:", e, "String original:", isoString);
    return isoString; // Retorna a string original em caso de erro
  }
};
// --- FIM DA ALTERAÇÃO ---
