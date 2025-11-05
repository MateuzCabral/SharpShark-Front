import api from "./axios";
import { PaginatedResponse } from "./analyses";

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
  timestamp?: string;
}

export const getAlerts = async (
  page = 1,
  size = 10,
  alertType?: string,
  severity?: string
): Promise<PaginatedResponse<AlertRead>> => {
  
  const params: Record<string, any> = {
    page,
    size,
  };
  if (alertType) params.alert_type = alertType;
  if (severity) params.severity = severity;

  try {
    const response = await api.get<PaginatedResponse<AlertRead>>("/alerts/", { params });
    
    return response.data;

  } catch (error: any) {

    if (error.response && error.response.status === 404) {
      return { items: [], total: 0, page: 1, size: size, pages: 0 };
    }
    console.error("Failed to fetch general alerts:", error);
    throw error;
  }
};

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