import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
});

// Enviar el token en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptar errores de sesión expirada
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('nombreUsuario');
      localStorage.removeItem('correoUsuario');
      
      // Redirigir al login con un aviso en la URL
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expirado=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;