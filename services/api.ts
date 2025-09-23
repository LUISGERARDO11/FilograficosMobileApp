import axios from 'axios';

// Establece la base URL de tu backend de producción
const API_URL = 'https://backend-filograficos.vercel.app';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos de tiempo de espera
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;