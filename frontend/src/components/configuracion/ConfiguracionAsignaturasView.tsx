import React, { useState, useEffect } from 'react';
import { configuracionService } from '../../services/configuracion';
import { institucionalService } from '../../services/institucionalService';
import type { GradoAsignaturaPayload, GrupoCompetenciaPayload } from '../../services/configuracion';
import type { AnioEscolar } from '../../services/institucionalService';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Plus, Trash2, FolderTree, BookOpen } from 'lucide-react';
import './SeccionesView.css';

const formatModalidad = (mod: string) => {
  if (mod === 'CIENCIAS_Y_HUMANIDADES' || mod === 'ACADEMICA') return 'Académica';
  if (mod === 'TECNICO_PROFESIONAL') return 'Técnico Profesional';
  if (mod === 'ARTES') return 'Artes';
  return mod;
};

export const ConfiguracionAsignaturasView: React.FC<{ 
  isWizard?: boolean;
  wizardAnioId?: number | null;
  onWizardAnioChange?: (id: number) => void;
}> = ({ isWizard = false, wizardAnioId, onWizardAnioChange }) => {
  const { token } = useAuth();
  
  // Selectors
  const [anios, setAnios] = useState<AnioEscolar[]>([]);
  const [selectedAnioId, setSelectedAnioId] = useState<number | null>(null);
  const [grados, setGrados] = useState<any[]>([]);
  const [selectedGradoId, setSelectedGradoId] = useState<number | null>(null);
  const [todasAsignaturas, setTodasAsignaturas] = useState<any[]>([]);
  
  // Data
  const [asignaturasGrado, setAsignaturasGrado] = useState<any[]>([]);
  const [selectedAsignaturaId, setSelectedAsignaturaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  // Modals
  const [showAddAsignaturaModal, setShowAddAsignaturaModal] = useState(false);

  // Forms
  const [selectedMateriaIds, setSelectedMateriaIds] = useState<number[]>([]);

  useEffect(() => {
    if (wizardAnioId && wizardAnioId !== selectedAnioId) {
      setSelectedAnioId(wizardAnioId);
    }
  }, [wizardAnioId]);

  useEffect(() => {
    cargarDatosIniciales();
  }, [token]);

  useEffect(() => {
    if (selectedAnioId) {
      cargarGrados(selectedAnioId);
    } else {
      setGrados([]);
      setSelectedGradoId(null);
    }
  }, [selectedAnioId]);

  useEffect(() => {
    if (selectedGradoId) {
      cargarAsignaturasGrado(selectedGradoId);
    } else {
      setAsignaturasGrado([]);
      setSelectedAsignaturaId(null);
    }
  }, [selectedGradoId]);
  


  const cargarDatosIniciales = async () => {
    try {
      if (!token) return;
      const aniosData = await institucionalService.getAniosEscolares();
      setAnios(aniosData);
      if (aniosData.length > 0 && !isWizard) {
        const anioActivo = aniosData.find(a => a.estado === 'ACTIVO') || aniosData[0];
        setSelectedAnioId(anioActivo.id);
      } else if (isWizard && wizardAnioId) {
        setSelectedAnioId(wizardAnioId);
      }
      
      const asigs = await configuracionService.obtenerAsignaturas(token);
      asigs.sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0) || a.nombre.localeCompare(b.nombre));
      setTodasAsignaturas(asigs);
    } catch (err) {
      console.error("Error al cargar años/asignaturas", err);
    }
  };

  const cargarGrados = async (anioId: number) => {
    try {
      if (!token) return;
      const dataGrados = await configuracionService.obtenerGrados(token, anioId);
      setGrados(dataGrados);
    } catch (err) {
      console.error("Error al cargar grados", err);
    }
  };

  const cargarAsignaturasGrado = async (gradoId: number) => {
    try {
      setLoading(true);
      if (!token) return;
      const data = await configuracionService.obtenerAsignaturasPorGrado(token, gradoId);
      data.sort((a: any, b: any) => (a.asignatura_orden || 0) - (b.asignatura_orden || 0) || a.asignatura_nombre.localeCompare(b.asignatura_nombre));
      setAsignaturasGrado(data);
    } catch (err) {
      console.error("Error al cargar asignaturas del grado", err);
    } finally {
      setLoading(false);
    }
  };
  


  const handleAddAsignatura = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGradoId || selectedMateriaIds.length === 0) return;
    try {
      if (token) {
        setLoading(true);
        // Hacemos las peticiones en secuencia o paralelo. En secuencia es más seguro por la DB sqlite a veces.
        for (const asigId of selectedMateriaIds) {
          await configuracionService.asignarMateriaAGrado(token, {
            grado_id: selectedGradoId,
            asignatura_id: asigId
          });
        }
        setShowAddAsignaturaModal(false);
        setSelectedMateriaIds([]);
        await cargarAsignaturasGrado(selectedGradoId);
      }
    } catch (err: any) {
      alert(`Error al agregar asignaturas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAsignatura = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas remover esta asignatura del grado?")) return;
    try {
      if (token && selectedGradoId) {
        await configuracionService.removerMateriaDeGrado(token, id);
        if (selectedAsignaturaId === id) setSelectedAsignaturaId(null);
        cargarAsignaturasGrado(selectedGradoId);
      }
    } catch (err) {
      alert("Error al remover la asignatura");
    }
  };



  const selectedAsigInfo = asignaturasGrado.find(a => a.asignatura_id === selectedAsignaturaId);

  const content = (
      <div className="anios-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div className="header-actions">
          <h2 className="title"><BookOpen size={24} /> Asignaturas y Competencias (Proceso 3)</h2>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {!isWizard && (
            <div style={{ flex: '1 1 300px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Año Escolar Activo</label>
              <select 
                value={selectedAnioId || ''} 
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedAnioId(id);
                  if (onWizardAnioChange && id) onWizardAnioChange(id);
                }}
                className="search-input"
                style={{ width: '100%' }}
              >
                <option value="" disabled>Seleccione un año escolar</option>
                {anios.map(a => <option key={a.id} value={a.id}>{a.descripcion}</option>)}
              </select>
            </div>
          )}
          
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Grado a Configurar</label>
            <select 
              value={selectedGradoId || ''} 
              onChange={(e) => setSelectedGradoId(Number(e.target.value))}
              className="search-input"
              style={{ width: '100%' }}
              disabled={!selectedAnioId || grados.length === 0}
            >
              <option value="" disabled>Seleccione un grado</option>
              {grados.map(g => <option key={g.id} value={g.id}>{g.nombre} ({formatModalidad(g.modalidad)})</option>)}
            </select>
          </div>
        </div>

        {!selectedGradoId ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <FolderTree size={48} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
            <p>Selecciona un grado para ver y configurar sus asignaturas y competencias.</p>
          </div>
        ) : (
          <div className="layout-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
            
            {/* PANEL ASIGNATURAS */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BookOpen size={18} /> Asignaturas</h3>
                <button className="btn-secondary" onClick={() => setShowAddAsignaturaModal(true)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  <Plus size={14} /> Agregar
                </button>
              </div>
              
              <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table className="modern-table">
                  <tbody>
                    {asignaturasGrado.map(ag => (
                      <tr 
                        key={ag.id} 
                        style={{ cursor: 'pointer', background: selectedAsignaturaId === ag.asignatura_id ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}
                        onClick={() => setSelectedAsignaturaId(ag.asignatura_id)}
                      >
                        <td>
                          <div style={{ fontWeight: 600 }}>{ag.asignatura_nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ag.asignatura_codigo}</div>
                        </td>
                        <td className="actions-cell">
                          <button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleRemoveAsignatura(ag.id); }} title="Remover del Grado">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {asignaturasGrado.length === 0 && !loading && (
                      <tr><td colSpan={2} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No hay asignaturas en este grado</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>


          </div>
        )}

      {/* MODAL AGREGAR ASIGNATURA */}
      {showAddAsignaturaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Agregar Asignaturas al Grado</h3>
            <form onSubmit={handleAddAsignatura} className="modal-form">
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ margin: 0 }}>Seleccione Asignaturas</label>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                    onClick={() => {
                      const disponibles = todasAsignaturas.filter(ta => !asignaturasGrado.some(ag => ag.asignatura_id === ta.id));
                      setSelectedMateriaIds(disponibles.map(a => a.id));
                    }}
                  >
                    Seleccionar todas
                  </button>
                </div>
                <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {todasAsignaturas.filter(ta => !asignaturasGrado.some(ag => ag.asignatura_id === ta.id)).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Todas las asignaturas ya están agregadas.</p>
                  ) : (
                    todasAsignaturas.filter(ta => !asignaturasGrado.some(ag => ag.asignatura_id === ta.id)).map(a => (
                      <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', cursor: 'pointer', padding: '10px 15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', transition: 'all 0.2s ease' }}>
                        <input 
                          type="checkbox" 
                          style={{ margin: 0, width: '18px', height: '18px', flexShrink: 0, cursor: 'pointer' }}
                          checked={selectedMateriaIds.includes(a.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMateriaIds([...selectedMateriaIds, a.id]);
                            } else {
                              setSelectedMateriaIds(selectedMateriaIds.filter(id => id !== a.id));
                            }
                          }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', justifyContent: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-main)' }}>{a.codigo}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{a.nombre}</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Se generará automáticamente la estructura de Competencias de MINERD (CE1 a CE7 en 4 Grupos).</p>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowAddAsignaturaModal(false); setSelectedMateriaIds([]); }}>Cancelar</button>
                <button type="submit" className="btn-submit" disabled={selectedMateriaIds.length === 0 || loading}>
                  {loading ? 'Agregando...' : 'Agregar Seleccionadas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      
      </div>
  );

  if (isWizard) return content;
  return <DashboardLayout title="Asignaturas y Competencias">{content}</DashboardLayout>;
};
