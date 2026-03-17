import { useState, useEffect } from 'react';
import { User, Mail } from 'lucide-react';

function Cuenta() {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [correoUsuario, setCorreoUsuario] = useState('');

  useEffect(() => {
    setNombreUsuario(localStorage.getItem('nombreUsuario') || 'Usuario');
    setCorreoUsuario(localStorage.getItem('correoUsuario') || 'correo@ejemplo.com');
  }, []);

  return (
    <div className="max-w-3xl mx-auto pb-12 flex flex-col items-center">
      <h2 className="text-3xl font-semibold text-texto-fuerte mb-8 self-start">Mi cuenta</h2>
      
      <div className="bg-fondo-principal p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 flex flex-col items-center text-center w-full">
        <div className="w-32 h-32 bg-fondo-lateral rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-fondo-principal">
          <User size={60} className="text-texto-suave" />
        </div>
        
        <h3 className="text-2xl font-bold text-texto-fuerte mb-2">{nombreUsuario}</h3>
        
        <div className="flex items-center gap-2 text-texto-suave bg-black/5 px-4 py-2 rounded-xl mt-2">
          <Mail size={18} />
          <span className="font-medium">{correoUsuario}</span>
        </div>
        
        <p className="mt-10 text-sm text-texto-suave max-w-md">
          Esta es la información básica de tu perfil. Los datos están vinculados a tu registro inicial en el sistema de tareas escolares.
        </p>
      </div>
    </div>
  );
}

export default Cuenta;