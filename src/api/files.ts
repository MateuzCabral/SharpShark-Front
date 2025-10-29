// src/api/files.ts
import api from "./axios";
import { PaginatedResponse } from "./analyses"; // Reutiliza interface de paginação

// Interface para FileRead (baseada no schema Pydantic)
export interface FileRead {
  id: string;
  file_name: string;
  file_path: string; // Caminho no servidor
  file_size: number; // Assumindo MB
  file_hash: string;
  uploaded_at: string; // Formato ISO 8601 string
  user_id: string;
}

// Upload (POST /files/upload)
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
    throw error; // Relança para tratamento no componente
  }
};

// Buscar Arquivos com Paginação (GET /files/)
export const getFiles = async (page = 1, size = 10): Promise<PaginatedResponse<FileRead>> => {
  try {
    const response = await api.get<PaginatedResponse<FileRead>>("/files/", {
      params: { page, size },
    });
    return response.data;
  } catch (error: any) {
    // Trata 404 como lista vazia, pois o backend pode retornar 404 se não houver ficheiros
    if (error.response && error.response.status === 404) {
       console.warn("API /files/ retornou 404, tratando como lista vazia.");
       return { items: [], total: 0, page: 1, size: size, pages: 0 };
    }
    console.error("Erro ao buscar arquivos:", error);
    throw error;
  }
};

// Buscar Arquivo por Hash (GET /files/hash/{hash})
export const getFileByHash = async (fileHash: string): Promise<FileRead> => {
  try {
    const response = await api.get<FileRead>(`/files/hash/${fileHash}`);
    return response.data;
  } catch (error) {
     console.error(`Erro ao buscar arquivo por hash ${fileHash}:`, error);
     throw error;
  }
};

// Buscar Arquivo por ID (GET /files/{id})
export const getFileById = async (fileId: string): Promise<FileRead> => {
   try {
    const response = await api.get<FileRead>(`/files/${fileId}`);
    return response.data;
   } catch (error) {
      console.error(`Erro ao buscar arquivo por ID ${fileId}:`, error);
      throw error;
   }
};


// Deletar Arquivo por ID (DELETE /files/{id})
export const deleteFileById = async (fileId: string): Promise<void> => {
  try {
    await api.delete(`/files/${fileId}`);
  } catch (error) {
     console.error(`Erro ao deletar arquivo ID ${fileId}:`, error);
     throw error;
  }
};