// src/api/axios.ts
import axios from "axios";

// Verifique se esta é a URL correta do seu backend
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token JWT (já presente)
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento básico de erros (opcional, mas recomendado)
api.interceptors.response.use(
  (response) => response, // Retorna a resposta se for sucesso
  (error) => {
    // Se for erro de autenticação (401) ou permissão (403), desloga e redireciona
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn(`Auth error (${error.response.status}), logging out.`);
      localStorage.removeItem("token");
      // Redireciona para login (evita ficar em loop se já estiver no login)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    // Rejeita a promessa para que o erro possa ser tratado no componente
    return Promise.reject(error);
  }
);


export default api;