import React, { useState, useEffect } from 'react';
import { createFormatHandler } from '../../utils/inputFormat';
import { institucionalService } from '../../services/institucionalService';
import type { AnioEscolar, PeriodoAcademico } from '../../services/institucionalService';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Plus, CheckCircle, Edit, Calendar, BookOpen, Trash2, Archive } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AnioEscolarView.css';

export const AnioEscolarView: React.FC<{ 
  isWizard?: boolean; 
  onConfigurar?: (id: number) => void;
  selectedAnioId?: number | null;
}> = ({ isWizard = false, onConfigurar, selectedAnioId }) => {
  const [anios, setAnios] = useState<AnioEscolar[]>([]);
  const [centros, setCentros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const { activeCentroId } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Edit states
  const [editingAnio, setEditingAnio] = useState<AnioEscolar | null>(null);
  const [editPeriodos, setEditPeriodos] = useState<PeriodoAcademico[]>([]);

  const fetchAniosYCentros = async () => {
    try {
      setLoading(true);
      const dataAnios = await institucionalService.getAniosEscolares();
      setAnios(dataAnios);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar años escolares');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAniosYCentros();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      if (!activeCentroId) {
        setError("Debe tener un Centro Educativo activo seleccionado.");
        return;
      }
      
      await institucionalService.createAnioEscolar({
        centro_id: activeCentroId,
        descripcion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estado: 'CONFIGURACION',
        es_activo: true,
      });
      setShowForm(false);
      setDescripcion('');
      setFechaInicio('');
      setFechaFin('');
      fetchAniosYCentros();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear año escolar');
    }
  };

  const handleActivar = async (id: number) => {
    if (!window.confirm("¿Está seguro de activar este Año Escolar? Se convertirá en el año lectivo en curso.")) return;
    try {
      await institucionalService.updateAnioEscolar(id, { estado: 'ACTIVO' });
      fetchAniosYCentros();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al activar el año escolar');
    }
  };

  const handleCerrar = async (id: number) => {
    if (!window.confirm("¿Está seguro de cerrar este Año Escolar? Ya no será el año en curso y pasará al histórico.")) return;
    try {
      await institucionalService.updateAnioEscolar(id, { estado: 'CERRADO' });
      fetchAniosYCentros();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cerrar el año escolar');
    }
  };

  const handleEditClick = async (anio: AnioEscolar) => {
    try {
      setLoading(true);
      const periodos = await institucionalService.getPeriodosByAnio(anio.id);
      setEditingAnio(anio);
      setEditPeriodos(periodos);
    } catch(err: any) {
      setError('Error al cargar los periodos del año escolar.');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodoChange = (index: number, field: string, value: string) => {
    const updated = [...editPeriodos];
    updated[index] = { ...updated[index], [field]: value };
    setEditPeriodos(updated);
  };

  const savePeriodos = async () => {
    try {
      setError(null);
      for (const p of editPeriodos) {
        await institucionalService.updatePeriodo(p.id, {
          fecha_inicio: p.fecha_inicio,
          fecha_fin: p.fecha_fin
        });
      }
      setEditingAnio(null);
      fetchAniosYCentros();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al actualizar los periodos');
    }
  };

  const handleDeleteAnio = async (id: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar este Año Escolar? Esta acción no se puede deshacer.")) return;
    try {
      setLoading(true);
      setError(null);
      await institucionalService.deleteAnioEscolar(id);
      setEditingAnio(null);
      fetchAniosYCentros();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al eliminar el año escolar. Es posible que tenga grados configurados.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
      <div className="anios-container" style={{ width: '100%', maxWidth: '100%' }}>
        <div className="header-actions">
          <h2 className="title"><Calendar size={24} /> Años Escolares (Proceso 1)</h2>
          <div className="actions-group">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={18} /> Nuevo Año Escolar
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Crear Nuevo Año Escolar</h3>
              <form onSubmit={handleCreate} className="modal-form">
                <div className="form-group">
                <label>Descripción (Ej. 2026-2027)</label>
                <input
                   type="text"
                   required
                   value={descripcion}
                   onChange={createFormatHandler('descripcion', setDescripcion)}
                 />
              </div>
              <div className="form-group">
                <label>Fecha de Inicio</label>
                <input
                  type="date"
                  required
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Fecha de Fin</label>
                <input
                  type="date"
                  required
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '1rem', borderRadius: '8px', color: 'var(--color-primary-light)', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <Calendar size={18} style={{ marginTop: '0.1rem' }} />
                <span><strong>Nota:</strong> Al crear el año escolar, el sistema generará automáticamente los 4 periodos académicos basándose en estas fechas. Podrás ajustarlos luego.</span>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-submit">Guardar Año Escolar</button>
              </div>
            </form>
          </div>
        </div>
      )}

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>Cargando años escolares...</td>
                </tr>
              ) : anios.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>No hay años escolares registrados.</td>
                </tr>
              ) : (
                anios.map((anio) => (
                  <tr key={anio.id}>
                    <td><span className="badge">{anio.descripcion}</span></td>
                    <td>{anio.fecha_inicio}</td>
                    <td>{anio.fecha_fin}</td>
                    <td>
                      <span className={anio.estado === 'ACTIVO' ? 'status-active' : 'status-inactive'}>
                        {anio.estado}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {isWizard && onConfigurar && (
                          <button 
                            className={`btn-icon ${selectedAnioId === anio.id ? 'btn-active' : ''}`}
                            style={{
                              background: selectedAnioId === anio.id ? '#3b82f6' : '#e0e7ff',
                              color: selectedAnioId === anio.id ? 'white' : '#4f46e5',
                              padding: '4px 12px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={() => onConfigurar(anio.id)}
                            title="Continuar configuración para este año"
                          >
                            Configurar
                          </button>
                        )}
                        {(anio.estado === 'CONFIGURACION' || anio.estado === 'CERRADO') && (
                          <button 
                            onClick={() => handleActivar(anio.id)}
                            className="btn-icon"
                            style={{ color: 'var(--color-success)' }}
                            title={anio.estado === 'CERRADO' ? "Reactivar Año Escolar" : "Activar Año Escolar"}
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {anio.estado === 'ACTIVO' && (
                          <button 
                            onClick={() => handleCerrar(anio.id)}
                            className="btn-icon"
                            style={{ color: '#d97706' }}
                            title="Cerrar Año Escolar"
                          >
                            <Archive size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleEditClick(anio)}
                          className="btn-icon"
                          style={{ color: 'var(--color-primary-light)' }}
                          title="Editar Períodos"
                        >
                          <Edit size={18} />
                        </button>
                        {anio.estado === 'CONFIGURACION' && (
                          <button 
                            onClick={() => handleDeleteAnio(anio.id)}
                            className="btn-icon"
                            style={{ color: 'var(--color-danger)' }}
                            title="Eliminar Año Escolar"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      {/* Edit Modal / Section */}
      {editingAnio && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Editar Periodos ({editingAnio.descripcion})</h3>
              <button 
                onClick={() => handleDeleteAnio(editingAnio.id)} 
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.85rem' }}
                title="Eliminar Año Escolar"
              >
                <Trash2 size={16} /> Eliminar Año
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {editPeriodos.map((p, index) => (
                <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span className="badge">{p.nombre}</span>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Inicio</label>
                    <input 
                      type="date" 
                      value={p.fecha_inicio} 
                      onChange={(e) => handlePeriodoChange(index, 'fecha_inicio', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Fin</label>
                    <input 
                      type="date" 
                      value={p.fecha_fin} 
                      onChange={(e) => handlePeriodoChange(index, 'fecha_fin', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              {editPeriodos.length === 0 && (
                <p style={{ color: 'var(--text-muted)' }}>No hay periodos generados para este año.</p>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={() => setEditingAnio(null)} className="btn-cancel">Cancelar</button>
              <button onClick={savePeriodos} className="btn-submit">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      </div>
  );

  if (isWizard) return content;
  return <DashboardLayout title="Gestión de Años Escolares">{content}</DashboardLayout>;
};
