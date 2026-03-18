import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckSquare, Plus, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, Circle, CheckCircle2, Edit2 } from 'lucide-react';
import api from '../services/api';

interface Periodo { id_periodo: number; nombre: string; }
interface Materia { id_materia: number; nombre: string; profesor: string; color: string; id_periodo: number; }
interface Tarea { id_tarea: number; titulo: string; descripcion: string; fecha_entrega: string; completada: boolean; id_materia: number; }
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

function Inicio() {
  const [nombreUsuario] = useState<string>(() => localStorage.getItem('nombreUsuario') || 'estudiante');
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [idPeriodoSeleccionado, setIdPeriodoSeleccionado] = useState<number | ''>('');
  
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null);
  const [fechaSeleccionadaDia, setFechaSeleccionadaDia] = useState<Date | null>(null);

  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [idTareaEdicion, setIdTareaEdicion] = useState<number | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [idMateria, setIdMateria] = useState<number | ''>('');

  const [fechaCalendario, setFechaCalendario] = useState(new Date());

  const cargarDatos = async () => {
    try {
      const [resP, resM, resT, resH] = await Promise.all([
        api.get('/periodos/'), api.get('/materias/'), api.get('/tareas/'), api.get('/horarios/')
      ]);
      setPeriodos(resP.data); setMaterias(resM.data); setTareas(resT.data); setHorarios(resH.data);
      if (resP.data.length > 0 && idPeriodoSeleccionado === '') setIdPeriodoSeleccionado(resP.data[0].id_periodo);
    } catch (error) { console.error("Error cargando datos:", error); }
  };

  useEffect(() => { cargarDatos(); }, [idPeriodoSeleccionado]);

  const materiasDelPeriodo = materias.filter(m => m.id_periodo === idPeriodoSeleccionado);
  const idsMaterias = materiasDelPeriodo.map(m => m.id_materia);
  const tareasDelPeriodo = tareas.filter(t => idsMaterias.includes(t.id_materia));
  const horariosDelPeriodo = horarios.filter(h => idsMaterias.includes(h.id_materia));

  const tareasOrdenadas = [...tareasDelPeriodo].sort((a, b) => {
    if (a.completada && !b.completada) return 1;
    if (!a.completada && b.completada) return -1;
    return new Date(a.fecha_entrega).getTime() - new Date(b.fecha_entrega).getTime();
  });

  const toggleCompletada = async (tarea: Tarea, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.patch(`/tareas/${tarea.id_tarea}/completar`);
      cargarDatos();
      if (tareaSeleccionada) setTareaSeleccionada(null);
    } catch (error) { console.error(error); }
  };

  const abrirModalEditar = (tarea: Tarea) => {
    setTitulo(tarea.titulo); setDescripcion(tarea.descripcion); setFechaEntrega(tarea.fecha_entrega.split('T')[0]); setIdMateria(tarea.id_materia); setIdTareaEdicion(tarea.id_tarea); setTareaSeleccionada(null); setModalEditarAbierto(true);
  };

  const guardarEdicionTarea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/tareas/${idTareaEdicion}`, { titulo, descripcion, fecha_entrega: fechaEntrega, id_materia: Number(idMateria) });
      setModalEditarAbierto(false); cargarDatos();
    } catch (error) { alert('Error al guardar la tarea. Revisa los datos.'); }
  };

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

  const pixelesPorHora = 50;
  const diasDeLaSemana = [{ valor: 'Lun', etiqueta: 'Lunes' }, { valor: 'Mar', etiqueta: 'Martes' }, { valor: 'Mie', etiqueta: 'Miércoles' }, { valor: 'Jue', etiqueta: 'Jueves' }, { valor: 'Vie', etiqueta: 'Viernes' }, { valor: 'Sab', etiqueta: 'Sábado' }];

  let diasAMostrar: typeof diasDeLaSemana = [];
  let horaInicioCalendario = 7;
  let horaFinCalendario = 15;

  if (horariosDelPeriodo.length > 0) {
    const diasConClase = new Set(horariosDelPeriodo.map(h => h.dia_semana));
    const tieneLunesAViernes = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'].some(d => diasConClase.has(d));
    const tieneSabado = diasConClase.has('Sab');

    if (tieneSabado && !tieneLunesAViernes) diasAMostrar = [diasDeLaSemana.find(d => d.valor === 'Sab')!];
    else if (tieneLunesAViernes && tieneSabado) diasAMostrar = diasDeLaSemana;
    else diasAMostrar = diasDeLaSemana.filter(d => ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'].includes(d.valor));

    const horasInicio = horariosDelPeriodo.map(h => parseInt(h.hora_inicio.split(':')[0], 10));
    const horasFin = horariosDelPeriodo.map(h => {
      const partes = h.hora_fin.split(':');
      return parseInt(partes[0], 10) + (parseInt(partes[1], 10) > 0 ? 1 : 0);
    });

    horaInicioCalendario = Math.min(...horasInicio);
    horaFinCalendario = Math.max(...horasFin);
    if (horaFinCalendario === horaInicioCalendario) horaFinCalendario += 1;
  } else {
    diasAMostrar = diasDeLaSemana.filter(d => ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'].includes(d.valor));
  }

  const horasDelDia = Array.from({ length: horaFinCalendario - horaInicioCalendario }, (_, i) => i + horaInicioCalendario);
  const alturaTotalCalendario = horasDelDia.length * pixelesPorHora;
  const esSoloSabado = diasAMostrar.length === 1 && diasAMostrar[0].valor === 'Sab';

  const formatHoraRango = (h: number) => {
    const ampm1 = h >= 12 ? 'pm' : 'am';
    const hora12_1 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const h2 = h + 1;
    const ampm2 = h2 >= 12 && h2 < 24 ? 'pm' : 'am';
    const hora12_2 = h2 > 12 ? h2 - 12 : h2 === 0 ? 12 : h2;
    return `${hora12_1}:00 ${ampm1} - ${hora12_2}:00 ${ampm2}`;
  };

  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const calcularPosicionYAltura = (horaInicioStr: string, horaFinStr: string) => {
    return { 
      top: ((toMinutes(horaInicioStr) - (horaInicioCalendario * 60)) / 60) * pixelesPorHora, 
      height: ((toMinutes(horaFinStr) - toMinutes(horaInicioStr)) / 60) * pixelesPorHora 
    };
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
        if (grupo.some(c => Math.max(inicio, toMinutes(c.hora_inicio)) < Math.min(fin, toMinutes(c.hora_fin)))) {
          grupo.push(clase); agregadoAlGrupo = true; break;
        }
      }
      if (!agregadoAlGrupo) grupos.push([clase]);
    }
    for (const grupo of grupos) {
      grupo.forEach((clase, index) => {
        superposiciones[clase.id_horario] = { widthMultiplier: 1 / grupo.length, offsetIndex: index };
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-semibold text-texto-fuerte mb-2">¡Hola, {nombreUsuario}!</h2>
          <p className="text-texto-suave text-lg">Resumen de tu periodo escolar</p>
        </div>
        
        <div className="bg-fondo-tarjeta p-3 rounded-xl shadow-sm flex items-center gap-3 border border-transparent">
          <label htmlFor="selector-periodo" className="text-sm text-texto-suave">Periodo actual:</label>
          <select 
            id="selector-periodo" 
            title="Seleccionar periodo"
            value={idPeriodoSeleccionado} 
            onChange={(e) => setIdPeriodoSeleccionado(Number(e.target.value))}
            className="bg-fondo-principal px-3 py-1.5 rounded-lg text-texto-fuerte outline-none cursor-pointer border border-transparent"
          >
            {periodos.map(p => <option key={p.id_periodo} value={p.id_periodo}>{p.nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 bg-fondo-tarjeta rounded-2xl shadow-sm p-5 flex flex-col h-125 border border-transparent">
          <div className="flex justify-between items-center mb-4">
            <Link to="/dashboard/tareas" className="text-xl font-medium text-texto-fuerte hover:underline flex items-center gap-2">
              <CheckSquare size={20} /> Lista de tareas
            </Link>
            <Link to="/dashboard/tareas" className="p-1.5 bg-fondo-lateral text-texto-fuerte rounded-md hover:opacity-80 transition-opacity" title="Agregar tarea" aria-label="Agregar tarea">
              <Plus size={18} />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {tareasOrdenadas.length === 0 ? (
              <p className="text-texto-suave opacity-60 text-sm text-center mt-10">No hay tareas pendientes</p>
            ) : (
              tareasOrdenadas.map(tarea => {
                const materia = materias.find(m => m.id_materia === tarea.id_materia);
                const fecha = new Date(tarea.fecha_entrega);
                const estaVencida = fecha < new Date(new Date().setHours(0,0,0,0)) && !tarea.completada;

                return (
                  <div 
                    key={tarea.id_tarea} 
                    onClick={() => setTareaSeleccionada(tarea)}
                    className={`p-3 rounded-lg bg-fondo-principal shadow-sm cursor-pointer hover:brightness-95 transition-all flex items-start gap-3 border border-transparent ${tarea.completada ? 'opacity-50' : ''}`}
                  >
                    <button 
                      onClick={(e) => toggleCompletada(tarea, e)} 
                      className="mt-0.5 shrink-0 text-texto-suave hover:text-green-500 transition-colors"
                      title={tarea.completada ? "Desmarcar completada" : "Marcar como completada"}
                      aria-label={tarea.completada ? "Desmarcar completada" : "Marcar como completada"}
                    >
                      {tarea.completada ? <CheckCircle2 className="text-green-500" size={20} /> : <Circle size={20} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${tarea.completada ? 'line-through text-texto-suave' : 'text-texto-fuerte'}`}>{tarea.titulo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: materia?.color || '#ccc' }} />
                        <p className="text-xs text-texto-suave truncate font-normal">{materia?.nombre}</p>
                      </div>
                      {!tarea.completada && (
                        <p className={`text-xs mt-1 ${estaVencida ? 'text-red-500' : 'text-texto-suave'}`}>
                          Entrega: {fecha.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-fondo-tarjeta rounded-2xl shadow-sm p-5 border border-transparent">
            <Link to="/dashboard/horarios" className="text-xl font-medium text-texto-fuerte hover:underline flex items-center gap-2 mb-4">
              <Clock size={20} /> Horario
            </Link>
            
            <div className={`rounded-xl overflow-hidden border border-black/5 ${esSoloSabado ? '' : 'overflow-x-auto custom-scrollbar'}`}>
              <div style={{ minWidth: esSoloSabado ? '100%' : (diasAMostrar.length > 3 ? '600px' : '100%') }}>
                <div className="flex bg-fondo-lateral/90 border-b border-black/5">
                  <div className="w-27.5 shrink-0 p-2 flex items-center justify-center border-r border-black/5">
                    <h3 className="text-xs font-semibold text-texto-fuerte not-italic">Hora</h3>
                  </div>
                  <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${diasAMostrar.length}, minmax(80px, 1fr))` }}>
                    {diasAMostrar.map((dia) => (
                      <div key={dia.valor} className="p-2 flex items-center justify-center">
                        <h3 className="text-xs font-semibold text-texto-fuerte">{dia.etiqueta}</h3>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex bg-fondo-tarjeta relative" style={{ height: `${alturaTotalCalendario}px` }}>
                  <div className="w-27.5 shrink-0 border-r border-black/5 z-20 flex flex-col">
                    {horasDelDia.map((hora) => (
                      <div key={hora} className="flex flex-col items-center justify-center border-b border-black/5 last:border-b-0 w-full" style={{ height: `${pixelesPorHora}px` }}>
                        <span className="text-[10px] sm:text-xs font-normal text-texto-suave not-italic text-center">{formatHoraRango(hora)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 relative">
                    <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${diasAMostrar.length}, minmax(80px, 1fr))` }}>
                      {diasAMostrar.map((_, idx) => <div key={idx} className="border-r border-black/5 last:border-r-0"></div>)}
                    </div>
                    <div className="absolute inset-0 pointer-events-none">
                      {horasDelDia.map((hora) => <div key={hora} className="border-b border-black/5 last:border-b-0 w-full" style={{ height: `${pixelesPorHora}px` }}></div>)}
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
                      const colorTexto = obtenerColorTexto(materia.color || '#a0add3');

                      return (
                        <div
                          key={horario.id_horario}
                          className="absolute flex items-center justify-center p-1 z-30 overflow-hidden rounded-none text-gray-900"
                          style={{ top: `${top}px`, height: `${height}px`, left: leftPos, width: widthPos, backgroundColor: materia.color || '#a0add3', color: colorTexto }}
                        >
                          <span className="text-[10px] leading-tight text-center wrap-break-word font-medium">{materia.nombre}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-fondo-tarjeta rounded-2xl shadow-sm p-5 border border-transparent">
            <Link to="/dashboard/calendario" className="text-xl font-medium text-texto-fuerte hover:underline flex items-center gap-2 mb-4">
              <CalendarIcon size={20} /> Calendario
            </Link>
            
            <div className="bg-fondo-principal rounded-xl p-4 border border-transparent">
              <div className="flex justify-between items-center mb-4">
                <button onClick={irAMesAnterior} className="p-1.5 hover:bg-fondo-lateral/20 rounded-lg text-texto-suave transition-colors" title="Mes anterior" aria-label="Mes anterior">
                  <ChevronLeft size={20} />
                </button>
                <h4 className="font-medium text-texto-fuerte">{nombresMeses[mesCalendario]} {anioCalendario}</h4>
                <button onClick={irAMesSiguiente} className="p-1.5 hover:bg-fondo-lateral/20 rounded-lg text-texto-suave transition-colors" title="Mes siguiente" aria-label="Mes siguiente">
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {diasSemanaCorto.map(dia => <div key={dia} className="text-xs font-semibold text-texto-suave">{dia}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: primerDiaMes }).map((_, i) => <div key={`vacio-${i}`} className="aspect-square"></div>)}
                
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
                      className="aspect-square flex flex-col items-center py-2 bg-fondo-tarjeta shadow-sm rounded-lg cursor-pointer hover:brightness-95 transition-colors"
                    >
                      <span className="text-xs text-texto-fuerte">{dia}</span>
                      <div className="flex flex-wrap gap-1 justify-center px-1 mt-1">
                        {tareasDelDia.map(tarea => {
                          const materia = materias.find(m => m.id_materia === tarea.id_materia);
                          return (
                            <div 
                              key={tarea.id_tarea} 
                              className={`w-2 h-2 rounded-full ${tarea.completada ? 'opacity-40' : ''}`} 
                              style={{ backgroundColor: materia?.color || '#a0add3' }}
                              title={tarea.titulo}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE TAREAS POR DÍA */}
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

      {/* MODAL DETALLES DE TAREA */}
      {tareaSeleccionada && (() => {
        const materiaTarea = materias.find(m => m.id_materia === tareaSeleccionada.id_materia);
        const estaVencida = new Date(tareaSeleccionada.fecha_entrega) < new Date(new Date().setHours(0,0,0,0)) && !tareaSeleccionada.completada;
        const colorTexto = obtenerColorTexto(materiaTarea?.color || '#f3f4f6');

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-fondo-tarjeta rounded-xl w-full max-w-md relative overflow-hidden shadow-xl border border-transparent">
              
              <div className="p-5 pr-20 relative" style={{ backgroundColor: materiaTarea?.color || '#f3f4f6', color: colorTexto }}>
                <div className="absolute top-5 right-4 flex items-center gap-3">
                  <button 
                    onClick={() => abrirModalEditar(tareaSeleccionada)} 
                    className="opacity-60 hover:opacity-100 transition-opacity" 
                    style={{ color: colorTexto }}
                    title="Editar tarea"
                    aria-label="Editar tarea"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => setTareaSeleccionada(null)} 
                    className="opacity-60 hover:opacity-100 transition-opacity" 
                    style={{ color: colorTexto }}
                    title="Cerrar ventana"
                    aria-label="Cerrar ventana"
                  >
                    <X size={20} />
                  </button>
                </div>
                <h3 className="text-xl font-normal leading-tight" style={{ color: colorTexto }}>{tareaSeleccionada.titulo}</h3>
                <p className="text-sm font-normal mt-1 opacity-90" style={{ color: colorTexto }}>{materiaTarea?.nombre}</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-texto-fuerte">Descripción</p>
                    <p className="text-sm text-texto-suave mt-1">{tareaSeleccionada.descripcion}</p>
                  </div>
                  <p className="text-sm text-texto-suave"><span className="font-medium text-texto-fuerte">Fecha de entrega:</span> {formatearFechaLarga(new Date(tareaSeleccionada.fecha_entrega))}</p>
                  <p className="text-sm text-texto-suave"><span className="font-medium text-texto-fuerte">Estado:</span> {tareaSeleccionada.completada ? ' Completada' : estaVencida ? <span className="text-red-500 font-medium"> Vencida</span> : ' Pendiente'}</p>
                </div>
                <div className="mt-6 flex justify-end border-t border-black/5 pt-4">
                  <button onClick={(e) => { toggleCompletada(tareaSeleccionada, e); }} className="px-6 py-2 bg-texto-fuerte text-fondo-principal hover:opacity-90 rounded-lg transition-all text-sm font-medium shadow-sm">
                    {tareaSeleccionada.completada ? 'Completada' : 'Completar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL EDICIÓN DE TAREA */}
      {modalEditarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-fondo-tarjeta w-full max-w-md rounded-2xl p-6 shadow-xl relative border border-transparent">
            <button 
              onClick={() => setModalEditarAbierto(false)} 
              className="absolute top-4 right-4 text-texto-suave hover:text-texto-fuerte transition-colors"
              title="Cerrar ventana"
              aria-label="Cerrar ventana"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-normal text-texto-fuerte mb-6">Editar tarea</h3>
            
            <form onSubmit={guardarEdicionTarea} className="space-y-4">
              <div>
                <label htmlFor="tituloTareaEdit" className="block text-sm text-texto-suave mb-1">Nombre de la tarea</label>
                <input id="tituloTareaEdit" required type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Escribe el nombre de la tarea" className="w-full bg-fondo-principal text-texto-fuerte p-3 rounded-lg focus:ring-2 focus:ring-boton-hover outline-none border border-transparent" />
              </div>
              <div>
                <label htmlFor="materiaTareaEdit" className="block text-sm text-texto-suave mb-1">Materia</label>
                <select id="materiaTareaEdit" required title="Seleccionar materia" value={idMateria} onChange={(e) => setIdMateria(Number(e.target.value))} className="w-full bg-fondo-principal text-texto-fuerte p-3 rounded-lg focus:ring-2 focus:ring-boton-hover outline-none cursor-pointer border border-transparent">
                  <option value="" disabled>-- Selecciona una materia --</option>
                  {materiasDelPeriodo.map(m => <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="fechaTareaEdit" className="block text-sm text-texto-suave mb-1">Fecha de entrega</label>
                <input id="fechaTareaEdit" required type="date" title="Seleccionar fecha de entrega" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} className="w-full bg-fondo-principal text-texto-fuerte p-3 rounded-lg focus:ring-2 focus:ring-boton-hover outline-none border border-transparent" />
              </div>
              <div>
                <label htmlFor="descTareaEdit" className="block text-sm text-texto-suave mb-1">Descripción</label>
                <textarea id="descTareaEdit" required rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Escribe la descripción de la tarea..." className="w-full bg-fondo-principal text-texto-fuerte p-3 rounded-lg focus:ring-2 focus:ring-boton-hover outline-none resize-none border border-transparent" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalEditarAbierto(false)} className="flex-1 py-3 bg-fondo-principal text-texto-suave rounded-lg hover:brightness-95 transition-colors shadow-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-texto-fuerte text-fondo-principal rounded-lg hover:opacity-90 transition-opacity shadow-sm">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Inicio;