import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import api from '../services/api';

function Login() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (esRegistro) {
        // Llama al endpoint de registro
        await api.post('/auth/register', { nombre, correo, password });
        // Inmediatamente después, hace login para obtener el token
        const respuestaLogin = await api.post('/auth/login', { correo, password });
        localStorage.setItem('token', respuestaLogin.data.token);
        localStorage.setItem('nombreUsuario', respuestaLogin.data.usuario.nombre);
        localStorage.setItem('correoUsuario', respuestaLogin.data.usuario.correo);
        navigate('/dashboard');
      } else {
        // Llama al endpoint de login
        const respuesta = await api.post('/auth/login', { correo, password });
        localStorage.setItem('token', respuesta.data.token);
        localStorage.setItem('nombreUsuario', respuesta.data.usuario.nombre);
        localStorage.setItem('correoUsuario', respuesta.data.usuario.correo);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ocurrió un error. Revisa tus datos.');
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
            {esRegistro ? <UserPlus size={28} className="text-texto-suave" /> : <LogIn size={28} className="text-texto-suave" />}
          </div>
        </div>

        <h2 className="text-3xl font-semibold text-center text-texto-fuerte mb-2">
          {esRegistro ? 'Crear una cuenta' : 'Bienvenida de nuevo'}
        </h2>
        <p className="text-center text-texto-suave mb-8 text-lg">
          {esRegistro ? 'Registra tus datos para comenzar' : 'Ingresa tus datos para continuar organizando tu día'}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-2xl text-red-600 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={manejarEnvio} className="space-y-6">
          {esRegistro && (
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium mb-2 px-1 text-texto-suave">
                Nombre o apodo
              </label>
              <input
                id="nombre"
                type="text"
                title="Nombre o apodo"
                placeholder="ej. Victoria"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-fondo-principal shadow-sm p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-boton-hover/50 transition-all text-texto-fuerte font-semibold placeholder:text-texto-suave/60 placeholder:font-normal"
              />
            </div>
          )}

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
            title={esRegistro ? 'Registrarse' : 'Iniciar sesión'}
            className="w-full bg-texto-fuerte text-fondo-principal py-4 rounded-2xl font-medium shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 mt-4 text-lg"
          >
            {esRegistro ? 'Registrarse' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => { setEsRegistro(!esRegistro); setError(''); }}
            className="text-texto-fuerte font-medium hover:underline text-sm cursor-pointer"
          >
            {esRegistro ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;