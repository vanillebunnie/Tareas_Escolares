import { useState, useEffect } from 'react';
import { Clock, Edit2, Trash2, X } from 'lucide-react';
import api from '../services/api';

// ================= CONTRATOS DE SEGURIDAD =================
interface Periodo {
  id_periodo: number;
  nombre: string;
}

interface Materia {
  id_materia: number;
  nombre: string;
  profesor: string;
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

  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [horarioEditando, setHorarioEditando] = useState<Horario | null>(null);
  const [diaSemana, setDiaSemana] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  const [modalInfoAbierto, setModalInfoAbierto] = useState(false);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<Horario | null>(null);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<Materia | null>(null);

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

  let diasAMostrar: typeof diasDeLaSemana = [];
  let horaInicioCalendario = 7;
  let horaFinCalendario = 15;

  if (horariosDelPeriodo.length > 0) {
    const diasConClase = new Set(horariosDelPeriodo.map(h => h.dia_semana));
    
    const tieneClasesEntreSemana = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'].some(d => diasConClase.has(d));
    const tieneClasesSabado = diasConClase.has('Sab');
    const tieneClasesDomingo = diasConClase.has('Dom');

    if (tieneClasesEntreSemana) {
      diasAMostrar.push(...diasDeLaSemana.filter(d => ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'].includes(d.valor)));
    }
    if (tieneClasesSabado) {
      diasAMostrar.push(diasDeLaSemana.find(d => d.valor === 'Sab')!);
    }
    if (tieneClasesDomingo) {
      diasAMostrar.push(diasDeLaSemana.find(d => d.valor === 'Dom')!);
    }

    const horasInicio = horariosDelPeriodo.map(h => parseInt(h.hora_inicio.split(':')[0], 10));
    const horasFin = horariosDelPeriodo.map(h => {
      const partes = h.hora_fin.split(':');
      return parseInt(partes[0], 10) + (parseInt(partes[1], 10) > 0 ? 1 : 0);
    });

    horaInicioCalendario = Math.min(...horasInicio);
    horaFinCalendario = Math.max(...horasFin);
    if (horaFinCalendario === horaInicioCalendario) horaFinCalendario += 1;
  }

  if (diasAMostrar.length === 0) {
    diasAMostrar = diasDeLaSemana.filter(d => ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'].includes(d.valor));
  }

  const horasDelDia = Array.from(
    { length: horaFinCalendario - horaInicioCalendario }, 
    (_, i) => i + horaInicioCalendario
  );

  const alturaTotalCalendario = horasDelDia.length * pixelesPorHora;

  const formatHora = (h: number) => {
    const ampm = h >= 12 ? 'pm' : 'am';
    const hora12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hora12}:00 ${ampm}`;
  };

  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const calcularPosicionYAltura = (horaInicioStr: string, horaFinStr: string) => {
    const minutosInicio = toMinutes(horaInicioStr);
    const minutosFin = toMinutes(horaFinStr);
    const minutosInicioCalendario = horaInicioCalendario * 60;

    const top = ((minutosInicio - minutosInicioCalendario) / 60) * pixelesPorHora;
    const height = ((minutosFin - minutosInicio) / 60) * pixelesPorHora;

    return { top, height };
  };

  const superposiciones: Record<number, { widthMultiplier: number, offsetIndex: number }> = {};
  const clasesPorDia = horariosDelPeriodo.reduce((acc, h) => {
    if (!acc[h.dia_semana]) acc[h.dia_semana] = [];
    acc[h.dia_semana].push(h);
    return acc;
  }, {} as Record<string, Horario[]>);

  for (const dia in clasesPorDia) {
    const clases = clasesPorDia[dia].sort((a, b) => toMinutes(a.hora_inicio) - toMinutes(b.hora_inicio));
    const grupos: Horario[][] = [];

    for (const clase of clases) {
      const inicio = toMinutes(clase.hora_inicio);
      const fin = toMinutes(clase.hora_fin);
      
      let agregadoAlGrupo = false;
      for (const grupo of grupos) {
        const chocaConGrupo = grupo.some(c => {
          return Math.max(inicio, toMinutes(c.hora_inicio)) < Math.min(fin, toMinutes(c.hora_fin));
        });
        if (chocaConGrupo) {
          grupo.push(clase);
          agregadoAlGrupo = true;
          break;
        }
      }
      if (!agregadoAlGrupo) {
        grupos.push([clase]);
      }
    }

    for (const grupo of grupos) {
      grupo.forEach((clase, index) => {
        superposiciones[clase.id_horario] = {
          widthMultiplier: 1 / grupo.length,
          offsetIndex: index
        };
      });
    }
  }

  const abrirModalInfo = (horario: Horario, materia: Materia) => {
    setHorarioSeleccionado(horario);
    setMateriaSeleccionada(materia);
    setModalInfoAbierto(true);
  };

  const cerrarModalInfo = () => {
    setModalInfoAbierto(false);
    setHorarioSeleccionado(null);
    setMateriaSeleccionada(null);
  };

  const abrirModalEditar = (horario: Horario) => {
    setHorarioEditando(horario);
    setDiaSemana(horario.dia_semana);
    setHoraInicio(horario.hora_inicio.substring(0, 5));
    setHoraFin(horario.hora_fin.substring(0, 5));
    setModalEditarAbierto(true);
  };

  const guardarHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!horarioEditando) return;

    const nuevoInicio = toMinutes(horaInicio);
    const nuevoFin = toMinutes(horaFin);
    const choca = horariosDelPeriodo.some(h => {
      if (h.id_horario === horarioEditando.id_horario) return false; 
      if (h.dia_semana !== diaSemana) return false;
      return Math.max(nuevoInicio, toMinutes(h.hora_inicio)) < Math.min(nuevoFin, toMinutes(h.hora_fin));
    });

    if (choca) {
      const confirmar = window.confirm('Aviso: Este horario choca con otra clase registrada el mismo día. ¿Deseas guardarlo de todos modos?');
      if (!confirmar) return;
    }

    try {
      const datosHorario = {
        id_materia: horarioEditando.id_materia,
        dia_semana: diaSemana,
        hora_inicio: horaInicio,
        hora_fin: horaFin
      };

      await api.put(`/horarios/${horarioEditando.id_horario}`, datosHorario);
      setModalEditarAbierto(false);
      cargarDatos();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || 'Error al guardar el horario'}`);
    }
  };

  const borrarHorario = async (id: number) => {
    if (!window.confirm('¿Deseas eliminar este horario?')) return;
    try {
      await api.delete(`/horarios/${id}`);
      setModalEditarAbierto(false);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar el horario.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 shrink-0">
        <h2 className="text-3xl font-medium text-texto-fuerte">Horario de clases</h2>
        
        <div className="flex items-center gap-3 bg-fondo-lateral p-2 rounded-2xl shadow-sm">
          <label htmlFor="selectorPeriodo" className="text-sm font-semibold text-texto-suave pl-3 whitespace-nowrap">
            Viendo periodo:
          </label>
          <select
            id="selectorPeriodo"
            title="Seleccionar periodo a visualizar"
            value={idPeriodoSeleccionado}
            onChange={(e) => setIdPeriodoSeleccionado(Number(e.target.value))}
            className="bg-white px-4 py-2 rounded-xl text-texto-fuerte font-bold shadow-sm outline-none cursor-pointer"
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
        <div className="bg-white p-12 rounded-4xl text-center shadow-md mt-10">
          <p className="text-texto-suave text-lg">Primero debes crear un periodo y materias para ver el horario.</p>
        </div>
      ) : (
        <div className="bg-white rounded-4xl shadow-md overflow-hidden shrink-0">
          <div className="overflow-x-auto custom-scrollbar">
            <div style={{ minWidth: diasAMostrar.length > 3 ? '800px' : '100%' }}>
              
              <div className="flex bg-fondo-lateral/90 backdrop-blur-md shadow-sm">
                <div className="w-30 shrink-0 p-4 flex items-center justify-center">
                  <h3 className="font-bold text-texto-fuerte">Hora</h3>
                </div>
                <div 
                  className="flex-1 grid"
                  style={{ gridTemplateColumns: `repeat(${diasAMostrar.length}, minmax(100px, 1fr))` }}
                >
                  {diasAMostrar.map((dia) => (
                    <div key={dia.valor} className="p-4 flex items-center justify-center">
                      <h3 className="font-bold text-texto-fuerte">{dia.etiqueta}</h3>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex bg-fondo-principal/20" style={{ height: `${alturaTotalCalendario}px` }}>
                
                <div className="w-30 shrink-0 bg-white border-r border-black/5 z-20 flex flex-col">
                  {horasDelDia.map((hora) => (
                    <div 
                      key={hora} 
                      className="flex flex-col items-center justify-center border-b border-black/5 last:border-b-0 w-full"
                      style={{ height: `${pixelesPorHora}px` }}
                    >
                      <div className="text-[11px] sm:text-xs font-bold text-texto-suave flex flex-col items-center gap-0.5">
                        <span>{formatHora(hora)}</span>
                        <span>-</span>
                        <span>{formatHora(hora + 1)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex-1 relative">
                  <div 
                    className="absolute inset-0 grid pointer-events-none"
                    style={{ gridTemplateColumns: `repeat(${diasAMostrar.length}, minmax(100px, 1fr))` }}
                  >
                    {diasAMostrar.map((_, idx) => (
                      <div key={idx} className="border-r border-black/5 last:border-r-0"></div>
                    ))}
                  </div>

                  <div className="absolute inset-0 pointer-events-none">
                    {horasDelDia.map((hora) => (
                      <div key={hora} className="border-b border-black/5 last:border-b-0 w-full" style={{ height: `${pixelesPorHora}px` }}></div>
                    ))}
                  </div>

                  {horariosDelPeriodo.map((horario) => {
                    const materia = materias.find(m => m.id_materia === horario.id_materia);
                    if (!materia) return null;

                    const { top, height } = calcularPosicionYAltura(horario.hora_inicio, horario.hora_fin);
                    const diaIndex = diasAMostrar.findIndex(d => d.valor === horario.dia_semana);
                    if (diaIndex === -1) return null;

                    const infoSuperposicion = superposiciones[horario.id_horario] || { widthMultiplier: 1, offsetIndex: 0 };
                    
                    const leftPos = `calc((100% / ${diasAMostrar.length}) * ${diaIndex} + ((100% / ${diasAMostrar.length}) * ${infoSuperposicion.widthMultiplier} * ${infoSuperposicion.offsetIndex}))`;
                    const widthPos = `calc((100% / ${diasAMostrar.length}) * ${infoSuperposicion.widthMultiplier})`;

                    return (
                      <button
                        key={horario.id_horario}
                        onClick={() => abrirModalInfo(horario, materia)}
                        title={`Ver detalles de ${materia.nombre}`}
                        aria-label={`Ver detalles de ${materia.nombre}`}
                        className="absolute shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden flex items-center justify-center p-3 z-30"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left: leftPos, 
                          width: widthPos, 
                          backgroundColor: materia.color || '#a0add3',
                        }}
                      >
                        <span className="text-texto-fuerte text-xs sm:text-sm leading-tight text-center wrap-break-word">
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

      {/* ================= TARJETA DE INFORMACIÓN DE MATERIA ================= */}
      {modalInfoAbierto && horarioSeleccionado && materiaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-4xl p-8 shadow-lg relative border border-black/5">
            <button 
              onClick={cerrarModalInfo} 
              title="Cerrar ventana" 
              aria-label="Cerrar ventana"
              className="absolute top-6 right-6 text-texto-suave hover:bg-black/5 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="mb-6 mt-2">
              <span className="inline-block px-3 py-1 bg-fondo-lateral text-xs font-bold text-texto-fuerte uppercase tracking-wider rounded-lg mb-4 shadow-sm">
                {periodos.find(p => p.id_periodo === materiaSeleccionada.id_periodo)?.nombre}
              </span>
              <h3 className="text-2xl font-bold text-texto-fuerte mb-2 leading-tight">
                {materiaSeleccionada.nombre}
              </h3>
              <p className="text-texto-suave font-medium text-sm">
                Profesor: {materiaSeleccionada.profesor || 'No asignado'}
              </p>
            </div>

            <div className="bg-fondo-principal p-4 rounded-2xl mb-6 border border-black/5">
              <p className="text-xs font-bold text-texto-suave uppercase tracking-wider mb-2">Horario seleccionado</p>
              <p className="text-texto-fuerte font-medium capitalize flex flex-col gap-1">
                <span>{diasDeLaSemana.find(d => d.valor === horarioSeleccionado.dia_semana)?.etiqueta}</span>
                <span className="text-sm opacity-80 normal-case">{horarioSeleccionado.hora_inicio.substring(0, 5)} - {horarioSeleccionado.hora_fin.substring(0, 5)}</span>
              </p>
            </div>

            <button 
              onClick={() => { cerrarModalInfo(); abrirModalEditar(horarioSeleccionado); }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-boton-activo text-texto-fuerte rounded-xl font-medium shadow-sm transition-colors"
            >
              <Edit2 size={16} />
              Editar este horario
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL DE EDICIÓN DE HORARIO ================= */}
      {modalEditarAbierto && horarioEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-4xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative border border-black/5">
            <button 
              onClick={() => setModalEditarAbierto(false)} 
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
                  <button type="submit" className="flex-1 bg-texto-fuerte text-white py-4 rounded-2xl font-medium shadow-md transition-transform flex items-center justify-center gap-2">
                    <Edit2 size={16} /> Guardar
                  </button>
                  <button type="button" onClick={() => setModalEditarAbierto(false)} className="px-6 py-4 rounded-2xl font-medium text-texto-suave hover:bg-black/5 transition-colors">
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