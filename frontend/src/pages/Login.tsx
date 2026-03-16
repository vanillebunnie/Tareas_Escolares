import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import api from '../services/api';

function Login() {
  // Cambiamos 'email' por 'correo' para coincidir exactamente con tu backend
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Enviamos 'correo' y 'password' tal como lo pide tu auth.controller
      const respuesta = await api.post('/auth/login', { correo, password });
      
      localStorage.setItem('token', respuesta.data.token);
      localStorage.setItem('nombreUsuario', respuesta.data.usuario.nombre);
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Correo o contraseña incorrectos.');
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'neutro');
  }, []);

  return (
    <div className="min-h-screen bg-fondo-principal flex items-center justify-center p-4 transition-colors duration-500 font-sans">
      
      <div className="w-full max-w-md bg-fondo-lateral rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-transparent">
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-boton-activo rounded-full flex items-center justify-center shadow-sm">
            <LogIn size={28} className="text-texto-suave" />
          </div>
        </div>

        <h2 className="text-3xl font-semibold text-center text-texto-fuerte mb-2">Bienvenida de nuevo</h2>
        <p className="text-center text-texto-suave mb-8 text-lg">Ingresa tus datos para continuar organizando tu día.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-2xl text-red-600 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={manejarEnvio} className="space-y-6">
          <div>
            <label htmlFor="correo" className="block text-sm font-medium mb-2 px-1 text-texto-suave">
              Correo electrónico
            </label>
            <input
              id="correo"
              type="email"
              title="Correo electrónico"
              placeholder="ejemplo@correo.com"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full bg-fondo-principal shadow-sm p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-boton-hover/50 transition-all text-texto-fuerte font-semibold placeholder:text-texto-suave/60 placeholder:font-normal"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 px-1 text-texto-suave">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              title="Contraseña"
              placeholder="escribe tu contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-fondo-principal shadow-sm p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-boton-hover/50 transition-all text-texto-fuerte font-semibold placeholder:text-texto-suave/60 placeholder:font-normal"
            />
          </div>

          <button
            type="submit"
            title="Iniciar sesión"
            className="w-full bg-texto-fuerte text-fondo-principal py-4 rounded-2xl font-medium shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 mt-4 text-lg"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;