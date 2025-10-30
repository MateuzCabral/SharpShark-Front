// src/api/alerts.ts
import api from "./axios";
import { PaginatedResponse } from "./analyses"; // Reutiliza a interface de paginação

export interface AlertRead {
  id: string;
  stream_id?: string | null;
  analysis_id: string;
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical" | string;
  src_ip?: string | null;
  dst_ip?: string | null;
  port?: number | null;
  protocol?: string | null;
  evidence?: string | null;
  timestamp?: string; // Adicionar se implementado no backend
}

// --- INÍCIO DA ALTERAÇÃO ---
// Função para buscar alertas GERAIS (agora com paginação real)
export const getAlerts = async (
  page = 1,
  size = 10,
  alertType?: string,
  severity?: string
): Promise<PaginatedResponse<AlertRead>> => {
  
  // 1. Monta os parâmetros, incluindo page e size
  const params: Record<string, any> = {
    page,
    size,
  };
  if (alertType) params.alert_type = alertType;
  if (severity) params.severity = severity;

  try {
    // 2. Faz a chamada da API. A resposta JÁ VIRÁ no formato PaginatedResponse
    const response = await api.get<PaginatedResponse<AlertRead>>("/alerts/", { params });
    
    // 3. Retorna os dados paginados diretamente
    return response.data;
    
    /* LÓGICA ANTIGA REMOVIDA (simulação de paginação)
    const response = await api.get<AlertRead[]>("/alerts/", { params });
    const allItems = response.data || [];
    const total = allItems.length;
    const totalPages = Math.ceil(total / size);
    const start = (page - 1) * size;
    const end = start + size;
    const items = allItems.slice(start, end);
    return { items: items, total: total, page: page, size: size, pages: totalPages };
    */

  } catch (error: any) {
    // 4. Trata o erro 404 (ou outros) como lista vazia
    // Nota: O backend paginado não deve retornar 404 para lista vazia,
    // mas manter isso é uma boa prática.
    if (error.response && error.response.status === 404) {
      return { items: [], total: 0, page: 1, size: size, pages: 0 };
    }
    console.error("Failed to fetch general alerts:", error);
    throw error;
  }
};
// --- FIM DA ALTERAÇÃO ---

// Função para buscar alertas de uma ANÁLISE específica (já estava correta)
export const getAnalysisAlerts = async (
  analysisId: string,
  page = 1,
  size = 10
): Promise<PaginatedResponse<AlertRead>> => {
   try {
     const response = await api.get<PaginatedResponse<AlertRead>>(`/analyses/${analysisId}/alerts`, {
       params: { page, size },
     });
     return response.data;
   } catch (error: any) {
     if (error.response && error.response.status === 404) {
       return { items: [], total: 0, page: 1, size: size, pages: 0 };
     }
     console.error(`Failed to fetch alerts for analysis ${analysisId}:`, error);
     throw error;
   }
};