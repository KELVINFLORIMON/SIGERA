import React, { useState, useEffect } from 'react';
import { configuracionService } from '../../services/configuracion';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, X, Bookmark, Layers } from 'lucide-react';
import './SeccionesView.css';

interface AsignaturaPlantillaModalProps {
  asignaturaId: number;
  asignaturaNombre: string;
  onClose: () => void;
}

export const AsignaturaPlantillaModal: React.FC<AsignaturaPlantillaModalProps> = ({
  asignaturaId,
  asignaturaNombre,
  onClose
}) => {
  const { token } = useAuth();
  
  const [gruposPlantilla, setGruposPlantilla] = useState<any[]>([]);
  const [competenciasEspecificas, setCompetenciasEspecificas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddGrupoModal, setShowAddGrupoModal] = useState(false);
  
  const [grupoForm, setGrupoForm] = useState({
    nombre_grupo: '', descripcion: '', orden: 1, competencias_ids: [] as number[]
  });

  useEffect(() => {
    cargarDatos();
  }, [asignaturaId, token]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      if (token) {
        // Cargar grupos plantilla (grado_id = None)
        const grupos = await configuracionService.obtenerGruposPlantilla(token, asignaturaId);
        setGruposPlantilla(grupos);
        
        // Cargar competencias específicas de esta asignatura
        const comps = await configuracionService.obtenerCompetenciasEspecificas(token, asignaturaId);
        setCompetenciasEspecificas(comps);
      }
    } catch (err) {
      console.error("Error al cargar plantilla", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (token) {
        await configuracionService.crearGrupoCompetencia(token, {
          ...grupoForm,
          peso_porcentaje: 25,
          asignatura_id: asignaturaId,
          // grado_id omitido deliberadamente para que sea nulo (plantilla)
        } as any);
        setShowAddGrupoModal(false);
        setGrupoForm({ nombre_grupo: '', descripcion: '', orden: 1, competencias_ids: [] });
        cargarDatos();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRemoveGrupo = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta plantilla de grupo? Afectará a los futuros grados a los que se asigne la materia.")) return;
    try {
      if (token) {
        await configuracionService.eliminarGrupoCompetencia(token, id);
        cargarDatos();
      }
    } catch (err) {
      alert("Error al eliminar grupo");
    }
  };

  const toggleCompetenciaSelection = (compId: number) => {
    setGrupoForm(prev => {
      const isSelected = prev.competencias_ids.includes(compId);
      return {
        ...prev,
        competencias_ids: isSelected 
          ? prev.competencias_ids.filter(id => id !== compId)
          : [...prev.competencias_ids, compId]
      };
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Layers size={20} /> Plantilla de Grupos: {asignaturaNombre}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Estos grupos se copiarán automáticamente cuando agregues <b>{asignaturaNombre}</b> a un grado.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>
        ) : (
          <div className="grupos-card">
            <div className="grupos-header">
              <h3 className="card-title">Grupos Configurables</h3>
              <button className="btn-primary btn-small" onClick={() => setShowAddGrupoModal(true)}>
                <Plus size={16} /> Nuevo Grupo
              </button>
            </div>
            
            {gruposPlantilla.length === 0 ? (
              <div className="empty-state-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <Bookmark size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
                <h4>No hay grupos definidos</h4>
                <p>Crea la estructura de grupos de competencias para esta asignatura.</p>
              </div>
            ) : (
              <div className="grupos-list">
                <div className="grupos-list-header">
                  <div>GRUPO</div>
                  <div>COMPETENCIAS INCLUIDAS</div>
                  <div style={{ textAlign: 'center' }}>ACCIONES</div>
                </div>
                {gruposPlantilla.map(g => (
                  <div key={g.id} className="grupo-row">
                    <div className="grupo-info">
                      <span className="grupo-nombre">{g.nombre_grupo}</span>
                      {g.descripcion && <span className="grupo-desc">{g.descripcion}</span>}
                    </div>
                    
                    <div className="grupo-competencias">
                      {g.competencias_especificas?.length > 0 ? (
                        g.competencias_especificas.map((ce: any) => (
                          <div key={ce.id} className="ce-pill">
                            <span className="ce-code">{ce.codigo}</span> - {ce.nombre}
                          </div>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Sin competencias vinculadas</span>
                      )}
                    </div>
                    
                    <div className="grupo-acciones" style={{ textAlign: 'center' }}>
                      <button className="btn-icon delete" onClick={() => handleRemoveGrupo(g.id)} title="Eliminar Grupo">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showAddGrupoModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3>Nuevo Grupo de Competencias</h3>
            <form onSubmit={handleAddGrupo} className="modal-form">
              <div className="form-group">
                <label>Nombre del Grupo</label>
                <input type="text" value={grupoForm.nombre_grupo} onChange={e => setGrupoForm({...grupoForm, nombre_grupo: e.target.value})} required placeholder="Ej. Grupo 1: Comunicativa" />
              </div>
              <div className="form-group">
                <label>Descripción (Opcional)</label>
                <input type="text" value={grupoForm.descripcion} onChange={e => setGrupoForm({...grupoForm, descripcion: e.target.value})} placeholder="Ej. Competencia Específica 1" />
              </div>
              <div className="form-group">
                <label>Orden de visualización</label>
                <input type="number" min="1" max="10" value={grupoForm.orden} onChange={e => setGrupoForm({...grupoForm, orden: Number(e.target.value)})} required />
              </div>
              
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Vincular Competencias Específicas</label>
                {competenciasEspecificas.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Esta asignatura no tiene competencias específicas creadas todavía.
                  </p>
                ) : (
                  <div className="competencias-checklist" style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', maxHeight: '200px', overflowY: 'auto' }}>
                    {competenciasEspecificas.map(ce => (
                      <label key={ce.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input 
                          type="checkbox" 
                          checked={grupoForm.competencias_ids.includes(ce.id)}
                          onChange={() => toggleCompetenciaSelection(ce.id)}
                        />
                        <span><strong>{ce.codigo}</strong> - {ce.nombre}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="modal-actions" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddGrupoModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Grupo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
