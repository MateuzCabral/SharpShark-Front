// src/api/stats.ts
import api from "./axios";

// ... (Interfaces TrafficDataPoint, ProtocolDataPoint, DashboardStats - sem alterações) ...
interface TrafficDataPoint {
  time: string; // Ex: "14:00"
  packets: number;
}
interface ProtocolDataPoint {
  name: string; // Ex: "TCP"
  value: number; // Contagem
}
export interface DashboardStats {
  totalPackets: { value: number };
  activeAlerts: { value: number }; 
  uniqueIPs: { value: number };
  completedAnalyses: { value: number };
  trafficLast24h: TrafficDataPoint[];
  protocolDistribution: ProtocolDataPoint[];
}

// ... (Função getDashboardStats - sem alterações) ...
export const getDashboardStats = async (): Promise<DashboardStats> => {
   try {
     const response = await api.get<DashboardStats>("/stats/dashboard/summary");
     return response.data;
   } catch (error) {
       console.error("Failed to fetch dashboard stats:", error);
       return {
           totalPackets: { value: 0 },
           activeAlerts: { value: 0 },
           uniqueIPs: { value: 0 },
           completedAnalyses: { value: 0 },
           trafficLast24h: [],
           protocolDistribution: []
       };
   }
};


// --- INÍCIO DA ALTERAÇÃO ---
// 1. Adicionar interface StatRead
export interface StatRead {
  id: string;
  analysis_id: string;
  category: string;
  key: string;
  count: number;
}

// 2. Adicionar nova função
export const getStatsForAnalysis = async (analysisId: string): Promise<StatRead[]> => {
  /**
   * Busca todas as estatísticas brutas (objetos Stat) associadas a uma análise.
   */
  try {
    const response = await api.get<StatRead[]>(`/stats/analysis/${analysisId}`);
    return response.data || [];
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return []; // Retorna lista vazia se a análise não tiver stats
    }
    console.error(`Failed to fetch stats for analysis ${analysisId}:`, error);
    throw error;
  }
};
// --- FIM DA ALTERAÇÃO ---
