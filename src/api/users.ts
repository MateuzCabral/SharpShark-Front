// src/api/users.ts
import api from "./axios";
import { PaginatedResponse } from "./analyses";

// Integração: Tipos baseados nos Schemas Pydantic (UserRead, UserCreate, UserUpdate)
export interface UserRead {
  id: string;
  name: string;
  is_active: boolean;
  is_superuser: boolean;
  // Adicionar created_at se disponível (não está no schema)
  created_at?: string;
}

export interface UserCreate {
  name: string;
  password: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface UserUpdate {
  name?: string | null;
  password?: string | null; // Enviar apenas se for alterar
  is_active?: boolean | null;
  is_superuser?: boolean | null;
}

// Integração: Funções da API
export const getUsers = async (page = 1, size = 10): Promise<PaginatedResponse<UserRead>> => {
  const response = await api.get<PaginatedResponse<UserRead>>("/users/", {
    params: { page, size },
  });
  return response.data;
};

export const createUser = async (userData: UserCreate): Promise<UserRead> => {
  // O endpoint é /users/register no backend
  const response = await api.post<UserRead>("/users/register", userData);
  return response.data;
};

export const updateUser = async (userId: string, userData: UserUpdate): Promise<UserRead> => {
  const response = await api.put<UserRead>(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/users/${userId}`);
};

export const getUserByName = async (userName: string): Promise<UserRead> => {
  const response = await api.get<UserRead>(`/users/name/${userName}`);
  return response.data;
};