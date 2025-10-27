// src/api/auth.ts
import api from "./axios";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const loginUser = async (name: string, password: string): Promise<LoginResponse> => {
  try {
    // Usando /login-form para compatibilidade com OAuth2PasswordRequestForm se necessário,
    // ou /login se você ajustou o backend para aceitar JSON diretamente.
    // O backend atual tem ambos, /login aceita JSON.
    const response = await api.post<LoginResponse>("/auth/login", { name, password });
    const token = response.data.access_token;
    localStorage.setItem("token", token);
    return response.data;
  } catch (error: any) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error; // Relança para tratamento no componente
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  // Redireciona para a página de login após logout
  window.location.href = '/login';
};