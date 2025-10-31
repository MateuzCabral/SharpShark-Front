// src/api/analyses.ts
import api from "./axios";

// --- INÍCIO DA ALTERAÇÃO ---
// 1. Interfaces movidas para o topo e expandidas
export interface AlertRead {
  id: string;
  stream_id?: string | null;
  alert_type: string;
  severity: string;
  src_ip?: string | null;
  dst_ip?: string | null;
  port?: number | null;
  protocol?: string | null;
  evidence?: string | null;
}

export interface StreamRead {
  id: string;
  stream_number: number;
  content_path: string;
  preview?: string | null;
  alerts: AlertRead[];
}

export interface StatRead {
  id: string;
  category: string;
  key: string;
  count: number;
}

export interface IpRecordRead {
  id: string;
  ip: string;
  role: string;
  count: number;
}

// 2. Interface para o arquivo (para o hash)
export interface FileReadSimple {
  file_name: string;
  file_size: number;
  file_hash: string;
}

// 3. Interface principal para a página de Detalhes
export interface AnalysisRead {
  id: string;
  file_id: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  total_packets: number;
  total_streams: number;
  duration: number;
  analyzed_at: string | null;
  file?: FileReadSimple | null;
  streams: StreamRead[];
  // 'alerts', 'stats', 'ips' são removidos, pois são carregados separadamente
}

// 4. Interface para a Tabela (Lista de Análises)
export interface AnalysisReadSimple {
  id: string;
  file_id: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  total_packets: number;
  total_streams: number;
  duration: number;
  analyzed_at: string | null;
  file?: {
    file_name: string;
    file_size: number;
    file_hash: string; // Garantindo que está aqui
  };
}
// --- FIM DA ALTERAÇÃO ---


// Estrutura da resposta paginada
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Função para buscar análises com paginação
export const getAnalyses = async (page = 1, size = 10): Promise<PaginatedResponse<AnalysisReadSimple>> => {
  const response = await api.get<PaginatedResponse<AnalysisReadSimple>>("/analyses/", {
    params: { page, size },
  });
  return response.data;
};

// --- INÍCIO DA ALTERAÇÃO ---
// 5. Nova função para buscar detalhes (usando a interface completa)
export const getAnalysisDetails = async (analysisId: string): Promise<AnalysisRead> => {
  const response = await api.get<AnalysisRead>(`/analyses/${analysisId}`);
  return response.data;
};

// 6. Função de IPs paginados ATUALIZADA para o "Top 10"
export const getAnalysisIps = async (
  analysisId: string,
  role: "SRC" | "DST", // 1. 'role' agora é obrigatório
  page = 1,
  size = 10 // 2. 'size' padrão agora é 10
): Promise<PaginatedResponse<IpRecordRead>> => {
  const response = await api.get<PaginatedResponse<IpRecordRead>>(`/analyses/${analysisId}/ips`, {
    params: { 
      page, 
      size,
      role // 3. Passar o 'role' como parâmetro de query
    },
  });
  return response.data;
};
// --- FIM DA ALTERAÇÃO ---


// Função para buscar conteúdo de stream
export const getStreamContent = async (streamId: string): Promise<string> => {
  const response = await api.get(`/analyses/stream/${streamId}`, {
     responseType: 'text'
  });
  return response.data;
};

