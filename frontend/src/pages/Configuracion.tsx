import { useState } from 'react';

// 1. Creamos el contrato de seguridad para definir cómo es un Tema
interface Tema {
  id: string;
  colorLateral: string;
  colorFondo: string;
}

function Configuracion() {
  // Le indicamos que temaActual será un texto (<string>)
  const [temaActual, setTemaActual] = useState<string>(localStorage.getItem('temaUsuario') || 'neutro');

  // 2. Aquí solucionamos el error diciéndole que nuevoTema es un texto (string)
  const cambiarTema = (nuevoTema: string) => {
    setTemaActual(nuevoTema);
    localStorage.setItem('temaUsuario', nuevoTema);
    document.documentElement.setAttribute('data-theme', nuevoTema);
  };

  // 3. Le aplicamos el contrato de seguridad a nuestra lista de temas
  const temas: Tema[] = [
    { id: 'neutro', colorLateral: '#a0add3', colorFondo: '#fff9f9' },
    { id: 'rosa', colorLateral: '#f6c9d5', colorFondo: '#fffdfa' },
    { id: 'amarillo', colorLateral: '#fff2a7', colorFondo: '#fffff7' },
    { id: 'azul', colorLateral: '#c0dcef', colorFondo: '#f7fcfa' },
    { id: 'verde', colorLateral: '#b1dda8', colorFondo: '#f9fcf8' },
    { id: 'lila', colorLateral: '#c9a4db', colorFondo: '#faf7fc' },
    { id: 'rojo', colorLateral: '#db7f7f', colorFondo: '#fcf9f9' },
    { id: 'naranja', colorLateral: '#fabe82', colorFondo: '#fffbfa' },
    { id: 'oscuro', colorLateral: '#312e2e', colorFondo: '#141313' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      <h2 className="text-3xl font-medium mb-8 text-texto-fuerte self-start">Ajustes del sistema</h2>
      
      <div className="w-full bg-fondo-lateral p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-500">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-medium mb-3 text-texto-fuerte">Personalización visual</h3>
          <p className="text-texto-suave text-lg">Elige la paleta de colores que te haga sentir mayor comodidad al usar la aplicación.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {temas.map((tema) => (
            <button
              key={tema.id}
              onClick={() => cambiarTema(tema.id)}
              title={`Cambiar a tema ${tema.id}`}
              className={`w-14 h-14 rounded-full transition-transform duration-300 relative overflow-hidden ${
                temaActual === tema.id 
                  ? 'scale-125 shadow-md ring-4 ring-boton-hover' 
                  : 'scale-100 shadow-sm hover:scale-110'
              }`}
            >
              <div className="absolute inset-0 z-0">
                <div className="h-full w-full" style={{ backgroundColor: tema.colorFondo }}>
                  <div className="h-full w-full" style={{ backgroundColor: tema.colorLateral, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Configuracion;