import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, GraduationCap } from 'lucide-react';
import api from '../services/api';

function Login() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mensajeExpirado, setMensajeExpirado] = useState('');
  const navigate = useNavigate();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (esRegistro) {
        await api.post('/auth/register', { nombre, correo, password });
        const respuestaLogin = await api.post('/auth/login', { correo, password });
        localStorage.setItem('token', respuestaLogin.data.token);
        localStorage.setItem('nombreUsuario', respuestaLogin.data.usuario.nombre);
        localStorage.setItem('correoUsuario', respuestaLogin.data.usuario.correo);
        navigate('/dashboard');
      } else {
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
    
    // Leer si la URL dice que la sesión expiró
    const params = new URLSearchParams(window.location.search);
    if (params.get('expirado') === 'true') {
      setMensajeExpirado('Tu sesión ha expirado por seguridad. Por favor, inicia sesión nuevamente.');
      window.history.replaceState({}, document.title, '/login'); // Limpiar la URL
    }
  }, []);

  return (
    <div className="min-h-screen flex bg-fondo-principal transition-colors duration-500 font-sans">
      
      <div className="hidden md:flex md:w-1/2 bg-fondo-lateral flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-fondo-tarjeta/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-black/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="bg-boton-activo p-8 rounded-full shadow-lg mb-8 z-10">
          <GraduationCap size={80} className="text-texto-fuerte" />
        </div>
        <h1 className="text-6xl font-bold text-texto-fuerte tracking-tight mb-4 z-10">Ágora</h1>
        <p className="text-xl text-texto-suave text-center max-w-sm font-medium z-10">
          Tu espacio personal para organizar materias, tareas y dominar tu periodo escolar.
        </p>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-fondo-tarjeta md:bg-transparent md:shadow-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:border-none border border-black/5 rounded-[2.5rem] p-8 sm:p-10">
          
          <div className="md:hidden flex justify-center mb-6">
            <div className="w-16 h-16 bg-fondo-lateral rounded-full flex items-center justify-center shadow-sm">
              <GraduationCap size={32} className="text-texto-fuerte" />
            </div>
          </div>

          <h2 className="text-3xl font-semibold text-center text-texto-fuerte mb-2">
            {esRegistro ? 'Crear una cuenta' : 'Hola de nuevo'}
          </h2>
          <p className="text-center text-texto-suave mb-8 text-lg">
            {esRegistro ? 'Registra tus datos para comenzar' : 'Ingresa tus datos para continuar.'}
          </p>

          {mensajeExpirado && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-800 text-sm font-medium text-center">
              {mensajeExpirado}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-2xl text-red-600 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={manejarEnvio} className="space-y-6">
            {esRegistro && (
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium mb-2 px-1 text-texto-suave">Nombre o apodo</label>
                <input id="nombre" type="text" placeholder="ej. Victoria" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full bg-fondo-principal border border-black/5 md:border-none md:shadow-sm p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-boton-hover/50 transition-all text-texto-fuerte font-semibold placeholder:text-texto-suave/60 placeholder:font-normal" />
              </div>
            )}

            <div>
              <label htmlFor="correo" className="block text-sm font-medium mb-2 px-1 text-texto-suave">Correo electrónico</label>
              <input id="correo" type="email" placeholder="ejemplo@correo.com" required value={correo} onChange={(e) => setCorreo(e.target.value)} className="w-full bg-fondo-principal border border-black/5 md:border-none md:shadow-sm p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-boton-hover/50 transition-all text-texto-fuerte font-semibold placeholder:text-texto-suave/60 placeholder:font-normal" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 px-1 text-texto-suave">Contraseña</label>
              <input id="password" type="password" placeholder="escribe tu contraseña" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-fondo-principal border border-black/5 md:border-none md:shadow-sm p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-boton-hover/50 transition-all text-texto-fuerte font-semibold placeholder:text-texto-suave/60 placeholder:font-normal" />
            </div>

            <button type="submit" className="w-full bg-texto-fuerte text-fondo-principal py-4 rounded-2xl font-medium shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 mt-4 text-lg">
              {esRegistro ? <UserPlus size={20} /> : <LogIn size={20} />}
              {esRegistro ? 'Registrarse' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button type="button" onClick={() => { setEsRegistro(!esRegistro); setError(''); }} className="text-texto-fuerte font-medium hover:underline text-sm cursor-pointer">
              {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;