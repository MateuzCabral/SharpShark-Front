// src/api/axios.ts
import axios from "axios";

// Verifique se esta é a URL correta do seu backend
const api = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token JWT
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

// Interceptor para tratamento de erros de resposta
api.interceptors.response.use(
  (response) => response, // Retorna a resposta se for sucesso
  (error) => {
    // Apenas loga o erro aqui. O tratamento (incluindo redirect 401)
    // será feito onde a chamada da API foi feita ou em um wrapper global.
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data);
      if (error.response.status === 401) {
          // Apenas limpa o token se não autorizado
          localStorage.removeItem("token");
          // Idealmente, um AuthContext ouviria essa mudança e redirecionaria.
          // Por simplicidade agora, o ProtectedRoute fará o redirect na próxima renderização.
          console.warn("Unauthorized (401). Token removed.");
          // Removido: window.location.href = '/login';
          // Força um reload para o ProtectedRoute fazer o redirect
          if (window.location.pathname !== '/login') {
             window.location.reload();
          }
      }
    } else {
       console.error("Network or other error:", error.message);
    }
    // Rejeita a promessa para que o erro possa ser tratado no componente/hook
    return Promise.reject(error);
  }
);

export default api;