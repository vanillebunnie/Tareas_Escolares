import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '../services/api';

interface Periodo { id_periodo: number; nombre: string; }
interface Materia { id_materia: number; nombre: string; color: string; id_periodo: number; }
interface Tarea { id_tarea: number; titulo: string; descripcion: string; fecha_entrega: string; completada: boolean; id_materia: number; }

// Fórmula para calcular contraste
const obtenerColorTexto = (hexColor: string) => {
  if (!hexColor) return '#1a182c';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.length === 3 ? hex.slice(0, 1).repeat(2) : hex.substring(0, 2), 16);
  const g = parseInt(hex.length === 3 ? hex.slice(1, 2).repeat(2) : hex.substring(2, 4), 16);
  const b = parseInt(hex.length === 3 ? hex.slice(2, 3).repeat(2) : hex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#1a182c' : '#ffffff';
};

function Calendario() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [idPeriodoSeleccionado, setIdPeriodoSeleccionado] = useState<number | ''>('');
  
  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [fechaSeleccionadaDia, setFechaSeleccionadaDia] = useState<Date | null>(null);

  const cargarDatos = async () => {
    try {
      const [resP, resM, resT] = await Promise.all([
        api.get('/periodos/'), api.get('/materias/'), api.get('/tareas/')
      ]);
      setPeriodos(resP.data); setMaterias(resM.data); setTareas(resT.data);
      if (resP.data.length > 0 && idPeriodoSeleccionado === '') setIdPeriodoSeleccionado(resP.data[0].id_periodo);
    } catch (error) { console.error("Error cargando datos:", error); }
  };

  useEffect(() => { cargarDatos(); }, [idPeriodoSeleccionado]);

  const materiasDelPeriodo = materias.filter(m => m.id_periodo === idPeriodoSeleccionado);
  const idsMaterias = materiasDelPeriodo.map(m => m.id_materia);
  const tareasDelPeriodo = tareas.filter(t => idsMaterias.includes(t.id_materia));

  const mesCalendario = fechaCalendario.getMonth();
  const anioCalendario = fechaCalendario.getFullYear();
  const diasEnMes = new Date(anioCalendario, mesCalendario + 1, 0).getDate();
  const primerDiaMes = new Date(anioCalendario, mesCalendario, 1).getDay();

  const irAMesAnterior = () => setFechaCalendario(new Date(anioCalendario, mesCalendario - 1, 1));
  const irAMesSiguiente = () => setFechaCalendario(new Date(anioCalendario, mesCalendario + 1, 1));

  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const diasSemanaCorto = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  const formatearFechaLarga = (fecha: Date) => {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = nombresMeses[fecha.getMonth()].toLowerCase();
    const anio = fecha.getFullYear();
    return `${dia} de ${mes} del ${anio}`;
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-texto-fuerte mb-1">Calendario de entregas</h2>
          <p className="text-texto-suave">Visualiza tus tareas pendientes en el mes</p>
        </div>
        
        <div className="bg-fondo-tarjeta p-2.5 rounded-xl shadow-sm border border-transparent flex items-center gap-3">
          <label htmlFor="selectorPeriodo" className="text-sm text-texto-suave pl-2">Periodo:</label>
          <select
            id="selectorPeriodo"
            title="Seleccionar periodo"
            value={idPeriodoSeleccionado}
            onChange={(e) => setIdPeriodoSeleccionado(Number(e.target.value))}
            className="bg-fondo-principal px-3 py-1.5 rounded-lg text-texto-fuerte outline-none cursor-pointer border border-transparent"
          >
            {periodos.length === 0 && <option value="" disabled>No hay periodos</option>}
            {periodos.map(p => <option key={p.id_periodo} value={p.id_periodo}>{p.nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-fondo-tarjeta rounded-3xl shadow-sm border border-transparent p-6 sm:p-10">
        <div className="flex justify-between items-center mb-8">
          <button onClick={irAMesAnterior} className="p-2 hover:bg-fondo-principal rounded-xl text-texto-suave transition-colors" title="Mes anterior" aria-label="Mes anterior">
            <ChevronLeft size={24} />
          </button>
          <h3 className="text-2xl font-medium text-texto-fuerte">{nombresMeses[mesCalendario]} {anioCalendario}</h3>
          <button onClick={irAMesSiguiente} className="p-2 hover:bg-fondo-principal rounded-xl text-texto-suave transition-colors" title="Mes siguiente" aria-label="Mes siguiente">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center mb-4">
          {diasSemanaCorto.map(dia => <div key={dia} className="text-sm font-semibold text-texto-suave">{dia}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {Array.from({ length: primerDiaMes }).map((_, i) => <div key={`vacio-${i}`} className="min-h-20 sm:min-h-30"></div>)}
          
          {Array.from({ length: diasEnMes }).map((_, i) => {
            const dia = i + 1;
            const tareasDelDia = tareasDelPeriodo.filter(t => {
              const [anioT, mesT, diaT] = t.fecha_entrega.split('T')[0].split('-');
              return parseInt(anioT) === anioCalendario && (parseInt(mesT) - 1) === mesCalendario && parseInt(diaT) === dia;
            });

            return (
              <div 
                key={dia} 
                onClick={() => setFechaSeleccionadaDia(new Date(anioCalendario, mesCalendario, dia))}
                className="min-h-20 sm:min-h-30 flex flex-col py-2 px-1 sm:px-3 bg-fondo-principal shadow-sm rounded-2xl cursor-pointer hover:brightness-95 transition-colors overflow-hidden border border-transparent"
              >
                <span className="text-sm font-medium text-texto-fuerte mb-1">{dia}</span>
                <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1">
                  {tareasDelDia.map(tarea => {
                    const materia = materias.find(m => m.id_materia === tarea.id_materia);
                    const colorTexto = obtenerColorTexto(materia?.color || '#a0add3');
                    return (
                      <div 
                        key={tarea.id_tarea} 
                        className={`text-[10px] sm:text-xs truncate px-2 py-1 rounded-md font-medium ${tarea.completada ? 'opacity-50 line-through' : ''}`}
                        style={{ backgroundColor: materia?.color || '#a0add3', color: colorTexto }}
                        title={tarea.titulo}
                      >
                        {tarea.titulo}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {fechaSeleccionadaDia && (() => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const tareasDelDia = tareasDelPeriodo.filter(t => {
          const [anioT, mesT, diaT] = t.fecha_entrega.split('T')[0].split('-');
          return parseInt(anioT) === fechaSeleccionadaDia.getFullYear() && 
                 (parseInt(mesT) - 1) === fechaSeleccionadaDia.getMonth() && 
                 parseInt(diaT) === fechaSeleccionadaDia.getDate();
        });

        const completadasDia = tareasDelDia.filter(t => t.completada);
        const pendientesDia = tareasDelDia.filter(t => !t.completada && new Date(t.fecha_entrega) >= hoy);
        const vencidasDia = tareasDelDia.filter(t => !t.completada && new Date(t.fecha_entrega) < hoy);

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-fondo-tarjeta rounded-xl w-full max-w-sm relative overflow-hidden shadow-xl border border-transparent">
              <div className="bg-fondo-lateral p-5 pr-12 relative border-b border-black/5">
                <button 
                  onClick={() => setFechaSeleccionadaDia(null)} 
                  className="absolute top-5 right-4 text-texto-fuerte hover:opacity-70 transition-colors"
                  title="Cerrar ventana"
                  aria-label="Cerrar ventana"
                >
                  <X size={20} />
                </button>
                <h3 className="text-xl font-normal text-texto-fuerte">Tareas para el {formatearFechaLarga(fechaSeleccionadaDia)}</h3>
              </div>
              
              <div className="p-5 max-h-80 overflow-y-auto">
                {tareasDelDia.length === 0 ? (
                  <p className="text-texto-suave opacity-60 text-sm text-center py-4">No hay tareas para este día.</p>
                ) : (
                  <div className="space-y-4">
                    {pendientesDia.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-texto-suave mb-2">Pendientes</h4>
                        <div className="space-y-2">
                          {pendientesDia.map(tarea => {
                            const materia = materias.find(m => m.id_materia === tarea.id_materia);
                            return (
                              <div key={tarea.id_tarea} className="flex items-center gap-3 p-2 bg-fondo-principal shadow-sm rounded-lg border border-transparent">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: materia?.color || '#a0add3' }}></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-texto-fuerte truncate">{tarea.titulo}</p>
                                  <p className="text-xs text-texto-suave font-normal truncate">{materia?.nombre}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {vencidasDia.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-red-500 mb-2">Vencidas</h4>
                        <div className="space-y-2">
                          {vencidasDia.map(tarea => {
                            const materia = materias.find(m => m.id_materia === tarea.id_materia);
                            return (
                              <div key={tarea.id_tarea} className="flex items-center gap-3 p-2 bg-red-500/10 rounded-lg border border-transparent">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: materia?.color || '#a0add3' }}></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-red-500 truncate">{tarea.titulo}</p>
                                  <p className="text-xs text-red-400 font-normal truncate">{materia?.nombre}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {completadasDia.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-texto-suave opacity-60 mb-2">Completadas</h4>
                        <div className="space-y-2">
                          {completadasDia.map(tarea => {
                            const materia = materias.find(m => m.id_materia === tarea.id_materia);
                            return (
                              <div key={tarea.id_tarea} className="flex items-center gap-3 p-2 bg-fondo-principal shadow-sm rounded-lg opacity-60 border border-transparent">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: materia?.color || '#a0add3' }}></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-texto-suave line-through truncate">{tarea.titulo}</p>
                                  <p className="text-xs text-texto-suave opacity-70 font-normal truncate">{materia?.nombre}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default Calendario;