// src/api/settings.ts
import api from "./axios";

// Interface (saída) - Não precisa de alteração, já inclui 'ingest_folder'
export interface SettingsResponse {
  ingest_project_name: string | null;
  ingest_folder: string | null;
  ingest_user_id: string | null;
  ingest_user_name: string | null;
}

// --- INÍCIO DA ALTERAÇÃO ---
// 1. Interface (entrada) - Atualizar o nome do campo
export interface SettingUpdate {
  ingest_folder?: string | null; // Renomeado de 'ingest_project_name'
}
// --- FIM DA ALTERAÇÃO ---


// Função para buscar as configurações
export const getSettings = async (): Promise<SettingsResponse> => {
  const response = await api.get<SettingsResponse>("/settings/");
  return response.data;
};

// Função para atualizar as configurações
// (Nenhuma alteração na função, ela aceita o tipo SettingUpdate)
export const updateSettings = async (settingsData: SettingUpdate): Promise<SettingsResponse> => {
  const response = await api.put<SettingsResponse>("/settings/", settingsData);
  return response.data;
};
