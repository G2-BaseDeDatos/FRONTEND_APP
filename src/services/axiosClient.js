import axios from 'axios';

/**
 * Instancia Axios configurada para el backend GITT.
 * BASE URL: http://localhost:3006  (definido en FRONTEND_APP/.env → VITE_API_URL)
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * El backend usa app.use(cors()) sin restricciones, por lo que no hay bloqueos
 * CORS en desarrollo local. Si en producción se restringe, actualizar el header
 * withCredentials y la configuración de cors() en el backend.
 * ──────────────────────────────────────────────────────────────────────────────
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3006',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de REQUEST:
 * Agrega el Bearer token al header Authorization si existe en localStorage.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gitt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor de RESPONSE:
 * Normaliza errores HTTP para que la UI siempre reciba un objeto legible.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error (4xx, 5xx)
      const msg =
        error.response.data?.message ||
        error.response.data?.error ||
        'Error del servidor';
      return Promise.reject({ status: error.response.status, message: msg });
    }
    if (error.request) {
      // La petición salió pero no llegó respuesta (red caída, timeout)
      return Promise.reject({
        status: 0,
        message: 'Error de conexión, inténtalo de nuevo',
      });
    }
    return Promise.reject({ status: -1, message: 'Error inesperado' });
  }
);

export default api;
