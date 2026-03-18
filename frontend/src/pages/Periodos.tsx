import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Clock } from 'lucide-react';
import api from '../services/api';

interface Periodo { id_periodo: number; nombre: string; fecha_inicio: string; fecha_fin: string; }
interface Materia { id_materia: number; nombre: string; profesor: string; id_periodo: number; color: string; }
interface Horario { id_horario: number; dia_semana: string; hora_inicio: string; hora_fin: string; id_materia: number; }

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

function Periodos() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [cargando, setCargando] = useState(true);

  const [modalPeriodoAbierto, setModalPeriodoAbierto] = useState(false);
  const [idPeriodoEditando, setIdPeriodoEditando] = useState<number | null>(null);
  const [nombrePeriodo, setNombrePeriodo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [materiaVista, setMateriaVista] = useState<Materia | null>(null);
  const [modalMateriaAbierto, setModalMateriaAbierto] = useState(false);
  const [idMateriaEditando, setIdMateriaEditando] = useState<number | null>(null);
  const [idPeriodoParaMateria, setIdPeriodoParaMateria] = useState<number | null>(null);
  const [nombreMateria, setNombreMateria] = useState('');
  const [profesorMateria, setProfesorMateria] = useState('');
  const [colorMateria, setColorMateria] = useState('#a0add3');

  const [modalHorarioAbierto, setModalHorarioAbierto] = useState(false);
  const [idHorarioEditando, setIdHorarioEditando] = useState<number | null>(null);
  const [diaSemana, setDiaSemana] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  const diasDeLaSemana = [
    { valor: 'Lun', etiqueta: 'Lunes' }, { valor: 'Mar', etiqueta: 'Martes' },
    { valor: 'Mie', etiqueta: 'Miércoles' }, { valor: 'Jue', etiqueta: 'Jueves' },
    { valor: 'Vie', etiqueta: 'Viernes' }, { valor: 'Sab', etiqueta: 'Sábado' },
    { valor: 'Dom', etiqueta: 'Domingo' }
  ];

  const cargarDatos = async () => {
    try {
      const [resPeriodos, resMaterias, resHorarios] = await Promise.all([
        api.get('/periodos/'), api.get('/materias/'), api.get('/horarios/')
      ]);
      setPeriodos(resPeriodos.data);
      setMaterias(resMaterias.data);
      setHorarios(resHorarios.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const guardarPeriodo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const datosPeriodo = { nombre: nombrePeriodo, fecha_inicio: fechaInicio, fecha_fin: fechaFin };
      if (idPeriodoEditando) await api.put(`/periodos/${idPeriodoEditando}`, datosPeriodo);
      else await api.post('/periodos/', datosPeriodo);
      setModalPeriodoAbierto(false);
      cargarDatos();
    } catch (error: any) { alert(`Error: ${error.response?.data?.error || 'Error al guardar el periodo'}`); }
  };

  const borrarPeriodo = async (id: number) => {
    if (!window.confirm('¿Estás segura de que deseas eliminar este periodo escolar?')) return;
    try { await api.delete(`/periodos/${id}`); cargarDatos(); } 
    catch (error) { alert('Error al intentar eliminar el periodo.'); }
  };

  const abrirModalNuevoPeriodo = () => {
    setIdPeriodoEditando(null); setNombrePeriodo(''); setFechaInicio(''); setFechaFin(''); setModalPeriodoAbierto(true);
  };

  const abrirModalEditarPeriodo = (periodo: Periodo) => {
    setIdPeriodoEditando(periodo.id_periodo); setNombrePeriodo(periodo.nombre);
    setFechaInicio(new Date(periodo.fecha_inicio).toISOString().split('T')[0]);
    setFechaFin(new Date(periodo.fecha_fin).toISOString().split('T')[0]);
    setModalPeriodoAbierto(true);
  };

  const guardarMateria = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const datosMateria = { nombre: nombreMateria, profesor: profesorMateria, id_periodo: idPeriodoParaMateria, color: colorMateria };
      if (idMateriaEditando) {
        await api.put(`/materias/${idMateriaEditando}`, datosMateria);
        if (materiaVista && materiaVista.id_materia === idMateriaEditando) setMateriaVista({ ...materiaVista, ...datosMateria } as Materia);
      } else {
        await api.post('/materias/', datosMateria);
      }
      setModalMateriaAbierto(false);
      cargarDatos();
    } catch (error: any) { alert(`Error: ${error.response?.data?.error || 'Error al guardar la materia'}`); }
  };

  const borrarMateria = async (id: number) => {
    if (!window.confirm('¿Deseas eliminar esta materia y todos sus horarios?')) return;
    try { await api.delete(`/materias/${id}`); setMateriaVista(null); cargarDatos(); } 
    catch (error) { alert('Error al eliminar la materia.'); }
  };

  const abrirModalNuevaMateria = (id_periodo: number) => {
    setIdMateriaEditando(null); setIdPeriodoParaMateria(id_periodo); setNombreMateria(''); setProfesorMateria(''); setColorMateria('#a0add3'); setModalMateriaAbierto(true);
  };

  const abrirModalEditarMateria = (materia: Materia) => {
    setIdMateriaEditando(materia.id_materia); setIdPeriodoParaMateria(materia.id_periodo); setNombreMateria(materia.nombre); setProfesorMateria(materia.profesor || ''); setColorMateria(materia.color || '#a0add3'); setModalMateriaAbierto(true);
  };

  const guardarHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const datosHorario = { id_materia: materiaVista?.id_materia, dia_semana: diaSemana, hora_inicio: horaInicio, hora_fin: horaFin };
      if (idHorarioEditando) await api.put(`/horarios/${idHorarioEditando}`, datosHorario);
      else await api.post('/horarios/', datosHorario);
      setModalHorarioAbierto(false);
      cargarDatos();
    } catch (error: any) { alert(`Error: ${error.response?.data?.error || 'Error al guardar el horario'}`); }
  };

  const borrarHorario = async (id: number) => {
    if (!window.confirm('¿Deseas eliminar este horario?')) return;
    try { await api.delete(`/horarios/${id}`); cargarDatos(); } 
    catch (error) { alert('Error al eliminar el horario.'); }
  };

  const abrirModalNuevoHorario = () => {
    setIdHorarioEditando(null); setDiaSemana(''); setHoraInicio('07:00'); setHoraFin('08:00'); setModalHorarioAbierto(true);
  };

  const abrirModalEditarHorario = (horario: Horario) => {
    setIdHorarioEditando(horario.id_horario); setDiaSemana(horario.dia_semana); setHoraInicio(horario.hora_inicio.substring(0, 5)); setHoraFin(horario.hora_fin.substring(0, 5)); setModalHorarioAbierto(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-medium text-texto-fuerte mb-2">Periodos escolares</h2>
          <p className="text-texto-suave">Administra tus semestres, materias y clases en un solo lugar.</p>
        </div>
        <button onClick={abrirModalNuevoPeriodo} className="flex items-center gap-2 bg-boton-activo text-texto-fuerte px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all hover:scale-105 font-medium">
          <Plus size={18} /> Nuevo periodo
        </button>
      </div>

      {cargando ? (
        <p className="text-texto-suave">Cargando información...</p>
      ) : periodos.length === 0 ? (
        <div className="bg-fondo-tarjeta p-12 rounded-4xl text-center shadow-sm">
          <p className="text-texto-suave text-lg">Aún no tienes periodos registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {periodos.map((periodo) => {
            const materiasDelPeriodo = materias.filter(m => m.id_periodo === periodo.id_periodo);
            return (
              <div key={periodo.id_periodo} className="bg-fondo-tarjeta rounded-4xl shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md border border-transparent">
                <div className="bg-fondo-lateral px-6 py-5 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-texto-fuerte truncate pr-2">Periodo: {periodo.nombre}</h3>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => abrirModalEditarPeriodo(periodo)} aria-label={`Editar periodo ${periodo.nombre}`} title="Editar periodo" className="p-2 text-texto-suave hover:bg-fondo-principal rounded-xl hover:text-texto-fuerte transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => borrarPeriodo(periodo.id_periodo)} aria-label={`Eliminar periodo ${periodo.nombre}`} title="Eliminar periodo" className="p-2 text-texto-suave hover:bg-red-500/10 rounded-xl hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1 bg-fondo-tarjeta">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                      <span className="text-texto-suave text-xs font-bold uppercase tracking-wider mb-1">Inicio</span>
                      <span className="text-texto-fuerte font-medium">{new Date(periodo.fecha_inicio).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-texto-suave text-xs font-bold uppercase tracking-wider mb-1">Fin</span>
                      <span className="text-texto-fuerte font-medium">{new Date(periodo.fecha_fin).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="bg-fondo-principal rounded-2xl p-4 flex flex-col flex-1">
                    <span className="text-xs font-bold text-texto-suave uppercase tracking-wider mb-3 px-2">Materias registradas</span>
                    {materiasDelPeriodo.length === 0 ? (
                      <p className="text-sm text-texto-suave/70 italic mb-4 px-2">No hay materias en este periodo.</p>
                    ) : (
                      <div className="space-y-1 mb-5 flex-1">
                        {materiasDelPeriodo.map((materia) => (
                          <button key={materia.id_materia} onClick={() => setMateriaVista(materia)} title={`Ver detalles de ${materia.nombre}`} aria-label={`Ver detalles de ${materia.nombre}`} className="w-full flex items-center gap-3 text-sm text-texto-fuerte p-2 rounded-xl hover:bg-fondo-lateral/30 transition-colors text-left">
                            <div className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: materia.color || '#a0add3' }} />
                            <span className="truncate flex-1 font-medium">{materia.nombre}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <button onClick={() => abrirModalNuevaMateria(periodo.id_periodo)} className="w-full flex items-center justify-center gap-2 py-3 mt-auto bg-boton-activo text-texto-fuerte rounded-xl font-medium shadow-sm hover:scale-[1.02] transition-transform text-sm">
                      <Plus size={16} /> Agregar materia
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= TARJETA DE VISTA DE MATERIA ================= */}
      {materiaVista && (() => {
        const colorTexto = obtenerColorTexto(materiaVista.color || '#a0add3');
        return (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-fondo-tarjeta w-full max-w-lg rounded-4xl shadow-xl overflow-hidden flex flex-col relative border border-transparent">
              <button onClick={() => setMateriaVista(null)} className="absolute top-6 right-6 p-2 rounded-full transition-colors z-10 shadow-sm bg-black/10 hover:bg-black/20" style={{ color: colorTexto }} title="Cerrar vista" aria-label="Cerrar vista">
                <X size={20} />
              </button>
              <div className="px-8 pt-10 pb-8 flex flex-col relative" style={{ backgroundColor: materiaVista.color || '#a0add3', color: colorTexto }}>
                <div className="bg-black/10 self-start px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 shadow-sm" style={{ color: colorTexto }}>
                  {periodos.find(p => p.id_periodo === materiaVista.id_periodo)?.nombre || 'Periodo'}
                </div>
                <h3 className="text-3xl font-bold mb-2 leading-tight" style={{ color: colorTexto }}>
                  {materiaVista.nombre}
                </h3>
                <p className="font-medium flex items-center gap-2" style={{ color: colorTexto }}>
                  <span className="opacity-70">Profesor:</span> {materiaVista.profesor || 'No asignado'}
                </p>
              </div>
              <div className="bg-fondo-principal px-8 py-4 flex gap-3 border-b border-black/5">
                <button onClick={() => abrirModalEditarMateria(materiaVista)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-fondo-tarjeta text-texto-suave hover:text-texto-fuerte rounded-xl font-medium shadow-sm transition-all text-sm border border-transparent">
                  <Edit2 size={16} /> Editar materia
                </button>
                <button onClick={() => borrarMateria(materiaVista.id_materia)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-fondo-tarjeta text-texto-suave hover:text-red-500 rounded-xl font-medium shadow-sm transition-all text-sm border border-transparent">
                  <Trash2 size={16} /> Eliminar materia
                </button>
              </div>
              <div className="p-8 bg-fondo-tarjeta flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-texto-suave uppercase tracking-wider text-sm flex items-center gap-2">
                    <Clock size={16} /> <span>Horarios de clase</span>
                  </h4>
                </div>
                <div className="space-y-3 mb-6">
                  {horarios.filter(h => h.id_materia === materiaVista.id_materia).length === 0 ? (
                    <p className="text-sm text-texto-suave/70 italic p-4 bg-fondo-principal rounded-2xl text-center">
                      Aún no has registrado horarios para esta clase.
                    </p>
                  ) : (
                    horarios.filter(h => h.id_materia === materiaVista.id_materia).map(horario => {
                        const nombreDia = diasDeLaSemana.find(d => d.valor === horario.dia_semana)?.etiqueta || horario.dia_semana;
                        return (
                          <button key={horario.id_horario} onClick={() => abrirModalEditarHorario(horario)} title="Editar horario" aria-label={`Editar horario del día ${nombreDia}`} className="w-full bg-fondo-principal hover:bg-fondo-lateral/30 p-4 rounded-2xl flex justify-between items-center transition-colors text-left group">
                            <span className="font-semibold text-texto-fuerte text-lg capitalize">{nombreDia}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-texto-suave font-medium">{horario.hora_inicio.substring(0, 5)} - {horario.hora_fin.substring(0, 5)}</span>
                              <Edit2 size={14} className="text-texto-suave opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        );
                      })
                  )}
                </div>
                <button onClick={abrirModalNuevoHorario} className="w-full flex items-center justify-center gap-2 py-3 bg-boton-activo text-texto-fuerte rounded-xl font-medium shadow-sm hover:scale-[1.02] transition-transform text-sm">
                  <Plus size={16} /> Agregar horario
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= MODAL: FORMULARIO DE PERIODOS ================= */}
      {modalPeriodoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-fondo-tarjeta w-full max-w-md rounded-4xl p-10 shadow-xl relative border border-transparent">
            <button onClick={() => setModalPeriodoAbierto(false)} title="Cerrar" aria-label="Cerrar modal de periodo" className="absolute top-8 right-8 text-texto-suave hover:bg-fondo-principal p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-semibold text-texto-fuerte mb-8">{idPeriodoEditando ? 'Editar periodo' : 'Nuevo periodo'}</h3>
            <form onSubmit={guardarPeriodo} className="space-y-6">
              <div>
                <label htmlFor="nombrePeriodo" className="block text-sm font-medium mb-2 px-1 text-texto-suave">Nombre del periodo</label>
                <input id="nombrePeriodo" title="Nombre del periodo" required type="text" value={nombrePeriodo} onChange={(e) => setNombrePeriodo(e.target.value)} placeholder="Ej. primer cuatrimestre" className="w-full bg-fondo-principal p-4 rounded-2xl focus:ring-4 focus:ring-boton-hover/50 text-texto-fuerte font-semibold outline-none border border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fechaInicio" className="block text-sm font-medium mb-2 px-1 text-texto-suave">Fecha de inicio</label>
                  <input id="fechaInicio" title="Fecha de inicio" required type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full bg-fondo-principal p-4 rounded-2xl focus:ring-4 focus:ring-boton-hover/50 text-texto-fuerte font-semibold outline-none border border-transparent" />
                </div>
                <div>
                  <label htmlFor="fechaFin" className="block text-sm font-medium mb-2 px-1 text-texto-suave">Fecha de fin</label>
                  <input id="fechaFin" title="Fecha de fin" required type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full bg-fondo-principal p-4 rounded-2xl focus:ring-4 focus:ring-boton-hover/50 text-texto-fuerte font-semibold outline-none border border-transparent" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-texto-fuerte text-fondo-principal py-4 rounded-2xl font-medium shadow-lg hover:scale-[1.02] transition-transform">Guardar</button>
                <button type="button" onClick={() => setModalPeriodoAbierto(false)} className="px-6 py-4 rounded-2xl font-medium text-texto-suave hover:bg-fondo-principal transition-colors">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: FORMULARIO DE MATERIAS ================= */}
      {modalMateriaAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-fondo-tarjeta w-full max-w-md rounded-4xl p-10 shadow-xl relative border border-transparent">
            <button onClick={() => setModalMateriaAbierto(false)} title="Cerrar" aria-label="Cerrar modal de materia" className="absolute top-8 right-8 text-texto-suave hover:bg-fondo-principal p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-semibold text-texto-fuerte mb-8">{idMateriaEditando ? 'Editar materia' : 'Nueva materia'}</h3>
            <form onSubmit={guardarMateria} className="space-y-6">
              <div>
                <label htmlFor="nombreMateria" className="block text-sm font-medium mb-2 px-1 text-texto-suave">Nombre de la asignatura</label>
                <input id="nombreMateria" title="Nombre de la asignatura" required type="text" value={nombreMateria} onChange={(e) => setNombreMateria(e.target.value)} placeholder="Ej. cálculo diferencial" className="w-full bg-fondo-principal p-4 rounded-2xl focus:ring-4 focus:ring-boton-hover/50 text-texto-fuerte font-semibold outline-none border border-transparent" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <label htmlFor="profesorMateria" className="block text-sm font-medium mb-2 px-1 text-texto-suave">Profesor (Opcional)</label>
                  <input id="profesorMateria" title="Nombre del profesor" type="text" value={profesorMateria} onChange={(e) => setProfesorMateria(e.target.value)} placeholder="Ej. Juan Pérez" className="w-full bg-fondo-principal p-4 rounded-2xl focus:ring-4 focus:ring-boton-hover/50 text-texto-fuerte font-semibold outline-none border border-transparent" />
                </div>
                <div className="col-span-1">
                  <label htmlFor="colorMateria" className="block text-sm font-medium mb-2 px-1 text-texto-suave">Color</label>
                  <div className="w-full h-14 bg-fondo-principal p-2 rounded-2xl flex justify-center items-center border border-transparent">
                    <input id="colorMateria" title="Seleccionar color" type="color" value={colorMateria} onChange={(e) => setColorMateria(e.target.value)} className="w-full h-full rounded-xl cursor-pointer border-0 p-0 bg-transparent" />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-texto-fuerte text-fondo-principal py-4 rounded-2xl font-medium shadow-lg hover:scale-[1.02] transition-transform">Guardar</button>
                <button type="button" onClick={() => setModalMateriaAbierto(false)} className="px-6 py-4 rounded-2xl font-medium text-texto-suave hover:bg-fondo-principal transition-colors">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: FORMULARIO DE HORARIOS ================= */}
      {modalHorarioAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-fondo-tarjeta w-full max-w-sm rounded-4xl p-10 shadow-xl relative border border-transparent">
            <button onClick={() => setModalHorarioAbierto(false)} title="Cerrar" aria-label="Cerrar modal de horario" className="absolute top-8 right-8 text-texto-suave hover:bg-fondo-principal p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-semibold text-texto-fuerte mb-8">{idHorarioEditando ? 'Editar horario' : 'Nuevo horario'}</h3>
            <form onSubmit={guardarHorario} className="space-y-6">
              <div>
                <label htmlFor="diaSemana" className="block text-sm font-medium mb-2 px-1 text-texto-suave">Día de la semana</label>
                <select id="diaSemana" title="Día de la semana" required value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)} className="w-full bg-fondo-principal p-4 rounded-2xl focus:ring-4 focus:ring-boton-hover/50 text-texto-fuerte font-semibold outline-none cursor-pointer border border-transparent">
                  <option value="" disabled className="text-texto-suave/60 font-normal">-- Selecciona un día --</option>
                  {diasDeLaSemana.map(dia => <option key={dia.valor} value={dia.valor}>{dia.etiqueta}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="horaInicio" className="block text-sm font-medium mb-2 px-1 text-texto-suave">Hora de inicio</label>
                  <input id="horaInicio" title="Hora de inicio" required type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full bg-fondo-principal p-4 rounded-2xl focus:ring-4 focus:ring-boton-hover/50 text-texto-fuerte font-semibold outline-none border border-transparent" />
                </div>
                <div>
                  <label htmlFor="horaFin" className="block text-sm font-medium mb-2 px-1 text-texto-suave">Hora de fin</label>
                  <input id="horaFin" title="Hora de fin" required type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="w-full bg-fondo-principal p-4 rounded-2xl focus:ring-4 focus:ring-boton-hover/50 text-texto-fuerte font-semibold outline-none border border-transparent" />
                </div>
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-texto-fuerte text-fondo-principal py-4 rounded-2xl font-medium shadow-lg hover:scale-[1.02] transition-transform">Guardar</button>
                  <button type="button" onClick={() => setModalHorarioAbierto(false)} className="px-6 py-4 rounded-2xl font-medium text-texto-suave hover:bg-fondo-principal transition-colors">Cancelar</button>
                </div>
                {idHorarioEditando && (
                  <button type="button" onClick={() => { borrarHorario(idHorarioEditando); setModalHorarioAbierto(false); }} className="w-full py-4 rounded-2xl font-medium text-red-500 hover:bg-red-500/10 transition-colors">
                    Eliminar horario
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Periodos;