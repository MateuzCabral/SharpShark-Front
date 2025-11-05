import api from "./axios";

interface TrafficDataPoint {
  time: string;
  packets: number;
}
interface ProtocolDataPoint {
  name: string;
  value: number;
}
export interface DashboardStats {
  totalPackets: { value: number };
  activeAlerts: { value: number }; 
  uniqueIPs: { value: number };
  completedAnalyses: { value: number };
  trafficLast24h: TrafficDataPoint[];
  protocolDistribution: ProtocolDataPoint[];
}

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

export interface StatRead {
  id: string;
  analysis_id: string;
  category: string;
  key: string;
  count: number;
}

export const getStatsForAnalysis = async (analysisId: string): Promise<StatRead[]> => {
  try {
    const response = await api.get<StatRead[]>(`/stats/analysis/${analysisId}`);
    return response.data || [];
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return [];
    }
    console.error(`Failed to fetch stats for analysis ${analysisId}:`, error);
    throw error;
  }
};