import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Supprime le slash final s'il existe
const trimmed = rawBase.replace(/\/$/, '');

// Force /api à la fin
const normalizedBase = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;

const api = axios.create({
  baseURL: normalizedBase,
});

// Ajout auto du Bearer token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
