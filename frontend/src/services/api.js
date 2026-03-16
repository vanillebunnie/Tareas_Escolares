import axios from 'axios';

const api = axios.create({
  // Asegúrate de que esta URL sea la de tu backend
  baseURL: 'http://localhost:3000/api' 
});

// Este interceptor atrapa la petición antes de salir y le pega el token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;