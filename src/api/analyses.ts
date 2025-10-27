// src/api/analyses.ts
import api from "./axios";

// Integração: Tipos baseados nos Schemas Pydantic (AnalysisRead, etc.)
// Simplificado para o contexto da tabela, pode expandir conforme necessário
export interface AlertReadSimple {
  id: string;
  alert_type: string;
  severity: string;
}

export interface AnalysisReadSimple {
  id: string;
  file_id: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  total_packets: number;
  total_streams: number; // Número de streams *salvos*
  duration: number; // Em segundos
  analyzed_at: string | null; // ISO 8601 string ou null
  // Relacionamentos podem ser incluídos se o endpoint GET /analyses for ajustado
  // ou se buscarmos detalhes individuais
  file?: { // Assumindo que o backend pode incluir dados do arquivo
    file_name: string;
    file_size: number; // Em MB
  };
  alerts_count?: number; // Adicionar contagem no backend seria útil
}

// Integração: Estrutura da resposta paginada
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Integração: Função para buscar análises com paginação
export const getAnalyses = async (page = 1, size = 10): Promise<PaginatedResponse<AnalysisReadSimple>> => {
  const response = await api.get<PaginatedResponse<AnalysisReadSimple>>("/analyses/", {
    params: { page, size },
  });
  return response.data;
};

// Integração: Função para buscar detalhes de uma análise (exemplo)
// export const getAnalysisDetails = async (analysisId: string): Promise<AnalysisRead> => {
//  const response = await api.get<AnalysisRead>(`/analyses/${analysisId}`);
//  return response.data;
// };

// Integração: Função para buscar alertas de uma análise (exemplo)
// export const getAnalysisAlerts = async (analysisId: string, page = 1, size = 10): Promise<PaginatedResponse<AlertReadSimple>> => {
//   const response = await api.get<PaginatedResponse<AlertReadSimple>>(`/analyses/${analysisId}/alerts`, {
//     params: { page, size },
//   });
//   return response.data;
// };

// Integração: Função para buscar conteúdo de stream (retorna texto ou erro)
export const getStreamContent = async (streamId: string): Promise<string> => {
  const response = await api.get(`/analyses/stream/${streamId}`, {
     responseType: 'text' // Espera texto plano
  });
  return response.data;
};