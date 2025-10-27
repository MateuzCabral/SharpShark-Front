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

// Função para buscar alertas GERAIS (simula paginação no frontend)
export const getAlerts = async (
  page = 1,
  size = 10,
  alertType?: string,
  severity?: string
): Promise<PaginatedResponse<AlertRead>> => {
  const params: Record<string, any> = {};
  if (alertType) params.alert_type = alertType;
  if (severity) params.severity = severity;

  try {
    // Busca a lista COMPLETA do backend
    const response = await api.get<AlertRead[]>("/alerts/", { params });
    const allItems = response.data || [];

    // Simula a paginação no frontend
    const total = allItems.length;
    const totalPages = Math.ceil(total / size);
    const start = (page - 1) * size;
    const end = start + size;
    const items = allItems.slice(start, end);

    return {
      items: items,
      total: total,
      page: page,
      size: size,
      pages: totalPages,
    };
  } catch (error: any) {
    // Trata o erro 404 como lista vazia
    if (error.response && error.response.status === 404) {
      return { items: [], total: 0, page: 1, size: size, pages: 0 };
    }
    // Relança outros erros
    console.error("Failed to fetch general alerts:", error);
    throw error;
  }
};

// Função para buscar alertas de uma ANÁLISE específica (backend já pagina)
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
     // Trata o erro 404 como lista vazia
     if (error.response && error.response.status === 404) {
       return { items: [], total: 0, page: 1, size: size, pages: 0 };
     }
     console.error(`Failed to fetch alerts for analysis ${analysisId}:`, error);
     throw error;
   }
};