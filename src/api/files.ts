// src/api/files.ts
import api from "./axios";
import { PaginatedResponse } from "./analyses"; 

export interface FileRead {
  id: string;
  file_name: string;
  file_path: string; 
  file_size: number; 
  file_hash: string;
  uploaded_at: string; 
  user_id: string;
}

export const uploadFile = async (file: File): Promise<FileRead> => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await api.post<FileRead>("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    throw error; 
  }
};

export const getFiles = async (page = 1, size = 10): Promise<PaginatedResponse<FileRead>> => {
  try {
    const response = await api.get<PaginatedResponse<FileRead>>("/files/", {
      params: { page, size },
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
       console.warn("API /files/ retornou 404, tratando como lista vazia.");
       return { items: [], total: 0, page: 1, size: size, pages: 0 };
    }
    console.error("Erro ao buscar arquivos:", error);
    throw error;
  }
};

export const getFileByHash = async (fileHash: string): Promise<FileRead> => {
  try {
    const response = await api.get<FileRead>(`/files/hash/${fileHash}`);
    return response.data;
  } catch (error) {
     console.error(`Erro ao buscar arquivo por hash ${fileHash}:`, error);
     throw error;
  }
};

export const getFileById = async (fileId: string): Promise<FileRead> => {
    try {
     const response = await api.get<FileRead>(`/files/${fileId}`);
     return response.data;
    } catch (error) {
       console.error(`Erro ao buscar arquivo por ID ${fileId}:`, error);
       throw error;
    }
};

export const deleteFileById = async (fileId: string): Promise<void> => {
  try {
    await api.delete(`/files/${fileId}`);
  } catch (error) {
     console.error(`Erro ao deletar arquivo ID ${fileId}:`, error);
     throw error;
  }
};

// --- INÍCIO DA ALTERAÇÃO ---
// 1. Reverter para a função de download de 'blob' (assíncrona)
export const downloadPcapFile = async (fileId: string, fileName: string): Promise<void> => {
  try {
    // Faz a requisição autenticada (interceptor do axios) esperando um 'blob'
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });

    // Cria uma URL de objeto para o blob recebido
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Cria um link <a> invisível
    const link = document.createElement('a');
    link.href = url;
    
    // Define o nome do arquivo para o download
    link.setAttribute('download', fileName);
    
    // Adiciona, clica e remove o link
    document.body.appendChild(link);
    link.click();
    
    // Limpa a URL do objeto
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error(`Erro ao baixar o arquivo ${fileId}:`, error);
    throw error; // Relança para o componente (para mostrar o toast de erro)
  }
};
// --- FIM DA ALTERAÇÃO ---