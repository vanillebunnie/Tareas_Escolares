import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Circle, X } from 'lucide-react';
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

function Tareas() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [idPeriodoSeleccionado, setIdPeriodoSeleccionado] = useState<number | ''>('');
  const [cargando, setCargando] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  
  const [idTareaEdicion, setIdTareaEdicion] = useState<number | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [idMateria, setIdMateria] = useState<number | ''>('');

  const cargarDatos = async () => {
    try {
      const [resP, resM, resT] = await Promise.all([
        api.get('/periodos/'), api.get('/materias/'), api.get('/tareas/')
      ]);
      setPeriodos(resP.data);
      setMaterias(resM.data);
      setTareas(resT.data);
      if (resP.data.length > 0 && idPeriodoSeleccionado === '') {
        setIdPeriodoSeleccionado(resP.data[0].id_periodo);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, [idPeriodoSeleccionado]);

  const materiasDelPeriodo = materias.filter(m => m.id_periodo === idPeriodoSeleccionado);
  const idsMaterias = materiasDelPeriodo.map(m => m.id_materia);
  const tareasDelPeriodo = tareas.filter(t => idsMaterias.includes(t.id_materia));

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const tareasPendientes = tareasDelPeriodo.filter(t => !t.completada && new Date(t.fecha_entrega) >= hoy);
  const tareasVencidas = tareasDelPeriodo.filter(t => !t.completada && new Date(t.fecha_entrega) < hoy);
  const tareasCompletadas = tareasDelPeriodo.filter(t => t.completada);

  const abrirModalCrear = () => {
    setModoEdicion(false); setTitulo(''); setDescripcion(''); setFechaEntrega(''); setIdMateria(materiasDelPeriodo.length > 0 ? materiasDelPeriodo[0].id_materia : ''); setModalAbierto(true);
  };

  const abrirModalEditar = (tarea: Tarea) => {
    setModoEdicion(true); setIdTareaEdicion(tarea.id_tarea); setTitulo(tarea.titulo); setDescripcion(tarea.descripcion); setFechaEntrega(tarea.fecha_entrega.split('T')[0]); setIdMateria(tarea.id_materia); setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false); setIdTareaEdicion(null);
  };

  const guardarTarea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const datosTarea = { titulo, descripcion, fecha_entrega: fechaEntrega, id_materia: Number(idMateria) };
      if (modoEdicion && idTareaEdicion) await api.put(`/tareas/${idTareaEdicion}`, datosTarea);
      else await api.post('/tareas/', datosTarea);
      cerrarModal();
      cargarDatos();
    } catch (error) { alert('Error al guardar la tarea.'); }
  };

  const eliminarTarea = async (id: number) => {
    if (!window.confirm('¿Estás segura de eliminar esta tarea?')) return;
    try { await api.delete(`/tareas/${id}`); cargarDatos(); } 
    catch (error) { alert('Error al eliminar la tarea.'); }
  };

  const marcarCompletada = async (id: number) => {
    try { await api.patch(`/tareas/${id}/completar`); cargarDatos(); } 
    catch (error) { alert('Error al actualizar el estado de la tarea.'); }
  };

  const TarjetaTarea = ({ tarea }: { tarea: Tarea }) => {
    const materia = materias.find(m => m.id_materia === tarea.id_materia);
    const fecha = new Date(tarea.fecha_entrega);
    const estaVencida = fecha < hoy && !tarea.completada;
    const colorTexto = obtenerColorTexto(materia?.color || '#a0add3');

    return (
      <div className={`bg-fondo-tarjeta rounded-2xl shadow-sm flex flex-col relative overflow-hidden transition-opacity border border-transparent ${tarea.completada ? 'opacity-60' : ''}`}>
        <div className="p-4 flex justify-between items-start gap-4" style={{ backgroundColor: materia?.color || '#f3f4f6', color: colorTexto }}>
          <div className="flex-1 min-w-0">
            <h4 className={`text-lg font-normal wrap-break-word ${tarea.completada ? 'line-through opacity-70' : ''}`}>
              {tarea.titulo}
            </h4>
            <p className="text-sm font-normal mt-1 opacity-90">
              {materia?.nombre}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => abrirModalEditar(tarea)} className="p-1.5 opacity-60 hover:opacity-100 transition-opacity" style={{ color: colorTexto }} title="Editar tarea">
              <Edit2 size={18} />
            </button>
            <button onClick={() => eliminarTarea(tarea.id_tarea)} className="p-1.5 opacity-60 hover:text-red-500 hover:opacity-100 transition-colors" style={{ color: colorTexto }} title="Eliminar tarea">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <p className="text-sm text-texto-suave whitespace-pre-wrap">{tarea.descripcion}</p>

          <div className="mt-2 pt-3 border-t border-black/5 flex justify-between items-center">
            <p className={`text-sm ${estaVencida ? 'text-red-500' : 'text-texto-suave'}`}>
              Entrega: {fecha.toLocaleDateString()}
            </p>
            {!tarea.completada && (
              <button 
                onClick={() => marcarCompletada(tarea.id_tarea)}
                className="flex items-center gap-1.5 text-sm text-green-500 hover:text-green-600 font-medium"
              >
                <Circle size={16} /> Completar
              </button>
            )}
            {tarea.completada && (
              <span className="flex items-center gap-1.5 text-sm text-green-500 font-medium">
                <CheckCircle size={16} /> Completada
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-texto-fuerte mb-1">Gestión de tareas</h2>
          <p className="text-texto-suave">Administra tus pendientes, entregas y proyectos</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-fondo-tarjeta p-2.5 rounded-xl shadow-sm flex items-center gap-3 border border-transparent">
            <label htmlFor="selectorPeriodo" className="text-sm text-texto-suave pl-2">Periodo:</label>
            <select
              id="selectorPeriodo"
              value={idPeriodoSeleccionado}
              onChange={(e) => setIdPeriodoSeleccionado(Number(e.target.value))}
              className="bg-fondo-principal px-3 py-1.5 rounded-lg text-texto-fuerte outline-none cursor-pointer border border-transparent"
            >
              {periodos.length === 0 && <option value="" disabled>No hay periodos</option>}
              {periodos.map(p => (
                <option key={p.id_periodo} value={p.id_periodo}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={abrirModalCrear}
            disabled={materiasDelPeriodo.length === 0}
            className="bg-texto-fuerte text-fondo-principal px-4 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed border border-transparent"
          >
            <Plus size={20} /> Agregar tarea
          </button>
        </div>
      </div>

      {cargando ? (
        <p className="text-texto-suave mt-10 text-center">Cargando tareas...</p>
      ) : materiasDelPeriodo.length === 0 ? (
        <div className="bg-fondo-tarjeta p-12 rounded-2xl text-center shadow-sm mt-10 border border-transparent">
          <p className="text-texto-suave text-lg">Para agregar tareas, primero debes tener materias registradas en este periodo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h3 className="text-lg font-medium text-texto-fuerte">Pendientes</h3>
              <span className="bg-fondo-lateral text-texto-fuerte text-xs px-2 py-1 rounded-full">{tareasPendientes.length}</span>
            </div>
            {tareasPendientes.length === 0 ? (
              <p className="text-sm text-texto-suave opacity-60 italic">No tienes tareas pendientes.</p>
            ) : (
              tareasPendientes.map(t => <TarjetaTarea key={t.id_tarea} tarea={t} />)
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h3 className="text-lg font-medium text-red-500">Vencidas</h3>
              <span className="bg-red-500/20 text-red-500 text-xs px-2 py-1 rounded-full">{tareasVencidas.length}</span>
            </div>
            {tareasVencidas.length === 0 ? (
              <p className="text-sm text-texto-suave opacity-60 italic">No tienes tareas vencidas.</p>
            ) : (
              tareasVencidas.map(t => <TarjetaTarea key={t.id_tarea} tarea={t} />)
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h3 className="text-lg font-medium text-green-600">Completadas</h3>
              <span className="bg-green-500/20 text-green-600 text-xs px-2 py-1 rounded-full">{tareasCompletadas.length}</span>
            </div>
            {tareasCompletadas.length === 0 ? (
              <p className="text-sm text-texto-suave opacity-60 italic">Aún no has completado tareas.</p>
            ) : (
              tareasCompletadas.map(t => <TarjetaTarea key={t.id_tarea} tarea={t} />)
            )}
          </div>

        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-fondo-tarjeta w-full max-w-md rounded-2xl p-6 shadow-xl relative border border-transparent">
            <button 
              onClick={cerrarModal} 
              className="absolute top-4 right-4 text-texto-suave hover:text-texto-fuerte transition-colors"
              title="Cerrar ventana"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-2xl font-normal text-texto-fuerte mb-6">
              {modoEdicion ? 'Editar tarea' : 'Agregar tarea'}
            </h3>

            <form onSubmit={guardarTarea} className="space-y-4">
              <div>
                <label htmlFor="tituloTarea" className="block text-sm text-texto-suave mb-1">Nombre de la tarea</label>
                <input 
                  id="tituloTarea"
                  required 
                  type="text" 
                  value={titulo} 
                  onChange={(e) => setTitulo(e.target.value)} 
                  className="w-full bg-fondo-principal text-texto-fuerte p-3 rounded-lg focus:ring-2 focus:ring-boton-hover outline-none border border-transparent"
                  placeholder="Ej. Resumen del capítulo 1"
                />
              </div>

              <div>
                <label htmlFor="materiaTarea" className="block text-sm text-texto-suave mb-1">Materia</label>
                <select 
                  id="materiaTarea"
                  required 
                  value={idMateria} 
                  onChange={(e) => setIdMateria(Number(e.target.value))} 
                  className="w-full bg-fondo-principal text-texto-fuerte p-3 rounded-lg focus:ring-2 focus:ring-boton-hover outline-none cursor-pointer border border-transparent"
                >
                  <option value="" disabled>-- Selecciona una materia --</option>
                  {materiasDelPeriodo.map(m => (
                    <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="fechaTarea" className="block text-sm text-texto-suave mb-1">Fecha de entrega</label>
                <input 
                  id="fechaTarea"
                  required 
                  type="date" 
                  value={fechaEntrega} 
                  onChange={(e) => setFechaEntrega(e.target.value)} 
                  className="w-full bg-fondo-principal text-texto-fuerte p-3 rounded-lg focus:ring-2 focus:ring-boton-hover outline-none border border-transparent"
                />
              </div>

              <div>
                <label htmlFor="descTarea" className="block text-sm text-texto-suave mb-1">Descripción</label>
                <textarea 
                  id="descTarea"
                  required 
                  rows={3}
                  value={descripcion} 
                  onChange={(e) => setDescripcion(e.target.value)} 
                  className="w-full bg-fondo-principal text-texto-fuerte p-3 rounded-lg focus:ring-2 focus:ring-boton-hover outline-none resize-none border border-transparent"
                  placeholder="Instrucciones o detalles de la tarea..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={cerrarModal} className="flex-1 py-3 bg-fondo-principal text-texto-suave rounded-lg hover:brightness-95 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-3 bg-texto-fuerte text-fondo-principal rounded-lg hover:opacity-90 transition-opacity">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tareas;