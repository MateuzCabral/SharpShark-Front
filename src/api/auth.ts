import api from "./axios";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const loginUser = async (name: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>("/auth/login", { name, password });
    const token = response.data.access_token;
    localStorage.setItem("token", token);
    return response.data;
  } catch (error: any) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  window.location.href = '/login';
};