import axios from 'axios';

const env = import.meta.env;
const rawBase = env?.VITE_API_URL;
const normalizedBase = (() => {
  const trimmed = rawBase?.replace(/\/$/, '');
  return trimmed?.endsWith('/api') ? trimmed : `${trimmed}/api`;
})();

const api = axios.create({
  baseURL: normalizedBase,
});

// Middleware pour ajouter automatiquement le token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
