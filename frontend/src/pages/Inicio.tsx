import { Link } from 'react-router-dom';
import { Bookmark, BookOpen, Clock, CheckSquare } from 'lucide-react';
import { useState } from 'react';

function Inicio() {
  const [nombreUsuario] = useState<string>(() => localStorage.getItem('nombreUsuario') || 'estudiante');

  // Arreglo con la información de nuestros atajos rápidos
  const accesos = [
    { 
      titulo: 'Periodos escolares', 
      descripcion: 'Administra tus semestres o ciclos escolares.', 
      icono: <Bookmark size={28} />, 
      ruta: '/dashboard/periodos' 
    },
    { 
      titulo: 'Materias', 
      descripcion: 'Registra tus asignaturas y profesores.', 
      icono: <BookOpen size={28} />, 
      ruta: '/dashboard/materias' 
    },
    { 
      titulo: 'Horario de clases', 
      descripcion: 'Organiza tu tiempo y tus clases de la semana.', 
      icono: <Clock size={28} />, 
      ruta: '/dashboard/horarios' 
    },
    { 
      titulo: 'Gestión de tareas', 
      descripcion: 'Revisa y controla tus tareas pendientes.', 
      icono: <CheckSquare size={28} />, 
      ruta: '/dashboard/tareas' 
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-12">
        <h2 className="text-4xl font-semibold text-texto-fuerte mb-3">¡Hola, {nombreUsuario}!</h2>
        <p className="text-texto-suave text-lg">¿Qué te gustaría organizar el día de hoy?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {accesos.map((acceso, index) => (
          <Link 
            key={index} 
            to={acceso.ruta} 
            className="bg-fondo-lateral p-8 rounded-4xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all group border border-transparent hover:border-boton-hover/50 flex items-center gap-6"
          >
            <div className="p-5 rounded-3xl bg-fondo-principal shadow-sm text-texto-fuerte group-hover:scale-110 transition-transform duration-300">
              {acceso.icono}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-texto-fuerte mb-2">{acceso.titulo}</h3>
              <p className="text-texto-suave leading-relaxed">{acceso.descripcion}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Inicio;