import api from "./axios";

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

export interface FileReadSimple {
  file_name: string;
  file_size: number;
  file_hash: string;
}

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
}

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
    file_hash: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export const getAnalyses = async (page = 1, size = 10): Promise<PaginatedResponse<AnalysisReadSimple>> => {
  const response = await api.get<PaginatedResponse<AnalysisReadSimple>>("/analyses/", {
    params: { page, size },
  });
  return response.data;
};

export const getAnalysisDetails = async (analysisId: string): Promise<AnalysisRead> => {
  const response = await api.get<AnalysisRead>(`/analyses/${analysisId}`);
  return response.data;
};

export const getAnalysisIps = async (
  analysisId: string,
  role: "SRC" | "DST",
  page = 1,
  size = 10
): Promise<PaginatedResponse<IpRecordRead>> => {
  const response = await api.get<PaginatedResponse<IpRecordRead>>(`/analyses/${analysisId}/ips`, {
    params: { 
      page, 
      size,
      role
    },
  });
  return response.data;
};


export const getStreamContent = async (streamId: string): Promise<string> => {
  const response = await api.get(`/analyses/stream/${streamId}`, {
     responseType: 'text'
  });
  return response.data;
};

