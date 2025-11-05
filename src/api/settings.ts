import api from "./axios";

export interface SettingsResponse {
  ingest_project_name: string | null;
  ingest_folder: string | null;
  ingest_user_id: string | null;
  ingest_user_name: string | null;
}

export interface SettingUpdate {
  ingest_folder?: string | null;
}

export const getSettings = async (): Promise<SettingsResponse> => {
  const response = await api.get<SettingsResponse>("/settings/");
  return response.data;
};

export const updateSettings = async (settingsData: SettingUpdate): Promise<SettingsResponse> => {
  const response = await api.put<SettingsResponse>("/settings/", settingsData);
  return response.data;
};
