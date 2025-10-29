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
// Esta interface deve corresponder exatamente à estrutura JSON retornada pelo backend
export interface DashboardStats {
  totalPackets: { value: number };
  activeAlerts: { value: number }; // Corresponde a 'total_alerts' no backend
  uniqueIPs: { value: number };
  completedAnalyses: { value: number };
  trafficLast24h: TrafficDataPoint[];
  protocolDistribution: ProtocolDataPoint[];
}

// Função para buscar stats do dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
   try {
     // Chama o endpoint GET /stats/dashboard/summary
     const response = await api.get<DashboardStats>("/stats/dashboard/summary");
     console.log("Dashboard stats received:", response.data); // Log para depuração
     return response.data;
   } catch (error) {
       console.error("Failed to fetch dashboard stats:", error);
       // Retorna um objeto padrão com valores zerados em caso de erro
       // Isso evita que a UI quebre se a chamada falhar
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