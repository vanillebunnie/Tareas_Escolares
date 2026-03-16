import { useState, useEffect } from 'react';
import { Clock, Edit2, Trash2, X } from 'lucide-react';
import api from '../services/api';

interface Periodo {
  id_periodo: number;
  nombre: string;
}

interface Materia {
  id_materia: number;
  nombre: string;
  id_periodo: number;
  color: string;
}

interface Horario {
  id_horario: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  id_materia: number;
}

function Horarios() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [cargando, setCargando] = useState(true);
  
  const [idPeriodoSeleccionado, setIdPeriodoSeleccionado] = useState<number | ''>('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [horarioEditando, setHorarioEditando] = useState<Horario | null>(null);
  const [diaSemana, setDiaSemana] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  const horaInicioCalendario = 7;
  const horaFinCalendario = 22;
  const pixelesPorHora = 80;

  const diasDeLaSemana = [
    { valor: 'Lun', etiqueta: 'Lunes' },
    { valor: 'Mar', etiqueta: 'Martes' },
    { valor: 'Mie', etiqueta: 'Miércoles' },
    { valor: 'Jue', etiqueta: 'Jueves' },
    { valor: 'Vie', etiqueta: 'Viernes' },
    { valor: 'Sab', etiqueta: 'Sábado' },
    { valor: 'Dom', etiqueta: 'Domingo' }
  ];

  const cargarDatos = async () => {
    try {
      const [resPeriodos, resMaterias, resHorarios] = await Promise.all([
        api.get('/periodos/'),
        api.get('/materias/'),
        api.get('/horarios/')
      ]);
      setPeriodos(resPeriodos.data);
      setMaterias(resMaterias.data);
      setHorarios(resHorarios.data);

      if (resPeriodos.data.length > 0 && idPeriodoSeleccionado === '') {
        setIdPeriodoSeleccionado(resPeriodos.data[0].id_periodo);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const materiasDelPeriodo = materias.filter(m => m.id_periodo === idPeriodoSeleccionado);
  const idsMateriasDelPeriodo = materiasDelPeriodo.map(m => m.id_materia);
  const horariosDelPeriodo = horarios.filter(h => idsMateriasDelPeriodo.includes(h.id_materia));

  const calcularPosicionYAltura = (horaInicioStr: string, horaFinStr: string) => {
    const [hInicio, mInicio] = horaInicioStr.split(':').map(Number);
    const [hFin, mFin] = horaFinStr.split(':').map(Number);

    const minutosInicio = hInicio * 60 + mInicio;
    const minutosFin = hFin * 60 + mFin;
    const minutosInicioCalendario = horaInicioCalendario * 60;

    const top = ((minutosInicio - minutosInicioCalendario) / 60) * pixelesPorHora;
    const height = ((minutosFin - minutosInicio) / 60) * pixelesPorHora;

    return { top, height };
  };

  const abrirModalEditar = (horario: Horario) => {
    setHorarioEditando(horario);
    setDiaSemana(horario.dia_semana);
    setHoraInicio(horario.hora_inicio.substring(0, 5));
    setHoraFin(horario.hora_fin.substring(0, 5));
    setModalAbierto(true);
  };

  const guardarHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!horarioEditando) return;

    try {
      const datosHorario = {
        id_materia: horarioEditando.id_materia,
        dia_semana: diaSemana,
        hora_inicio: horaInicio,
        hora_fin: horaFin
      };

      await api.put(`/horarios/${horarioEditando.id_horario}`, datosHorario);
      setModalAbierto(false);
      cargarDatos();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || 'Error al guardar el horario'}`);
    }
  };

  const borrarHorario = async (id: number) => {
    if (!window.confirm('¿Deseas eliminar este horario?')) return;
    try {
      await api.delete(`/horarios/${id}`);
      setModalAbierto(false);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar el horario.');
    }
  };

  const horasDelDia = Array.from({ length: horaFinCalendario - horaInicioCalendario + 1 }, (_, i) => i + horaInicioCalendario);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-medium text-texto-fuerte mb-2">Horario de clases</h2>
          <p className="text-texto-suave">Visualiza y ajusta tus clases de la semana.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-fondo-lateral p-2 rounded-2xl shadow-sm border border-black/5">
          <label htmlFor="selectorPeriodo" className="text-sm font-semibold text-texto-suave pl-3 whitespace-nowrap">
            Viendo periodo:
          </label>
          <select
            id="selectorPeriodo"
            title="Seleccionar periodo a visualizar"
            value={idPeriodoSeleccionado}
            onChange={(e) => setIdPeriodoSeleccionado(Number(e.target.value))}
            className="bg-white px-4 py-2 rounded-xl text-texto-fuerte font-bold shadow-sm outline-none cursor-pointer border border-black/5"
          >
            {periodos.length === 0 && <option value="" disabled>No hay periodos</option>}
            {periodos.map(p => (
              <option key={p.id_periodo} value={p.id_periodo}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {cargando ? (
        <p className="text-texto-suave mt-10">Cargando tu horario...</p>
      ) : periodos.length === 0 ? (
        <div className="bg-white p-12 rounded-4xl text-center shadow-sm border border-black/5 mt-10">
          <p className="text-texto-suave text-lg">Primero debes crear un periodo y materias para ver el horario.</p>
        </div>
      ) : (
        <div className="bg-white rounded-4xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-black/5 flex-1 flex flex-col overflow-hidden relative">
          
          {/* Contenedor con scroll para evitar que se rompa la cuadrícula */}
          <div className="flex-1 overflow-auto relative custom-scrollbar">
            
            {/* Esta caja asegura que todo mantenga un tamaño mínimo, alineando cabecera y cuerpo */}
            <div className="min-w-200 flex flex-col relative h-full">
              
              {/* Cabecera (Sticky para que siempre se vea al bajar) */}
              <div className="grid grid-cols-8 border-b border-black/5 bg-fondo-lateral/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
                <div className="p-4 border-r border-black/5 flex items-center justify-center bg-fondo-lateral/90">
                  <Clock size={20} className="text-texto-suave opacity-50" />
                </div>
                {diasDeLaSemana.map((dia) => (
                  <div key={dia.valor} className="p-4 text-center border-r border-black/5 last:border-r-0">
                    <h3 className="font-bold text-texto-fuerte">{dia.etiqueta}</h3>
                  </div>
                ))}
              </div>

              {/* Cuerpo del calendario */}
              <div className="relative flex-1 bg-fondo-principal/20">
                
                {/* Líneas verticales de fondo */}
                <div className="absolute inset-0 grid grid-cols-8 pointer-events-none">
                  <div className="col-span-1 border-r border-black/5 bg-white z-10"></div>
                  {diasDeLaSemana.map((_, idx) => (
                    <div key={idx} className="col-span-1 border-r border-black/5 last:border-r-0"></div>
                  ))}
                </div>

                {/* Líneas horizontales de las horas */}
                <div className="relative z-0">
                  {horasDelDia.map((hora) => (
                    <div 
                      key={hora} 
                      className="flex border-b border-black/5 w-full"
                      style={{ height: `${pixelesPorHora}px` }}
                    >
                      {/* Columna de las horas */}
                      <div className="w-[12.5%] shrink-0 text-center relative bg-white z-10 flex justify-center items-start pt-2">
                        <span className="text-xs font-bold text-texto-suave">
                          {hora > 12 ? `${hora - 12}:00 pm` : hora === 12 ? '12:00 pm' : `${hora}:00 am`}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Bloques de materias */}
                  {horariosDelPeriodo.map((horario) => {
                    const materia = materias.find(m => m.id_materia === horario.id_materia);
                    if (!materia) return null;

                    const { top, height } = calcularPosicionYAltura(horario.hora_inicio, horario.hora_fin);
                    const diaIndex = diasDeLaSemana.findIndex(d => d.valor === horario.dia_semana);
                    if (diaIndex === -1) return null;

                    return (
                      <button
                        key={horario.id_horario}
                        onClick={() => abrirModalEditar(horario)}
                        title={`Editar horario de ${materia.nombre}`}
                        aria-label={`Editar horario de ${materia.nombre}`}
                        className="absolute rounded-xl shadow-sm border border-black/5 overflow-hidden hover:scale-[1.02] transition-transform flex items-center justify-center p-2 z-20 hover:z-30 group"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left: `${12.5 + (diaIndex * 12.5)}%`, 
                          width: '12.5%', 
                          backgroundColor: materia.color || '#a0add3',
                        }}
                      >
                        <span className="font-bold text-texto-fuerte text-xs sm:text-sm leading-tight text-center group-hover:underline decoration-black/30 decoration-2 underline-offset-2 wrap-break-word">
                          {materia.nombre}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DE EDICIÓN DE HORARIO ================= */}
      {modalAbierto && horarioEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-4xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative border border-black/5">
            <button 
              onClick={() => setModalAbierto(false)} 
              title="Cerrar" 
              aria-label="Cerrar modal" 
              className="absolute top-8 right-8 text-texto-suave hover:bg-black/5 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-2xl font-semibold text-texto-fuerte mb-2">Ajustar horario</h3>
            <p className="text-texto-suave font-medium mb-8">
              {materias.find(m => m.id_materia === horarioEditando.id_materia)?.nombre}
            </p>

            <form onSubmit={guardarHorario} className="space-y-6">
              <div>
                <label htmlFor="diaSemanaEdit" className="block text-sm font-medium mb-2 px-1 text-texto-suave">Día de la semana</label>
                <select 
                  id="diaSemanaEdit"
                  title="Día de la semana"
                  required 
                  value={diaSemana} 
                  onChange={(e) => setDiaSemana(e.target.value)} 
                  className="w-full bg-fondo-principal p-4 rounded-2xl focus:ring-4 focus:ring-boton-hover/50 text-texto-fuerte font-semibold outline-none cursor-pointer"
                >
                  <option value="" disabled className="text-texto-suave/60 font-normal">-- Selecciona un día --</option>
                  {diasDeLaSemana.map(dia => <option key={dia.valor} value={dia.valor}>{dia.etiqueta}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="horaInicioEdit" className="block text-sm font-medium mb-2 px-1 text-texto-suave">Hora de inicio</label>
                  <input 
                    id="horaInicioEdit"
                    title="Hora de inicio"
                    required 
                    type="time" 
                    value={horaInicio} 
                    onChange={(e) => setHoraInicio(e.target.value)} 
                    className="w-full bg-fondo-principal p-4 rounded-2xl focus:ring-4 focus:ring-boton-hover/50 text-texto-fuerte font-semibold outline-none" 
                  />
                </div>
                <div>
                  <label htmlFor="horaFinEdit" className="block text-sm font-medium mb-2 px-1 text-texto-suave">Hora de fin</label>
                  <input 
                    id="horaFinEdit"
                    title="Hora de fin"
                    required 
                    type="time" 
                    value={horaFin} 
                    onChange={(e) => setHoraFin(e.target.value)} 
                    className="w-full bg-fondo-principal p-4 rounded-2xl focus:ring-4 focus:ring-boton-hover/50 text-texto-fuerte font-semibold outline-none" 
                  />
                </div>
              </div>
              
              <div className="pt-4 flex flex-col gap-3">
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-texto-fuerte text-white py-4 rounded-2xl font-medium shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                    <Edit2 size={16} /> Guardar
                  </button>
                  <button type="button" onClick={() => setModalAbierto(false)} className="px-6 py-4 rounded-2xl font-medium text-texto-suave hover:bg-black/5 transition-colors">
                    Cancelar
                  </button>
                </div>
                
                <button 
                  type="button" 
                  onClick={() => borrarHorario(horarioEditando.id_horario)} 
                  className="w-full py-4 rounded-2xl font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Eliminar este bloque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Horarios;