import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { estudiantesService } from '../../services/estudiantes';
import { configuracionService } from '../../services/configuracion';
import { institucionalService } from '../../services/institucionalService';
import { docentesService } from '../../services/docentes';
import { API_URL } from '../../services/auth';
import { DashboardLayout } from '../layout/DashboardLayout';
import { EstudianteModal } from './EstudianteModal';
import { createFormatHandler } from '../../utils/inputFormat';
import {
  UserPlus, Search, Edit2, Trash2, X, Save,
  Users, Filter, ChevronDown, User, Phone, Mail,
  Calendar, Hash, BookOpen, AlertCircle
} from 'lucide-react';
import './Estudiantes.css';

interface Estudiante {
  id: number;
  rne: string;
  cedula?: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  sexo: 'M' | 'F';
  fecha_nacimiento: string;
  correo?: string;
  telefono?: string;
  es_activo?: boolean;
  centro_id?: number;
  secciones?: any[];
  representantes?: any[];
}

const nombreCompleto = (e: Estudiante) =>
  [e.primer_nombre, e.segundo_nombre, e.primer_apellido, e.segundo_apellido]
    .filter(Boolean).join(' ');

const calcularEdad = (fechaNac: string) => {
  const hoy = new Date();
  const nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

const getGlobalAvatarColor = (est: Estudiante, seccionAct?: any, filtroAsigId?: string) => {
  if (est.es_activo === false) return 'linear-gradient(135deg, #ef4444, #dc2626)'; // Rojo (Inactivo global)
  
  if (seccionAct) {
    let situacion = seccionAct.situacion_final;
    
    // Si hay un filtro de asignatura, buscamos su situación específica
    if (filtroAsigId && seccionAct.situaciones_asignaturas) {
      const situacionAsig = seccionAct.situaciones_asignaturas[filtroAsigId];
      if (situacionAsig) situacion = situacionAsig;
    }

    switch (situacion) {
      case 'APROBADO': return 'linear-gradient(135deg, #10b981, #059669)'; // Verde
      case 'REPROBADO': return 'linear-gradient(135deg, #ef4444, #dc2626)'; // Rojo
      case 'EVALUACION': return 'linear-gradient(135deg, #3b82f6, #2563eb)'; // Azul
      case 'RECUPERACION': return 'linear-gradient(135deg, #f59e0b, #d97706)'; // Amarillo
    }
  }

  return 'linear-gradient(135deg, #94a3b8, #64748b)'; // Gris (Sin estado específico)
};

// ─── Modal de Detalle / Edición ───────────────────────────────────────────────
const EstudianteDetalleModal: React.FC<{
  estudiante: Estudiante;
  secciones: any[];
  centros: any[];
  onClose: () => void;
  onSave: () => void;
}> = ({ estudiante, secciones, centros, onClose, onSave }) => {
  const { token, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...estudiante, centro_id: (estudiante as any).centro_id });

  const setField = (field: string) => (val: string) =>
    setFormData(prev => ({ ...prev, [field]: val }));

  const handleSave = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await estudiantesService.actualizarEstudiante(token, estudiante.id, {
        rne: formData.rne,
        primer_nombre: formData.primer_nombre,
        segundo_nombre: formData.segundo_nombre || undefined,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido || undefined,
        cedula: formData.cedula || undefined,
        correo: formData.correo || undefined,
        telefono: formData.telefono || undefined,
        fecha_nacimiento: formData.fecha_nacimiento,
        sexo: formData.sexo,
        centro_id: formData.centro_id || undefined,
      });
      setEditing(false);
      onSave();
    } catch (err: any) {
      if (Array.isArray(err.message)) {
        setError(err.message.map((e: any) => e.msg || JSON.stringify(e)).join(', '));
      } else if (err.message && typeof err.message === 'object') {
        setError(JSON.stringify(err.message));
      } else {
        setError(err.message || String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const seccionActual = secciones.find(s =>
    estudiante.secciones?.some((es: any) => es.seccion_id === s.id)
  );

  const rep = estudiante.representantes && estudiante.representantes.length > 0 ? estudiante.representantes[0] : null;

  return (
    <div className="modal-overlay-premium fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-detalle slide-up">
        {/* Header */}
        <header className="detalle-header">
          <div className="detalle-avatar">
            <span>{estudiante.primer_nombre[0]}{estudiante.primer_apellido[0]}</span>
          </div>
          <div className="detalle-titulo">
            <h2>{nombreCompleto(estudiante)}</h2>
            <div className="detalle-badges">
              <span className="badge-rne">{estudiante.rne}</span>
              <span className={`badge-sexo ${estudiante.sexo === 'M' ? 'masculino' : 'femenino'}`}>
                {estudiante.sexo === 'M' ? 'M' : 'F'}
              </span>
              {seccionActual && (
                <span className="badge-seccion">
                  <BookOpen size={12} /> {seccionActual.grado?.nombre} — Sec. {seccionActual.nombre}
                </span>
              )}
            </div>
          </div>
          <div className="detalle-actions-header">
            {(user?.es_superusuario || user?.roles?.includes('ADMINISTRADOR')) && !editing && (
              <button className="btn-edit-header" onClick={() => setEditing(true)}>
                <Edit2 size={16} /> Editar
              </button>
            )}
            <button className="btn-icon-close" onClick={onClose}><X size={20} /></button>
          </div>
        </header>

        {error && (
          <div className="error-banner" style={{ margin: '0 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Body */}
        <div className="detalle-body">
          {/* Datos Personales */}
          <section className="detalle-section">
            <h3><User size={16} /> Datos Personales</h3>
            <div className="detalle-grid">
              <div className="detalle-campo">
                <label>Primer Nombre</label>
                {editing
                  ? <input className="input-premium" value={formData.primer_nombre} onChange={createFormatHandler('nombre', setField('primer_nombre'))} />
                  : <span>{estudiante.primer_nombre}</span>}
              </div>
              <div className="detalle-campo">
                <label>Segundo Nombre</label>
                {editing
                  ? <input className="input-premium" value={formData.segundo_nombre || ''} onChange={createFormatHandler('nombre', setField('segundo_nombre'))} />
                  : <span>{estudiante.segundo_nombre || '—'}</span>}
              </div>
              <div className="detalle-campo">
                <label>Primer Apellido</label>
                {editing
                  ? <input className="input-premium" value={formData.primer_apellido} onChange={createFormatHandler('nombre', setField('primer_apellido'))} />
                  : <span>{estudiante.primer_apellido}</span>}
              </div>
              <div className="detalle-campo">
                <label>Segundo Apellido</label>
                {editing
                  ? <input className="input-premium" value={formData.segundo_apellido || ''} onChange={createFormatHandler('nombre', setField('segundo_apellido'))} />
                  : <span>{estudiante.segundo_apellido || '—'}</span>}
              </div>
              <div className="detalle-campo">
                <label><Hash size={12} /> Cédula</label>
                {editing
                  ? <input className="input-premium" value={formData.cedula || ''} onChange={createFormatHandler('cedula', setField('cedula'))} placeholder="0010000000" />
                  : <span>{estudiante.cedula || '—'}</span>}
              </div>
              <div className="detalle-campo">
                <label><Calendar size={12} /> Fecha de Nacimiento</label>
                {editing
                  ? <input type="date" className="input-premium" value={formData.fecha_nacimiento} onChange={e => setFormData(p => ({ ...p, fecha_nacimiento: e.target.value }))} />
                  : <span>{new Date(estudiante.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' })} ({calcularEdad(estudiante.fecha_nacimiento)} años)</span>}
              </div>
              <div className="detalle-campo">
                <label>Sexo</label>
                {editing
                  ? <select className="input-premium" value={formData.sexo} onChange={e => setFormData(p => ({ ...p, sexo: e.target.value as 'M' | 'F' }))}>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  : <span>{estudiante.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>}
              </div>
              {user?.es_superusuario && (
                <div className="detalle-campo">
                  <label>Centro Educativo</label>
                  {editing
                    ? <select className="input-premium" value={formData.centro_id || ''} onChange={e => setFormData(p => ({ ...p, centro_id: e.target.value ? Number(e.target.value) : undefined }))}>
                        <option value="">-- Seleccionar --</option>
                        {centros.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    : <span>{centros.find(c => c.id === (estudiante as any).centro_id)?.nombre || 'Sin centro asignado'}</span>}
                </div>
              )}
            </div>
          </section>

          {/* Datos de Contacto */}
          <section className="detalle-section">
            <h3><Phone size={16} /> Contacto</h3>
            <div className="detalle-grid">
              <div className="detalle-campo">
                <label><Mail size={12} /> Correo</label>
                {editing
                  ? <input type="email" className="input-premium" value={formData.correo || ''} onChange={createFormatHandler('email', setField('correo'))} />
                  : <span>{estudiante.correo || '—'}</span>}
              </div>
              <div className="detalle-campo">
                <label><Phone size={12} /> Teléfono</label>
                {editing
                  ? <input className="input-premium" value={formData.telefono || ''} onChange={createFormatHandler('telefono', setField('telefono'))} />
                  : <span>{estudiante.telefono || '—'}</span>}
              </div>
            </div>
          </section>
          {/* Datos del Padre/Madre/Tutor */}
          <section className="detalle-section">
            <h3><Users size={16} /> Datos del Padre, Madre o Tutor</h3>
            {rep ? (
              <div className="detalle-grid">
                <div className="detalle-campo">
                  <label>Nombre Completo</label>
                  <span>{rep.nombre_completo}</span>
                </div>
                <div className="detalle-campo">
                  <label>Vínculo / Tipo</label>
                  <span>{rep.tipo}</span>
                </div>
                <div className="detalle-campo">
                  <label><Phone size={12} /> Teléfono Principal</label>
                  <span>{rep.telefono_1 || '—'}</span>
                </div>
                {rep.telefono_2 && (
                  <div className="detalle-campo">
                    <label><Phone size={12} /> Teléfono Secundario</label>
                    <span>{rep.telefono_2}</span>
                  </div>
                )}
                <div className="detalle-campo">
                  <label><Mail size={12} /> Correo Electrónico</label>
                  <span>{rep.correo || '—'}</span>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No hay información de tutor registrada para este estudiante.</p>
            )}
          </section>
        </div>

        {/* Footer */}
        {editing && (
          <footer className="detalle-footer">
            <button className="btn-cancel-edit" onClick={() => { setEditing(false); setFormData({ ...estudiante, centro_id: estudiante.centro_id }); }}>
              Cancelar
            </button>
            <button className="btn-save-edit" onClick={handleSave} disabled={loading}>
              <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

// ─── Vista Principal ──────────────────────────────────────────────────────────
export const EstudiantesView = () => {
  const { token, user } = useAuth();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [secciones, setSecciones] = useState<any[]>([]);
  const [grados, setGrados] = useState<any[]>([]);
  const [centros, setCentros] = useState<any[]>([]);
  const [aniosEscolares, setAniosEscolares] = useState<any[]>([]);
  const [misAsignaturas, setMisAsignaturas] = useState<any[]>([]);
  const [misAsignaciones, setMisAsignaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSuperOrAdmin = user?.es_superusuario || user?.roles?.includes('ADMINISTRADOR');

  // UI states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Estudiante | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroSexo, setFiltroSexo] = useState('');
  const [filtroGrado, setFiltroGrado] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('');
  const [filtroCentro, setFiltroCentro] = useState('');
  const [filtroSituacion, setFiltroSituacion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState(''); // Sólo para superadmin
  const [filtroAsignatura, setFiltroAsignatura] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);

  const cargarDatos = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const peticiones: any = [
        institucionalService.getAniosEscolares(),
        configuracionService.obtenerSecciones(token),
        configuracionService.obtenerGrados(token)
      ];
      if (user?.es_superusuario) peticiones.push(institucionalService.getCentros());
      
      const resultados = await Promise.all(peticiones);
      setAniosEscolares(resultados[0]);
      setSecciones(resultados[1]);
      setGrados(resultados[2]);
      if (user?.es_superusuario) setCentros(resultados[3]);

      let dataEst: Estudiante[] = [];

      // 1. Obtener el Año Escolar Activo
      const anios = resultados[0];
      const anioActivo = anios.find((a: any) => a.estado === 'ACTIVO');
      const anioActivoId = anioActivo ? anioActivo.id : undefined;

      // Si es DOCENTE
      if (!isSuperOrAdmin && user?.roles?.includes('DOCENTE')) {
        const asignaciones = await docentesService.obtenerMisAsignaciones(token);
        
        if (anioActivoId) {
          const asignacionesActivas = asignaciones.filter(a => a.anio_escolar_id === anioActivoId);
          setMisAsignaciones(asignacionesActivas);
          
          const asigs: any[] = [];
          const seenAsigs = new Set();
          asignacionesActivas.forEach(a => {
            if (!seenAsigs.has(a.asignatura.id)) {
              seenAsigs.add(a.asignatura.id);
              asigs.push(a.asignatura);
            }
          });
          setMisAsignaturas(asigs);
          
          const misSeccionesIds = [...new Set(asignacionesActivas.map(a => a.seccion_id))];
          if (misSeccionesIds.length > 0) {
            const allEst = await estudiantesService.obtenerEstudiantes(token, String(anioActivoId));
            dataEst = allEst.filter((e: any) => e.secciones?.some((es: any) => misSeccionesIds.includes(es.seccion_id)));
          }
        }
      } else if (!isSuperOrAdmin) {
        // Directores y Coordinadores
        if (anioActivoId) {
          dataEst = await estudiantesService.obtenerEstudiantes(token, String(anioActivoId));
        }
      } else {
        // Administradores: Obtener estudiantes de todos los años
        dataEst = await estudiantesService.obtenerEstudiantes(token);
      }

      setEstudiantes(dataEst);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, [token]);

  const handleEliminar = async (est: Estudiante) => {
    if (!token) return;
    setDeletingId(est.id);
    try {
      await estudiantesService.eliminarEstudiante(token, est.id);
      setShowDeleteConfirm(null);
      await cargarDatos();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtrado con memo
  const estudiantesFiltrados = useMemo(() => {
    return estudiantes.filter(e => {
      const nombre = nombreCompleto(e).toLowerCase();
      const matchSearch = !searchTerm ||
        nombre.includes(searchTerm.toLowerCase()) ||
        e.rne.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.cedula || '').includes(searchTerm);

      const matchSexo = !filtroSexo || e.sexo === filtroSexo;

      const seccionCatalogo = secciones.find(s =>
        e.secciones?.some((es: any) => es.seccion_id === s.id)
      );
      // BUGFIX: Access grado_id directly from the catalog object
      const matchGrado = !filtroGrado || seccionCatalogo?.grado_id === parseInt(filtroGrado);
      const matchSeccion = !filtroSeccion || seccionCatalogo?.id === parseInt(filtroSeccion);
      
      let matchCentro = true;
      if (filtroCentro !== '') {
        if (filtroCentro === 'none') {
          matchCentro = (e as any).centro_id === null || (e as any).centro_id === undefined;
        } else {
          matchCentro = (e as any).centro_id === parseInt(filtroCentro);
        }
      }

      let matchSituacion = true;
      if (filtroSituacion !== '') {
        const anioActivo = aniosEscolares.find((a: any) => a.estado === 'ACTIVO');
        const seccionEstudiante = e.secciones?.find((es: any) => es.estado === 'ACTIVO') || e.secciones?.[0];
        let situacionEvaluar = seccionEstudiante?.situacion_final;
        
        if (filtroAsignatura && seccionEstudiante?.situaciones_asignaturas) {
          situacionEvaluar = seccionEstudiante.situaciones_asignaturas[filtroAsignatura] || situacionEvaluar;
        }

        if (filtroSituacion === 'RECUPERACION') {
          matchSituacion = ['RECUPERACION', 'EN_COMPLETIVA', 'EN_EXTRAORDINARIA', 'EVALUACION_ESPECIAL'].includes(situacionEvaluar);
        } else {
          matchSituacion = situacionEvaluar === filtroSituacion;
        }
      }

      let matchEstado = true;
      if (filtroEstado !== '' && user?.es_superusuario) {
        if (filtroEstado === 'ACTIVO') matchEstado = e.es_activo === true;
        if (filtroEstado === 'INACTIVO') matchEstado = e.es_activo === false;
      }

      let matchAsignatura = true;
      if (filtroAsignatura !== '') {
        const asigDocente = misAsignaciones.find(a => a.asignatura.id.toString() === filtroAsignatura);
        if (asigDocente) {
           // Si el docente filtró por asignatura, el estudiante debe pertenecer a la sección de esa asignatura
           matchAsignatura = e.secciones?.some((es: any) => es.seccion_id === asigDocente.seccion_id) ?? false;
        }
      }

      return matchSearch && matchSexo && matchGrado && matchSeccion && matchCentro && matchSituacion && matchEstado && matchAsignatura;
    });
  }, [estudiantes, secciones, searchTerm, filtroSexo, filtroGrado, filtroSeccion, filtroCentro, filtroSituacion, filtroEstado, filtroAsignatura, misAsignaciones, user?.es_superusuario]);

  const seccionesFiltradas = filtroGrado
    ? secciones.filter(s => s.grado?.id === parseInt(filtroGrado) || s.grado_id === parseInt(filtroGrado))
    : secciones;

  const hayFiltrosActivos = [filtroSexo, filtroGrado, filtroSeccion, filtroCentro, filtroSituacion, filtroEstado, filtroAsignatura].some(Boolean);

  const limpiarFiltros = () => {
    setFiltroSexo(''); setFiltroGrado(''); setFiltroSeccion(''); setFiltroCentro(''); setFiltroSituacion(''); setFiltroEstado(''); setFiltroAsignatura('');
  };

  return (
    <DashboardLayout>
      <div className="estudiantes-container">

        {/* ── Header ── */}
        <header className="module-header">
          <div>
            <h1><Users size={26} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Gestión de Estudiantes</h1>
            <p>Administra los estudiantes inscritos en el sistema educativo.</p>
          </div>
          {isSuperOrAdmin && (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <UserPlus size={18} /> Nuevo Estudiante
            </button>
          )}
        </header>

        {error && <div className="error-banner"><AlertCircle size={16} /> {error}</div>}

        {/* ── Barra de búsqueda y filtros ── */}
        <div className="toolbar-container">

          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, RNE o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm('')}><X size={14} /></button>
            )}
          </div>

          <button
            className={`btn-filtros ${showFiltros ? 'active' : ''} ${hayFiltrosActivos ? 'has-filters' : ''}`}
            onClick={() => setShowFiltros(p => !p)}
          >
            <Filter size={16} />
            Filtros
            {hayFiltrosActivos && <span className="filtro-count">{[filtroSexo, filtroGrado, filtroSeccion, filtroCentro, filtroSituacion, filtroEstado].filter(Boolean).length}</span>}
            <ChevronDown size={14} className={showFiltros ? 'rotated' : ''} />
          </button>
        </div>

        {/* Panel de filtros */}
        {showFiltros && (
          <div className="filtros-panel fade-in">
            <div className="filtros-row">
              <div className="filtro-group">
                <label>Sexo</label>
                <select value={filtroSexo} onChange={e => setFiltroSexo(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div className="filtro-group">
                <label>Grado</label>
                <select value={filtroGrado} onChange={e => { setFiltroGrado(e.target.value); setFiltroSeccion(''); }}>
                  <option value="">Todos los grados</option>
                  {grados.map((g: any) => (
                    <option key={g.id} value={g.id}>{g.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="filtro-group">
                <label>Sección</label>
                <select value={filtroSeccion} onChange={e => setFiltroSeccion(e.target.value)} disabled={!filtroGrado}>
                  <option value="">Todas las secciones</option>
                  {seccionesFiltradas.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>
              
              {/* Filtro Asignatura (Solo Docentes) */}
              {!isSuperOrAdmin && user?.roles?.includes('DOCENTE') && (
                <div className="filtro-group">
                  <label>Asignatura</label>
                  <select value={filtroAsignatura} onChange={e => setFiltroAsignatura(e.target.value)}>
                    <option value="">Todas las asignaturas</option>
                    {misAsignaturas.map((a: any) => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filtro Situación Académica */}
              {!user?.es_superusuario && (
                <div className="filtro-group">
                  <label>Situación Académica</label>
                  <select value={filtroSituacion} onChange={e => setFiltroSituacion(e.target.value)}>
                    <option value="">Todas</option>
                    <option value="APROBADO">Aprobados</option>
                    <option value="REPROBADO">Reprobados</option>
                    <option value="EVALUACION">Evaluación</option>
                    <option value="RECUPERACION">Recuperación</option>
                    <option value="PENDIENTE">Pendientes</option>
                  </select>
                </div>
              )}

              {user?.es_superusuario && (
                <div className="filtro-group">
                  <label>Estado Sistema</label>
                  <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="ACTIVO">Activos</option>
                    <option value="INACTIVO">Inactivos</option>
                  </select>
                </div>
              )}
              {user?.es_superusuario && (
                <div className="filtro-group">
                  <label>Centro Educativo</label>
                  <select value={filtroCentro} onChange={e => setFiltroCentro(e.target.value)}>
                    <option value="">Todos los centros</option>
                    {centros.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                    <option value="none">Sin centro asignado</option>
                  </select>
                </div>
              )}
              {hayFiltrosActivos && (
                <button className="btn-limpiar" onClick={limpiarFiltros}>
                  <X size={14} /> Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Contador ── */}
        <div className="tabla-info">
          <span className="contador">
            Mostrando <strong>{estudiantesFiltrados.length}</strong> de <strong>{estudiantes.length}</strong> estudiantes
          </span>
          <div className="resumen-sexo">
            <span className="chip-m">M {estudiantesFiltrados.filter(e => e.sexo === 'M').length}</span>
            <span className="chip-f">F {estudiantesFiltrados.filter(e => e.sexo === 'F').length}</span>
          </div>
        </div>

        {/* ── Tabla ── */}
        <div className="table-container fade-in">
          <table className="sigera-table">
            <thead>
              <tr>
                <th>#</th>
                <th>RNE</th>
                <th>Nombre Completo</th>
                <th>Sexo</th>
                <th>Edad</th>
                <th>Cédula</th>
                <th>Sección</th>
                <th>Contacto</th>
                <th>Acciones</th>
                {user?.es_superusuario && <th>Centro</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={user?.es_superusuario ? 10 : 9} className="text-center estado-vacio">
                  <div className="loading-dots"><span/><span/><span/></div>
                  Cargando estudiantes...
                </td></tr>
              ) : estudiantesFiltrados.length === 0 ? (
                <tr><td colSpan={user?.es_superusuario ? 10 : 9} className="text-center estado-vacio">
                  <Users size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <br />No se encontraron estudiantes.
                </td></tr>
              ) : (
                estudiantesFiltrados.map((est, idx) => {
                  if (!isSuperOrAdmin && !user?.roles?.includes('DOCENTE') && !estudiantes.length) return null;
                  
                  const seccionCatalogo = secciones.find(s =>
                    est.secciones?.some((es: any) => es.seccion_id === s.id)
                  );
                  const gradoInfo = seccionCatalogo ? grados.find(g => g.id === seccionCatalogo.grado_id) : null;
                  const centroInfo = centros.find(c => c.id === (est as any).centro_id);
                  const isActivo = est.es_activo !== false;
                  
                  const inscripcionActiva = est.secciones?.find((es: any) => es.estado === 'ACTIVO') || est.secciones?.[0];
                  const bgGradient = getGlobalAvatarColor(est, inscripcionActiva, filtroAsignatura);
                  const enRecuperacion = inscripcionActiva?.situacion_final === 'RECUPERACION';

                  return (
                    <tr key={est.id} className="fila-estudiante" onClick={() => isSuperOrAdmin ? setSelectedEstudiante(est) : null} style={{ opacity: isActivo ? 1 : 0.6, background: isActivo ? 'inherit' : '#f8717111' }}>
                      <td className="col-num">{idx + 1}</td>
                      <td><span className="badge-rne" style={{ textDecoration: isActivo ? 'none' : 'line-through' }}>{est.rne}</span></td>
                      <td className="col-nombre">
                        <div className="nombre-avatar" style={{ position: 'relative' }}>
                          <div className="mini-avatar" style={{ background: bgGradient }}>
                            {est.primer_nombre[0]}{est.primer_apellido[0]}
                          </div>
                          {enRecuperacion && (
                            <div className="status-indicator-badge recuperacion" title="En Recuperación Pedagógica" style={{ position: 'absolute', left: '-5px', top: '-5px', background: 'white', borderRadius: '50%', fontSize: '12px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 4px rgba(0,0,0,0.2)' }}>
                              ⚠️
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>
                              {nombreCompleto(est)}
                              {!isActivo && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#ef4444', border: '1px solid #ef4444', padding: '2px 6px', borderRadius: '12px' }}>Inactivo</span>}
                            </span>
                            {enRecuperacion && inscripcionActiva?.asignaturas_en_recuperacion && inscripcionActiva.asignaturas_en_recuperacion.length > 0 && (
                               <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                                 {inscripcionActiva.asignaturas_en_recuperacion.map((c: string) => (
                                   <span key={c} style={{ fontSize: '10px', background: '#fef3c7', color: '#92400e', padding: '1px 4px', borderRadius: '4px', border: '1px solid #fcd34d' }}>{c}</span>
                                 ))}
                               </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`sexo-chip ${est.sexo === 'M' ? 'masculino' : 'femenino'}`}>
                          {est.sexo === 'M' ? 'M' : 'F'}
                        </span>
                      </td>
                      <td className="col-edad">{calcularEdad(est.fecha_nacimiento)} años</td>
                      <td className="col-cedula">{est.cedula || <span className="vacio">—</span>}</td>
                      <td>
                        {seccionCatalogo
                          ? <span className="seccion-chip"><BookOpen size={12} /> {gradoInfo?.numero ? ({ 1:'1ro', 2:'2do', 3:'3ro', 4:'4to', 5:'5to', 6:'6to' }[gradoInfo.numero as number] || `${gradoInfo.numero}°`) : ''}_{seccionCatalogo.nombre}</span>
                          : <span className="vacio">Sin asignar</span>}
                      </td>
                      <td className="col-contacto">
                        {est.correo && <div className="contacto-item"><Mail size={12} /> {est.correo}</div>}
                        {est.telefono && <div className="contacto-item"><Phone size={12} /> {est.telefono}</div>}
                        {!est.correo && !est.telefono && <span className="vacio">—</span>}
                      </td>
                      <td className="col-acciones" onClick={e => e.stopPropagation()}>
                        {isSuperOrAdmin ? (
                          <>
                            <button
                              className="btn-icon primary"
                              title="Ver / Editar"
                              onClick={() => setSelectedEstudiante(est)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn-icon delete"
                              title="Eliminar"
                              onClick={() => setShowDeleteConfirm(est)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn-icon"
                            title="Ver Detalle"
                            onClick={() => setSelectedEstudiante(est)}
                          >
                            <User size={16} />
                          </button>
                        )}
                      </td>
                      {user?.es_superusuario && (
                        <td>
                          {centroInfo ? <span className="seccion-chip">{centroInfo.nombre}</span> : <span className="vacio">—</span>}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Nuevo Estudiante ── */}
      {isModalOpen && (
        <EstudianteModal
          onClose={() => setIsModalOpen(false)}
          onSave={async () => { await cargarDatos(); setIsModalOpen(false); }}
          secciones={secciones}
        />
      )}

      {/* ── Modal Detalle / Edición ── */}
      {selectedEstudiante && (
        <EstudianteDetalleModal
          estudiante={selectedEstudiante}
          secciones={secciones}
          centros={centros}
          onClose={() => setSelectedEstudiante(null)}
          onSave={() => {
            setSelectedEstudiante(null);
            cargarDatos();
          }}
        />
      )}

      {/* ── Confirmación de Eliminación ── */}
      {showDeleteConfirm && (
        <div className="modal-overlay-premium fade-in">
          <div className="confirm-modal slide-up">
            <div className="confirm-icon danger"><Trash2 size={28} /></div>
            <h3>¿Eliminar estudiante?</h3>
            <p>
              Esta acción desactivará a <strong>{nombreCompleto(showDeleteConfirm)}</strong> del sistema.<br />
              Sus registros académicos se conservarán.
            </p>
            <div className="confirm-actions">
              <button className="btn-cancel-confirm" onClick={() => setShowDeleteConfirm(null)}>Cancelar</button>
              <button
                className="btn-danger-confirm"
                onClick={() => handleEliminar(showDeleteConfirm)}
                disabled={deletingId === showDeleteConfirm.id}
              >
                <Trash2 size={16} />
                {deletingId === showDeleteConfirm.id ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
