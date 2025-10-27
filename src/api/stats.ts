// src/api/stats.ts
import api from "./axios";

// Interface para dados do gráfico de tráfego
interface TrafficDataPoint {
  time: string; // Ex: "14:00"
  packets: number;
}

// Interface para dados do gráfico de pizza
interface ProtocolDataPoint {
  name: string; // Ex: "TCP"
  value: number; // Contagem
}

// Interface para estatísticas do dashboard (retorno do novo endpoint)
export interface DashboardStats {
  totalPackets: { value: number };
  activeAlerts: { value: number }; // Corresponde a 'total_alerts'
  uniqueIPs: { value: number };
  completedAnalyses: { value: number };
  trafficLast24h: TrafficDataPoint[];
  protocolDistribution: ProtocolDataPoint[];
}

// Função para buscar stats do dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
   try {
     const response = await api.get<DashboardStats>("/stats/dashboard/summary");
     return response.data;
   } catch (error) {
       console.error("Failed to fetch dashboard stats:", error);
       // Retorna um objeto padrão em caso de erro para evitar quebrar a UI
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