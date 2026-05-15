import axios from 'axios';

/**
 * Instance Axios partagée — utilisée par RTK Query (baseQuery) et
 * directement par les appels hors cache (export PDF, etc.).
 *
 * Interceptors :
 *  - Request : ajoute le Bearer token Sanctum à chaque requête
 *  - Response : intercepte 401 → purge le token et redirige vers /login
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bankapp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('bankapp_token');
      // Évite la boucle infinie sur la page login elle-même
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?session_expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
