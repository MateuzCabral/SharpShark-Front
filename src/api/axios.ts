import axios from "axios";

const api = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data);
      if (error.response.status === 401) {
          localStorage.removeItem("token");
          console.warn("Unauthorized (401). Token removed.");
          if (window.location.pathname !== '/login') {
             window.location.reload();
          }
      }
    } else {
       console.error("Network or other error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;