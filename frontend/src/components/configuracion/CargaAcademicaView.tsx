import React, { useState, useEffect, useCallback } from 'react';
import { configuracionService } from '../../services/configuracion';
import type { AsignacionPayload } from '../../services/configuracion';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../layout/DashboardLayout';
import {
  Users, Save, BookOpen, ChevronRight, GraduationCap,
  UserCheck, UserPlus, Trash2, Search, ArrowLeft, X
} from 'lucide-react';
import { usuariosService } from '../../services/usuarios';
import './CargaAcademicaView.css';

import { API_URL } from '../../services/auth';

// ─── Types ──────────────────────────────────────────────────────────────────
type ViewMode = 'seccion' | 'docente';
type SeccionTab = 'docentes' | 'estudiantes';

// ─── Component ───────────────────────────────────────────────────────────────
export const CargaAcademicaView: React.FC<{
  isWizard?: boolean;
  wizardAnioId?: number | null;
}> = ({ isWizard = false, wizardAnioId }) => {
  const { token } = useAuth();

  // ── Base data ──
  const [grados, setGrados] = useState<any[]>([]);
  const [secciones, setSecciones] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Navigation ──
  const [viewMode, setViewMode] = useState<ViewMode>('seccion');
  const [gradoActivo, setGradoActivo] = useState<any | null>(null);
  const [seccionActiva, setSeccionActiva] = useState<any | null>(null);
  const [seccionTab, setSeccionTab] = useState<SeccionTab>('docentes');

  const [docenteActivo, setDocenteActivo] = useState<any | null>(null);
  const [asignacionesDocente, setAsignacionesDocente] = useState<any[]>([]);
  const [modalAsignar, setModalAsignar] = useState<{seccion: any, gradoId: number} | null>(null);

  // ── Asignaturas / docentes (por sección) ──
  const [asignaturasGrado, setAsignaturasGrado] = useState<any[]>([]);
  const [asignacionesActuales, setAsignacionesActuales] = useState<any[]>([]);
  const [cambios, setCambios] = useState<Record<number, number>>({});

  // ── Estudiantes ──
  const [estudiantesSeccion, setEstudiantesSeccion] = useState<any[]>([]);
  const [estudiantesSinSeccion, setEstudiantesSinSeccion] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [showBuscarModal, setShowBuscarModal] = useState(false);

  const getHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Centro-Id': localStorage.getItem('activeCentroId') || ''
  });

  // ── Load base data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (token) cargarDatos();
  }, [token, wizardAnioId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const dataGrados = await configuracionService.obtenerGrados(token!, wizardAnioId ?? undefined);
      setGrados(dataGrados);
      const dataSecciones = await configuracionService.obtenerSecciones(token!);
      const seccionesFiltradas = wizardAnioId
        ? dataSecciones.filter((s: any) => dataGrados.some((g: any) => g.id === s.grado_id))
        : dataSecciones;
      setSecciones(seccionesFiltradas);

      // Cargar docentes
      const dataUsuarios = await usuariosService.obtenerUsuarios(token!);
      const docentesList = dataUsuarios
        .filter((u: any) => u.roles?.includes('DOCENTE') && u.docente_id)
        .map((u: any) => ({
          id: u.docente_id,
          nombre_completo: u.nombre_completo,
          usuario_id: u.id
        }));
      setDocentes(docentesList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Secciones of selected grado ──
  const seccionesDeGrado = gradoActivo
    ? secciones.filter((s: any) => s.grado_id === gradoActivo.id)
    : [];

  // ── When seccion selected, load asignaturas and students ──
  useEffect(() => {
    if (seccionActiva) {
      cargarAsignaturasYDocentes();
      cargarEstudiantesSeccion();
    } else {
      setAsignaturasGrado([]);
      setAsignacionesActuales([]);
      setCambios({});
      setEstudiantesSeccion([]);
    }
  }, [seccionActiva]);

  const cargarAsignaturasYDocentes = async () => {
    if (!seccionActiva || !token) return;
    try {
      // Asignaturas del grado
      const asigs = await configuracionService.obtenerAsignaturasPorGrado(token, seccionActiva.grado_id);
      setAsignaturasGrado(asigs);

      // Asignaciones actuales de esta sección
      const asignaciones = await configuracionService.obtenerAsignacionesPorSeccion(token, seccionActiva.id);
      setAsignacionesActuales(asignaciones);
      const map: Record<number, number> = {};
      // Usamos Number() para evitar mismatch string/number con datos del API
      asignaciones.forEach((a: any) => { map[Number(a.asignatura_id)] = Number(a.docente_id); });
      setCambios(map);
    } catch (err) {
      console.error(err);
    }
  };

  // Obtiene el anio_escolar_id del grado activo o usa wizardAnioId como fallback
  const getAnioId = () => {
    if (wizardAnioId) return wizardAnioId;
    if (gradoActivo?.anio_escolar_id) return gradoActivo.anio_escolar_id;
    if (seccionActiva) {
      const g = grados.find((gr: any) => gr.id === seccionActiva.grado_id);
      return g?.anio_escolar_id ?? null;
    }
    return null;
  };

  const cargarEstudiantesSeccion = async () => {
    if (!seccionActiva || !token) return;
    const anioId = getAnioId();
    if (!anioId) return;
    try {
      const res = await fetch(
        `${API_URL}/estudiantes/por-seccion/${seccionActiva.id}?anio_escolar_id=${anioId}`,
        { headers: getHeaders() }
      );
      if (res.ok) setEstudiantesSeccion(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const cargarEstudiantesSinSeccion = async () => {
    if (!token) return;
    const anioId = getAnioId();
    if (!anioId) { console.warn('No hay anio_escolar_id disponible'); return; }
    try {
      const res = await fetch(
        `${API_URL}/estudiantes/sin-seccion/${anioId}`,
        { headers: getHeaders() }
      );
      if (res.ok) setEstudiantesSinSeccion(await res.json());
      else console.error('Error al cargar estudiantes sin sección', await res.text());
    } catch (err) {
      console.error(err);
    }
  };

  // ── Docente mode: load assignments ──
  useEffect(() => {
    if (docenteActivo && token) {
      cargarAsignacionesDocente();
    } else {
      setAsignacionesDocente([]);
    }
  }, [docenteActivo]);

  const cargarAsignacionesDocente = async () => {
    if (!docenteActivo || !token) return;
    try {
      const url = new URL(`${API_URL}/asignaciones/docente/${docenteActivo.id}`);
      if (wizardAnioId) url.searchParams.set('anio_escolar_id', String(wizardAnioId));
      const res = await fetch(url.toString(), { headers: getHeaders() });
      if (res.ok) setAsignacionesDocente(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  // ── Save docente assignment ──
  const handleSaveDocentes = async () => {
    if (!seccionActiva || !token) return;
    try {
      setLoading(true);
      const grado = grados.find((g: any) => g.id === seccionActiva.grado_id);
      const anioId = grado?.anio_escolar_id ?? wizardAnioId ?? 1;

      for (const asigIdStr of Object.keys(cambios)) {
        const asigId = parseInt(asigIdStr);
        const docId = cambios[asigId];
        const existente = asignacionesActuales.find(a => Number(a.asignatura_id) === asigId);

        if (docId > 0) {
          // Si el docente es distinto, borramos la vieja antes de crear la nueva para evitar conflictos de constraint
          if (existente && Number(existente.docente_id) !== docId) {
            await fetch(`${API_URL}/asignaciones/${existente.id}`, { method: 'DELETE', headers: getHeaders() });
          }
          // Crear solo si no existía o si era diferente
          if (!existente || Number(existente.docente_id) !== docId) {
            const payload: AsignacionPayload = {
              docente_id: docId,
              asignatura_id: asigId,
              seccion_id: seccionActiva.id,
              anio_escolar_id: anioId
            };
            await configuracionService.crearAsignacion(token, payload);
          }
        } else if (docId <= 0 && existente) {
          // Fue marcado como sin asignar, así que eliminamos la existente
          await fetch(`${API_URL}/asignaciones/${existente.id}`, { method: 'DELETE', headers: getHeaders() });
        }
      }
      await cargarAsignaturasYDocentes(); // Refresh state
      alert('✅ Carga académica guardada.');
    } catch (err: any) {
      alert(err.message || 'Error guardando.');
    } finally {
      setLoading(false);
    }
  };

  // ── Assign student to section ──
  const handleAsignarEstudiante = async (estudianteId: number) => {
    if (!seccionActiva || !token) return;
    const anioId = getAnioId();
    if (!anioId) return;
    try {
      const res = await fetch(`${API_URL}/estudiantes/asignar-seccion`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          estudiante_id: estudianteId,
          seccion_id: seccionActiva.id,
          anio_escolar_id: anioId
        })
      });
      if (!res.ok) throw new Error('Error al asignar');
      setEstudiantesSinSeccion(prev => prev.filter(e => e.id !== estudianteId));
      cargarEstudiantesSeccion();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ── Remove student from section ──
  const handleRetirarEstudiante = async (inscripcionId: number) => {
    if (!confirm('¿Retirar este estudiante de la sección?')) return;
    try {
      const res = await fetch(`${API_URL}/estudiantes/retirar-seccion/${inscripcionId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Error al retirar');
      cargarEstudiantesSeccion();
    } catch (err: any) {
      alert(err.message);
    }
  };



  const estudiantesFiltrados = estudiantesSinSeccion.filter(e =>
    e.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.rne.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────
  // ── RENDER ────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  const content = (
    <div className="ca-container">

      {/* ── Mode Toggle ── */}
      <div className="ca-mode-toggle">
        <button
          className={`ca-mode-btn ${viewMode === 'seccion' ? 'active' : ''}`}
          onClick={() => { setViewMode('seccion'); setGradoActivo(null); setSeccionActiva(null); }}
        >
          <BookOpen size={16} /> Por Sección
        </button>
        <button
          className={`ca-mode-btn ${viewMode === 'docente' ? 'active' : ''}`}
          onClick={() => { setViewMode('docente'); setDocenteActivo(null); }}
        >
          <UserCheck size={16} /> Por Docente
        </button>
      </div>

      {/* ══════════════════════ MODO POR SECCIÓN ══════════════════════ */}
      {viewMode === 'seccion' && (
        <>
          {/* Breadcrumb */}
          {(gradoActivo || seccionActiva) && (
            <div className="ca-breadcrumb">
              <button onClick={() => { setGradoActivo(null); setSeccionActiva(null); }} className="ca-crumb">
                Grados
              </button>
              {gradoActivo && <><ChevronRight size={14} /><button onClick={() => setSeccionActiva(null)} className="ca-crumb">{gradoActivo.nombre}</button></>}
              {seccionActiva && <><ChevronRight size={14} /><span className="ca-crumb active">Sección {seccionActiva.nombre}</span></>}
            </div>
          )}

          {/* Step 1: Grados */}
          {!gradoActivo && (
            <div>
              <p className="ca-hint">Selecciona un grado para configurar su carga académica.</p>
              {loading ? <p>Cargando...</p> : (
                <div className="ca-grid">
                  {grados.map(g => {
                    const ordinales: Record<number, string> = {
                      1: '1ro', 2: '2do', 3: '3ro', 4: '4to', 5: '5to', 6: '6to'
                    };
                    const ordinal = ordinales[g.numero] || `${g.numero}°`;
                    return (
                      <div key={g.id} className="ca-card" onClick={() => setGradoActivo(g)}>
                        <div className="ca-card-icon grade-num">
                          <span className="ca-grade-num">{ordinal}</span>
                        </div>
                        <div className="ca-card-title">{g.nombre}</div>
                        <div className="ca-card-sub">{secciones.filter(s => s.grado_id === g.id).length} sección(es)</div>
                      </div>
                    );
                  })}
                  {grados.length === 0 && <p className="ca-empty">No hay grados configurados para este año escolar.</p>}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Secciones del grado */}
          {gradoActivo && !seccionActiva && (
            <div>
              <p className="ca-hint">Selecciona una sección de <strong>{gradoActivo.nombre}</strong>.</p>
              <div className="ca-grid small">
                {seccionesDeGrado.map(s => (
                  <div key={s.id} className="ca-card" onClick={() => setSeccionActiva(s)}>
                    <div className="ca-card-icon large">
                      <span className="ca-section-letter">{s.nombre}</span>
                    </div>
                    <div className="ca-card-title">Sección {s.nombre}</div>
                    <div className="ca-card-sub">{s.tanda}</div>
                  </div>
                ))}
                {seccionesDeGrado.length === 0 && (
                  <p className="ca-empty">Este grado no tiene secciones. Agrégalas en "Grados y Secciones".</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Detalle de la sección (Sub-tabs) */}
          {seccionActiva && (
            <div className="ca-detail">
              <div className="ca-sub-tabs">
                <button
                  className={`ca-sub-tab ${seccionTab === 'docentes' ? 'active' : ''}`}
                  onClick={() => setSeccionTab('docentes')}
                >
                  <UserCheck size={16} /> Docentes por Asignatura
                </button>
                <button
                  className={`ca-sub-tab ${seccionTab === 'estudiantes' ? 'active' : ''}`}
                  onClick={() => {
                    setSeccionTab('estudiantes');
                    cargarEstudiantesSeccion();
                  }}
                >
                  <Users size={16} /> Estudiantes ({estudiantesSeccion.length})
                </button>
              </div>

              {/* Sub-tab: Docentes */}
              {seccionTab === 'docentes' && (
                <div className="card">
                  <div className="ca-panel-header">
                    <h4>Asignación de Docentes — {gradoActivo?.nombre}, Sección {seccionActiva.nombre}</h4>
                    <button className="btn-primary" onClick={handleSaveDocentes} disabled={loading}>
                      <Save size={16} /> Guardar
                    </button>
                  </div>
                  <table className="modern-table">
                    <thead>
                      <tr><th>Asignatura</th><th>Docente Asignado</th></tr>
                    </thead>
                    <tbody>
                      {asignaturasGrado.filter(a => a.es_activa).map(asig => (
                        <tr key={asig.asignatura_id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{asig.asignatura_nombre}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asig.asignatura_codigo}</div>
                          </td>
                          <td>
                            <select
                              value={cambios[asig.asignatura_id] || 0}
                              onChange={e => setCambios(prev => ({ ...prev, [asig.asignatura_id]: parseInt(e.target.value) }))}
                              className="ca-select"
                            >
                              <option value={0}>— Sin asignar —</option>
                              {docentes.map(d => (
                                <option key={d.id} value={d.id}>{d.nombre_completo}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                      {asignaturasGrado.filter(a => a.es_activa).length === 0 && (
                        <tr><td colSpan={2} className="ca-empty-cell">No hay asignaturas en este grado. Configura el currículo primero.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sub-tab: Estudiantes */}
              {seccionTab === 'estudiantes' && (
                <div className="card">
                  <div className="ca-panel-header">
                    <h4>Estudiantes matriculados — {gradoActivo?.nombre}, Sección {seccionActiva.nombre}</h4>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        cargarEstudiantesSinSeccion();
                        setShowBuscarModal(true);
                      }}
                    >
                      <UserPlus size={16} /> Agregar Estudiante
                    </button>
                  </div>
                  <table className="modern-table">
                    <thead>
                      <tr><th>#</th><th>Nombre</th><th>RNE</th><th>Estado</th><th></th></tr>
                    </thead>
                    <tbody>
                      {estudiantesSeccion.map((e, i) => (
                        <tr key={e.id}>
                          <td style={{ color: 'var(--text-muted)', width: 40 }}>{e.numero_orden ?? i + 1}</td>
                          <td style={{ fontWeight: 600 }}>{e.nombre_completo}</td>
                          <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{e.rne}</td>
                          <td><span className={`badge ${e.estado === 'ACTIVO' ? 'badge-success' : 'badge-warn'}`}>{e.estado}</span></td>
                          <td>
                            <button className="btn-icon delete" onClick={() => handleRetirarEstudiante(e.inscripcion_id)} title="Retirar">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {estudiantesSeccion.length === 0 && (
                        <tr><td colSpan={5} className="ca-empty-cell">No hay estudiantes matriculados en esta sección.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════ MODO POR DOCENTE ══════════════════════ */}
      {viewMode === 'docente' && (
        <div>
          {!docenteActivo ? (
            <>
              <p className="ca-hint">Selecciona un docente para ver y editar sus asignaciones.</p>
              <div className="ca-grid small">
                {docentes.map(d => (
                  <div key={d.id} className="ca-card" onClick={() => setDocenteActivo(d)}>
                    <div className="ca-card-icon"><UserCheck size={28} /></div>
                    <div className="ca-card-title">{d.nombre_completo}</div>
                    <div className="ca-card-sub">Docente</div>
                  </div>
                ))}
                {docentes.length === 0 && <p className="ca-empty">No hay docentes registrados. Crea usuarios con rol Docente.</p>}
              </div>
            </>
          ) : (
            <div>
              <div className="ca-breadcrumb">
                <Users size={14} />
                <span className="ca-crumb" onClick={() => setDocenteActivo(null)}>Docentes</span>
                <ChevronRight size={14} />
                <span className="ca-crumb active">{docenteActivo.nombre_completo}</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Selecciona la sección para asignarle materias a <strong>{docenteActivo.nombre_completo}</strong>.
              </div>

              {grados.map(g => {
                const secsGrado = secciones.filter((s: any) => s.grado_id === g.id);
                if (secsGrado.length === 0) return null;
                const ordinales: Record<number, string> = {
                  1: '1ro', 2: '2do', 3: '3ro', 4: '4to', 5: '5to', 6: '6to'
                };
                const ordinal = ordinales[g.numero] || `${g.numero}°`;
                return (
                  <div key={g.id} className="card" style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="ca-grado-badge">{ordinal}</span>
                      {g.nombre}
                    </h4>
                    {secsGrado.map(sec => (
                      <AsyncSeccionPanel
                        key={sec.id}
                        seccion={sec}
                        gradoId={g.id}
                        asignacionesDocente={asignacionesDocente}
                        onConfigure={() => setModalAsignar({ seccion: sec, gradoId: g.id })}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Modal Buscar Estudiantes ── */}
      {showBuscarModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Agregar Estudiante a Sección {seccionActiva?.nombre}</h3>
              <button className="btn-icon" onClick={() => setShowBuscarModal(false)}><X size={20} /></button>
            </div>
            <div className="ca-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar por nombre o RNE..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table className="modern-table">
                <thead><tr><th>Nombre</th><th>RNE</th><th></th></tr></thead>
                <tbody>
                  {estudiantesFiltrados.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.nombre_completo}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{e.rne}</td>
                      <td>
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                          onClick={() => handleAsignarEstudiante(e.id)}
                        >
                          <UserPlus size={13} /> Asignar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {estudiantesFiltrados.length === 0 && (
                    <tr><td colSpan={3} className="ca-empty-cell">No se encontraron estudiantes disponibles.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowBuscarModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {modalAsignar && (
        <AsignarAsignaturaDocenteModal
          seccion={modalAsignar.seccion}
          gradoId={modalAsignar.gradoId}
          token={token!}
          docenteActivo={docenteActivo}
          asignacionesDocente={asignacionesDocente}
          wizardAnioId={wizardAnioId}
          grados={grados}
          onClose={() => setModalAsignar(null)}
          onSaved={() => {
            setModalAsignar(null);
            cargarAsignacionesDocente();
          }}
        />
      )}
    </div>
  );

  if (isWizard) return content;
  return <DashboardLayout title="Carga Académica">{content}</DashboardLayout>;
};

// ─── AsyncSeccionPanel: muestra asignaturas asignadas de una sección ──
const AsyncSeccionPanel: React.FC<{
  seccion: any;
  gradoId: number;
  asignacionesDocente: any[];
  onConfigure: () => void;
}> = ({ seccion, gradoId, asignacionesDocente, onConfigure }) => {
  const misAsignaturas = asignacionesDocente.filter(ad => Number(ad.seccion_id) === Number(seccion.id));

  return (
    <div style={{ marginBottom: '1rem', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1rem', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
          Sección {seccion.nombre} — {seccion.tanda}
        </div>
        <button className="btn-secondary" onClick={onConfigure} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
          Configurar Asignaturas
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {misAsignaturas.map((ad: any) => (
          <span key={ad.id} style={{
            background: 'var(--bg-primary-light)',
            color: 'var(--color-primary-dark)',
            padding: '0.3rem 0.6rem',
            borderRadius: '16px',
            fontSize: '0.8rem',
            fontWeight: 500
          }}>
            {ad.asignatura_nombre || ad.asignatura?.nombre || 'Asignatura Asignada'}
          </span>
        ))}
        {misAsignaturas.length === 0 && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>Ninguna asignatura asignada.</span>
        )}
      </div>
    </div>
  );
};

// ─── Modal para Asignar Asignaturas al Docente ──
const AsignarAsignaturaDocenteModal: React.FC<{
  seccion: any;
  gradoId: number;
  token: string;
  docenteActivo: any;
  asignacionesDocente: any[];
  wizardAnioId?: number | null;
  grados: any[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ seccion, gradoId, token, docenteActivo, asignacionesDocente, wizardAnioId, grados, onClose, onSaved }) => {
  const [asigs, setAsigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    configuracionService.obtenerAsignaturasPorGrado(token, gradoId)
      .then(data => {
        const activas = data.filter((a: any) => a.es_activa);
        setAsigs(activas);
        
        // Inicializar con las que ya están asignadas en BD
        const assignedIds = asignacionesDocente
          .filter(ad => Number(ad.seccion_id) === Number(seccion.id))
          .map(ad => Number(ad.asignatura_id));
        setSelectedIds(assignedIds);
        setIsReady(true);
      })
      .catch(() => setIsReady(true));
  }, [gradoId, token, asignacionesDocente, seccion.id]);

  const toggleSelect = (asigId: number) => {
    setSelectedIds(prev =>
      prev.includes(asigId) ? prev.filter(id => id !== asigId) : [...prev, asigId]
    );
  };

  const handleSave = async () => {
    if (!token) return;
    setLoading(true);
    
    const grado = grados.find((g: any) => Number(g.id) === Number(gradoId));
    const anioId = wizardAnioId || grado?.anio_escolar_id || 1; // Fallback

    try {
      // 1. Encontrar asignaciones actuales
      const actuales = asignacionesDocente.filter(ad => Number(ad.seccion_id) === Number(seccion.id));
      const idsActuales = actuales.map(ad => Number(ad.asignatura_id));

      // 2. Determinar cuáles agregar y cuáles eliminar
      const aAgregar = selectedIds.filter(id => !idsActuales.includes(id));
      const aEliminar = actuales.filter(ad => !selectedIds.includes(Number(ad.asignatura_id)));

      // 3. Ejecutar eliminaciones
      for (const ad of aEliminar) {
        const res = await fetch(`${API_URL}/asignaciones/${ad.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`DELETE error ${res.status}: ${text}`);
        }
      }

      // 4. Ejecutar adiciones
      for (const asigId of aAgregar) {
        const payload = {
          docente_id: Number(docenteActivo.id),
          asignatura_id: Number(asigId),
          seccion_id: Number(seccion.id),
          anio_escolar_id: Number(anioId)
        };
        const res = await fetch(`${API_URL}/asignaciones/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`POST error ${res.status}: ${text}`);
        }
      }

      onSaved();
    } catch (err: any) {
      console.error(err);
      alert(`Error al guardar asignaturas: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Asignar Asignaturas</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Seleccione las asignaturas que <strong>{docenteActivo.nombre_completo}</strong> impartirá en la sección <strong>{seccion.nombre}</strong>.
        </p>

        {!isReady ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
            {asigs.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay asignaturas configuradas para este grado.</div>
            ) : (
              asigs.map(a => (
                <label key={a.asignatura_id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(Number(a.asignatura_id))}
                    onChange={() => toggleSelect(Number(a.asignatura_id))}
                    style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.asignatura_nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.asignatura_codigo}</div>
                  </div>
                </label>
              ))
            )}
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
          <button className="btn-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading || !isReady}>
            {loading ? 'Guardando...' : 'Guardar Asignaturas'}
          </button>
        </div>
      </div>
    </div>
  );
};
