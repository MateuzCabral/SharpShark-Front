// src/api/files.ts
import api from "./axios";

// Integração: Definindo tipos baseados nos Schemas Pydantic (FileRead)
export interface FileRead {
  id: string;
  file_name: string;
  file_path: string; // Pode não ser tão útil no frontend, mas está na API
  file_size: number; // Em MB no backend? Ajustar se necessário
  file_hash: string;
  uploaded_at: string; // Formato ISO 8601 string
  user_id: string;
}

// Upload já estava parcialmente correto
export const uploadFile = async (file: File): Promise<FileRead> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<FileRead>("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Integração: Função para buscar arquivo por hash
export const getFileByHash = async (fileHash: string): Promise<FileRead> => {
  const response = await api.get<FileRead>(`/files/hash/${fileHash}`);
  return response.data;
};

// Integração: Função para deletar arquivo (se necessário em algum componente futuro)
export const deleteFileById = async (fileId: string): Promise<void> => {
  await api.delete(`/files/${fileId}`);
};