import React, { useState, useEffect } from 'react';
import { createFormatHandler } from '../../utils/inputFormat';
import { configuracionService } from '../../services/configuracion';
import { institucionalService } from '../../services/institucionalService';
import type { GradoPayload, SeccionPayload } from '../../services/configuracion';
import type { AnioEscolar } from '../../services/institucionalService';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Plus, Trash2, FolderTree, Calendar, Layers } from 'lucide-react';
import './SeccionesView.css';

export const SeccionesView: React.FC<{ 
  isWizard?: boolean;
  wizardAnioId?: number | null;
  onWizardAnioChange?: (id: number) => void;
}> = ({ isWizard = false, wizardAnioId, onWizardAnioChange }) => {
  const { token } = useAuth();
  const [anios, setAnios] = useState<AnioEscolar[]>([]);
  const [selectedAnioId, setSelectedAnioId] = useState<number | null>(null);
  
  const [secciones, setSecciones] = useState<any[]>([]);
  const [grados, setGrados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showGradoModal, setShowGradoModal] = useState(false);
  const [showSeccionModal, setShowSeccionModal] = useState(false);

  const [gradoForm, setGradoForm] = useState<GradoPayload>({
    numero: 1, nombre: 'Primer Grado', ciclo: 1, modalidad: 'CIENCIAS_Y_HUMANIDADES', anio_escolar_id: 0
  });
  
  const [seccionForm, setSeccionForm] = useState<SeccionPayload>({
    nombre: 'A', tanda: 'MATUTINA', capacidad_max: 35, es_activa: true, grado_id: 0
  });

  useEffect(() => {
    if (wizardAnioId && wizardAnioId !== selectedAnioId) {
      setSelectedAnioId(wizardAnioId);
    }
  }, [wizardAnioId]);

  useEffect(() => {
    cargarAnios();
  }, [token]);

  useEffect(() => {
    if (selectedAnioId) {
      cargarDatosEstructura(selectedAnioId);
    } else {
      setGrados([]);
      setSecciones([]);
    }
  }, [selectedAnioId]);

  const cargarAnios = async () => {
    try {
      if (token) {
        const aniosData = await institucionalService.getAniosEscolares();
        setAnios(aniosData);
        if (aniosData.length > 0 && !isWizard) {
          // Seleccionar por defecto el activo o el primero en configuración solo si no estamos en wizard
          const anioActivo = aniosData.find(a => a.estado === 'ACTIVO') || aniosData[0];
          setSelectedAnioId(anioActivo.id);
        } else if (isWizard && wizardAnioId) {
          setSelectedAnioId(wizardAnioId);
        }
      }
    } catch (err) {
      console.error("Error al cargar años escolares", err);
    }
  };

  const cargarDatosEstructura = async (anioId: number) => {
    try {
      setLoading(true);
      if (token) {
        const dataGrados = await configuracionService.obtenerGrados(token, anioId);
        setGrados(dataGrados);
        
        const dataSecciones = await configuracionService.obtenerSecciones(token);
        // Filtrar secciones solo para los grados del año seleccionado
        const gradosIds = new Set(dataGrados.map((g: any) => g.id));
        const seccionesFiltradas = dataSecciones.filter((s: any) => gradosIds.has(s.grado_id));
        setSecciones(seccionesFiltradas);
      }
    } catch (err) {
      console.error("Error al cargar datos", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGrado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnioId) return;
    try {
      if (token) {
        const payload = { ...gradoForm, anio_escolar_id: selectedAnioId };
        await configuracionService.crearGrado(token, payload);
        setShowGradoModal(false);
        cargarDatosEstructura(selectedAnioId);
      }
    } catch (err: any) {
      alert(`Error al crear grado: ${err.message || 'Desconocido'}`);
    }
  };

  const handleCreateSeccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnioId) return;
    try {
      if (token) {
        const payload = { ...seccionForm };
        if (payload.grado_id === 0 && grados.length > 0) {
          payload.grado_id = grados[0].id;
        }
        await configuracionService.crearSeccion(token, payload);
        setShowSeccionModal(false);
        cargarDatosEstructura(selectedAnioId);
      }
    } catch (err) {
      alert("Error al crear sección");
    }
  };

  const handleDeleteGrado = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este grado?")) return;
    try {
      if (token && selectedAnioId) {
        await configuracionService.eliminarGrado(token, id);
        cargarDatosEstructura(selectedAnioId);
      }
    } catch (err: any) {
      alert(err.message || "Error de red: No se pudo eliminar el grado. Verifique que el servidor esté activo.");
    }
  };

  const handleDeleteSeccion = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta sección?")) return;
    try {
      if (token && selectedAnioId) {
        await configuracionService.eliminarSeccion(token, id);
        cargarDatosEstructura(selectedAnioId);
      }
    } catch (err: any) {
      alert(err.message || "Error de red: No se pudo eliminar la sección.");
    }
  };

  const getGradoNombre = (gradoId: number) => {
    const g = grados.find(x => x.id === gradoId);
    return g ? g.nombre : 'Desconocido';
  };

  const formatModalidad = (mod: string) => {
    if (mod === 'CIENCIAS_Y_HUMANIDADES' || mod === 'ACADEMICA') return 'Académica';
    if (mod === 'TECNICO_PROFESIONAL') return 'Técnico Profesional';
    if (mod === 'ARTE') return 'Arte';
    if (mod === 'ADULTOS') return 'Adultos';
    return mod;
  };

  const content = (
      <div className="anios-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div className="header-actions">
          <h2 className="title"><FolderTree size={24} /> Grados y Secciones (Proceso 2)</h2>
          <div className="actions-group">
            <button className="btn-secondary" onClick={() => setShowGradoModal(true)} disabled={!selectedAnioId}>
              <Plus size={18} /> Nuevo Grado
            </button>
            <button className="btn-primary" onClick={() => setShowSeccionModal(true)} disabled={grados.length === 0}>
              <Plus size={18} /> Nueva Sección
            </button>
          </div>
        </div>

        {!isWizard && (
          <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Calendar style={{ color: 'var(--color-primary)' }} />
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Año Escolar Activo</label>
              <select 
                value={selectedAnioId || ''} 
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedAnioId(id);
                  if (onWizardAnioChange && id) onWizardAnioChange(id);
                }}
                className="search-input"
                style={{ width: '100%', maxWidth: '400px' }}
              >
                <option value="" disabled>Seleccione un año escolar</option>
                {anios.map(a => (
                  <option key={a.id} value={a.id}>{a.descripcion} ({a.estado})</option>
                ))}
              </select>
            </div>
            <div style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--color-primary-light)', fontSize: '0.85rem' }}>
              Selecciona un Año Escolar para administrar su estructura académica.
            </div>
          </div>
        )}

      {!selectedAnioId ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Layers size={48} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
          <p>Selecciona un año escolar para ver y configurar sus grados.</p>
        </div>
      ) : (
        <div className="layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><FolderTree size={20} /> Grados Registrados</h3>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Ciclo</th>
                    <th>Nombre</th>
                    <th>Modalidad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {grados.map(g => (
                    <tr key={g.id}>
                      <td><span className="badge">Ciclo {g.ciclo}</span></td>
                      <td style={{ fontWeight: 600 }}>{g.nombre}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatModalidad(g.modalidad)}</td>
                      <td className="actions-cell">
                        <button className="btn-icon delete" onClick={() => handleDeleteGrado(g.id)} title="Eliminar Grado">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {grados.length === 0 && !loading && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No hay grados registrados en este año</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Layers size={20} /> Secciones Registradas</h3>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Grado</th>
                    <th>Nombre</th>
                    <th>Tanda</th>
                    <th>Cupo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {secciones.map(s => (
                    <tr key={s.id}>
                      <td><span style={{ fontSize: '0.85rem' }}>{getGradoNombre(s.grado_id)}</span></td>
                      <td><span className="badge-lg" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-primary-light)' }}>{s.nombre}</span></td>
                      <td><span className="status-active" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}>{s.tanda}</span></td>
                      <td style={{ textAlign: 'center' }}>{s.capacidad_max}</td>
                      <td className="actions-cell">
                        <button className="btn-icon delete" onClick={() => handleDeleteSeccion(s.id)} title="Eliminar Sección">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {secciones.length === 0 && !loading && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No hay secciones registradas en este año</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showGradoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nuevo Grado</h3>
            <form onSubmit={handleCreateGrado} className="modal-form">
              <div className="form-group">
                <label>Grado</label>
                <select 
                  value={gradoForm.numero} 
                  onChange={e => {
                    const numero = parseInt(e.target.value);
                    const nombres: Record<number, string> = {
                      1: 'Primer Grado',
                      2: 'Segundo Grado',
                      3: 'Tercer Grado',
                      4: 'Cuarto Grado',
                      5: 'Quinto Grado',
                      6: 'Sexto Grado'
                    };
                    setGradoForm({
                      ...gradoForm, 
                      numero, 
                      nombre: nombres[numero] || ''
                    });
                  }} 
                  required
                >
                  <option value={1}>1ro - Primer Grado</option>
                  <option value={2}>2do - Segundo Grado</option>
                  <option value={3}>3ro - Tercer Grado</option>
                  <option value={4}>4to - Cuarto Grado</option>
                  <option value={5}>5to - Quinto Grado</option>
                  <option value={6}>6to - Sexto Grado</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ciclo</label>
                <select value={gradoForm.ciclo} onChange={e => setGradoForm({...gradoForm, ciclo: parseInt(e.target.value)})}>
                  <option value={1}>1er Ciclo</option>
                  <option value={2}>2do Ciclo</option>
                </select>
              </div>
              <div className="form-group">
                <label>Modalidad</label>
                <select value={gradoForm.modalidad} onChange={e => setGradoForm({...gradoForm, modalidad: e.target.value})}>
                  <option value="CIENCIAS_Y_HUMANIDADES">Académica</option>
                  <option value="TECNICO_PROFESIONAL">Técnico Profesional</option>
                  <option value="ARTE">Arte</option>
                  <option value="ADULTOS">Adultos</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowGradoModal(false)}>Cancelar</button>
                <button type="submit" className="btn-submit">Guardar Grado</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSeccionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nueva Sección</h3>
            <form onSubmit={handleCreateSeccion} className="modal-form">
              <div className="form-group">
                <label>Grado</label>
                <select value={seccionForm.grado_id} onChange={e => setSeccionForm({...seccionForm, grado_id: parseInt(e.target.value)})}>
                  <option value={0} disabled>Seleccione un grado</option>
                  {grados.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Letra / Nombre de la Sección</label>
                <input type="text" value={seccionForm.nombre} onChange={createFormatHandler('codigo', (val) => setSeccionForm({...seccionForm, nombre: val}))} required maxLength={2} placeholder="Ej. A" />
              </div>
              <div className="form-group">
                <label>Tanda</label>
                <select value={seccionForm.tanda} onChange={e => setSeccionForm({...seccionForm, tanda: e.target.value})}>
                  <option value="MATUTINA">Matutina</option>
                  <option value="VESPERTINA">Vespertina</option>
                  <option value="NOCTURNA">Nocturna</option>
                  <option value="SABATINA">Sabatina</option>
                  <option value="JEE">Jornada Escolar Extendida (JEE)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Capacidad Máxima (Estudiantes)</label>
                <input type="number" min="1" max="100" value={seccionForm.capacidad_max} onChange={e => setSeccionForm({...seccionForm, capacidad_max: parseInt(e.target.value)})} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowSeccionModal(false)}>Cancelar</button>
                <button type="submit" className="btn-submit">Guardar Sección</button>
              </div>
            </form>
          </div>
        </div>
        )}
      </div>
  );

  if (isWizard) return content;
  return <DashboardLayout title="Grados y Secciones">{content}</DashboardLayout>;
};
