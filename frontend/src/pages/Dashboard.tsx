import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home, Bookmark, BookOpen, Clock, CheckSquare, Calendar, Settings, LogOut, Menu, User } from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [nombreUsuario] = useState(() => localStorage.getItem('nombreUsuario') || 'Usuario');
  const [sidebarAbierta, setSidebarAbierta] = useState<boolean>(true);

  useEffect(() => {
    const temaGuardado = localStorage.getItem('temaUsuario') || 'neutro';
    document.documentElement.setAttribute('data-theme', temaGuardado);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombreUsuario');
    navigate('/login');
  };

  const obtenerClaseBoton = (ruta: string) => {
    const activo = location.pathname === ruta;
    const base = `flex items-center gap-3 py-3 text-sm font-medium rounded-xl transition-all ${sidebarAbierta ? 'px-4 justify-start' : 'px-0 justify-center'}`;
    return activo 
      ? `${base} bg-boton-activo text-texto-fuerte shadow-sm`
      : `${base} text-texto-suave hover:bg-boton-hover hover:text-texto-fuerte`;
  };

  return (
    <div className="flex h-screen bg-fondo-principal font-sans transition-colors duration-500">
      <aside className={`${sidebarAbierta ? 'w-64' : 'w-20'} bg-fondo-lateral shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col transition-all duration-300 z-10`}>
        
        <div className="p-6 flex items-center justify-between">
          {sidebarAbierta && <h1 className="text-xl font-bold tracking-wide text-texto-fuerte truncate">Tareas</h1>}
          <button 
            onClick={() => setSidebarAbierta(!sidebarAbierta)} 
            title="Alternar menú"
            aria-label="Alternar menú"
            className="p-2.5 bg-boton-activo shadow-sm rounded-xl text-texto-suave hover:text-texto-fuerte"
          >
            <Menu size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-x-hidden">
          <Link title="Inicio" to="/dashboard" className={obtenerClaseBoton('/dashboard')}><Home size={20} />{sidebarAbierta && <span>Inicio</span>}</Link>
          <Link title="Periodos" to="/dashboard/periodos" className={obtenerClaseBoton('/dashboard/periodos')}><Bookmark size={20} />{sidebarAbierta && <span>Periodos</span>}</Link>
          <Link title="Horarios" to="/dashboard/horarios" className={obtenerClaseBoton('/dashboard/horarios')}><Clock size={20} />{sidebarAbierta && <span>Horarios</span>}</Link>
          <Link title="Tareas" to="/dashboard/tareas" className={obtenerClaseBoton('/dashboard/tareas')}><CheckSquare size={20} />{sidebarAbierta && <span>Tareas</span>}</Link>
          <Link title="Calendario" to="/dashboard/calendario" className={obtenerClaseBoton('/dashboard/calendario')}><Calendar size={20} />{sidebarAbierta && <span>Calendario</span>}</Link>
        </nav>

        <div className="p-4 space-y-2 border-t border-boton-hover/50">
          <Link to="/dashboard/cuenta" className={obtenerClaseBoton('/dashboard/cuenta')} title="Cuenta">
            <div className="w-10 h-10 rounded-full bg-boton-activo flex items-center justify-center overflow-hidden border border-boton-hover shrink-0 shadow-sm transition-transform hover:scale-105">
              <User size={20} className="text-texto-suave" />
            </div>
            {sidebarAbierta && <span className="truncate">Cuenta</span>}
          </Link>
          <Link to="/dashboard/configuracion" className={obtenerClaseBoton('/dashboard/configuracion')} title="Ajustes"><Settings size={20} />{sidebarAbierta && <span>Ajustes</span>}</Link>
          <button onClick={cerrarSesion} className={`w-full flex items-center gap-3 py-3 text-sm font-medium rounded-xl text-texto-suave hover:bg-rojo-suave/20 hover:text-red-600 ${sidebarAbierta ? 'px-4 justify-start' : 'justify-center'}`} title="Cerrar sesión">
            <LogOut size={20} />{sidebarAbierta && <span>Salir</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Dashboard;