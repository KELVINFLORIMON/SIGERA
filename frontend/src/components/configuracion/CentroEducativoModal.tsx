import React, { useState, useEffect } from 'react';
import { createFormatHandler } from '../../utils/inputFormat';
import { institucionalService } from '../../services/institucionalService';
import type { CentroEducativo, Regional, Distrito } from '../../services/institucionalService';
import { X, Save, Building, MapPin, School, Trash2 } from 'lucide-react';
import '../estudiantes/Estudiantes.css';

interface Props {
  centro?: CentroEducativo;
  onClose: () => void;
  onSave: () => void;
}

export const CentroEducativoModal: React.FC<Props> = ({ centro, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [regionales, setRegionales] = useState<Regional[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);

  // Regional y Distrito
  const [regionalId, setRegionalId] = useState<number | ''>('');
  const [distritoId, setDistritoId] = useState<number | ''>('');

  // Centro Educativo
  const [centroCode, setCentroCode] = useState(centro?.codigo_minerd || '');
  const [centroName, setCentroName] = useState(centro?.nombre || '');
  const [direccion, setDireccion] = useState(centro?.direccion || '');
  const [telefono, setTelefono] = useState(centro?.telefono || '');
  const [correo, setCorreo] = useState(centro?.correo || '');
  const [tandaPrincipal, setTandaPrincipal] = useState(centro?.tanda_principal || 'JEE');
  const [modalidad, setModalidad] = useState(centro?.modalidad || 'ACADEMICA');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regs, dists] = await Promise.all([
          institucionalService.getRegionales(),
          institucionalService.getDistritos()
        ]);
        setRegionales(regs);
        setDistritos(dists);

        if (centro) {
          // Pre-seleccionar la regional y el distrito correcto
          setDistritoId(centro.distrito_id);
          const dist = dists.find(d => d.id === centro.distrito_id);
          if (dist) setRegionalId(dist.regional_id);
        } else if (regs.length > 0) {
           setRegionalId(regs[0].id);
        }
      } catch (err: any) {
        setError('Error al cargar datos institucionales');
      }
    };
    fetchData();
  }, [centro]);

  // Distritos filtrados por la regional seleccionada
  const distritosFiltrados = distritos.filter(d => d.regional_id === regionalId);
  
  // Seleccionar automáticamente un distrito cuando cambia la regional
  useEffect(() => {
    if (!centro && regionalId && distritosFiltrados.length > 0) {
      if (!distritosFiltrados.find(d => d.id === distritoId)) {
        setDistritoId(distritosFiltrados[0].id);
      }
    }
  }, [regionalId, distritosFiltrados, centro, distritoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!distritoId) {
      setError('Debe seleccionar un distrito educativo.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payloadCentro = {
        codigo_minerd: centroCode,
        nombre: centroName,
        direccion: direccion || undefined,
        telefono: telefono || undefined,
        correo: correo || undefined, 
        tanda_principal: tandaPrincipal,
        modalidad: modalidad,
        distrito_id: Number(distritoId)
      };

      if (centro) {
        await institucionalService.updateCentro(centro.id, payloadCentro);
      } else {
        await institucionalService.createCentro({
          ...payloadCentro,
          distrito_id: Number(distritoId),
          es_activo: true
        });
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar el plantel.');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!centro) return;
    setDeletingId(centro.id);
    try {
      await institucionalService.deleteCentro(centro.id);
      setShowDeleteConfirm(false);
      onSave(); // Refrescar lista y cerrar
    } catch (err: any) {
      setShowDeleteConfirm(false); // Cerramos el modal de confirmar para que vea el error
      const errorMsg = err.response?.data?.detail || err.message || 'Error al eliminar el centro educativo';
      setError(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="modal-overlay-premium fade-in">
      <div className="modal-content-premium slide-up">
        <header className="modal-header-premium">
          <h2>{centro ? 'Editar Centro Educativo' : 'Nuevo Centro Educativo'}</h2>
          <button className="btn-icon" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </header>

        {error && <div className="error-banner" style={{ margin: '1rem 2rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="modal-body-premium">
          <div className="form-section-premium">
            <h3 className="form-section-title">
              <MapPin size={18} /> Configuración Institucional
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label-premium">Regional Educativa</label>
                <select 
                  value={regionalId} 
                  onChange={e => setRegionalId(Number(e.target.value))} 
                  className="input-premium"
                  required
                >
                  <option value="" disabled>Seleccione una regional...</option>
                  {regionales.map(r => (
                    <option key={r.id} value={r.id}>{r.codigo} - {r.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-premium">Distrito Educativo</label>
                <select 
                  value={distritoId} 
                  onChange={e => setDistritoId(Number(e.target.value))} 
                  className="input-premium"
                  required
                >
                  <option value="" disabled>Seleccione un distrito...</option>
                  {distritosFiltrados.map(d => (
                    <option key={d.id} value={d.id}>{d.codigo} - {d.nombre}</option>
                  ))}
                </select>
                {distritosFiltrados.length === 0 && regionalId !== '' && (
                  <span style={{ color: 'var(--color-warning)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                    Esta regional no tiene distritos registrados.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section-premium">
            <h3 className="form-section-title">
              <School size={18} /> Datos del Plantel
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label className="label-premium">Código MINERD</label>
                  <input type="text" required value={centroCode} onChange={createFormatHandler('codigo', setCentroCode)} className="input-premium" placeholder="Ej. 12345678" />
                </div>
                <div>
                  <label className="label-premium">Nombre del Centro</label>
                  <input type="text" required value={centroName} onChange={createFormatHandler('nombre', setCentroName)} className="input-premium" placeholder="Ej. Liceo de Excelencia" />
                </div>
              </div>

              <div>
                <label className="label-premium">Dirección</label>
                <input type="text" value={direccion} onChange={createFormatHandler('descripcion', setDireccion)} className="input-premium" placeholder="Opcional" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label-premium">Teléfono</label>
                  <input type="text" value={telefono} onChange={createFormatHandler('telefono', setTelefono)} className="input-premium" placeholder="Opcional" />
                </div>
                <div>
                  <label className="label-premium">Correo Electrónico</label>
                  <input type="email" value={correo} onChange={createFormatHandler('email', setCorreo)} className="input-premium" placeholder="Opcional" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label-premium">Tanda Principal</label>
                  <select value={tandaPrincipal} onChange={e => setTandaPrincipal(e.target.value)} className="input-premium">
                    <option value="MATUTINA">Matutina</option>
                    <option value="VESPERTINA">Vespertina</option>
                    <option value="NOCTURNA">Nocturna</option>
                    <option value="SABATINA">Sabatina</option>
                    <option value="JEE">Jornada Escolar Extendida (JEE)</option>
                  </select>
                </div>
                <div>
                  <label className="label-premium">Modalidad</label>
                  <select value={modalidad} onChange={e => setModalidad(e.target.value)} className="input-premium">
                    <option value="ACADEMICA">Académica</option>
                    <option value="TECNICO_PROFESIONAL">Técnico Profesional</option>
                    <option value="ARTE">Artes</option>
                    <option value="ADULTOS">Adultos (PREPARA)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          </div>

          <div className="modal-footer-premium" style={{ display: 'flex', justifyContent: centro ? 'space-between' : 'flex-end' }}>
            {centro && (
              <button 
                type="button" 
                className="btn-icon delete" 
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', background: 'transparent' }}
              >
                <Trash2 size={18} />
                Eliminar Centro
              </button>
            )}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.2)' }}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                <Save size={18} />
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Confirmación de Eliminación ── */}
      {showDeleteConfirm && (
        <div className="modal-overlay-premium fade-in" style={{ zIndex: 1100 }}>
          <div className="confirm-modal slide-up">
            <div className="confirm-icon danger"><Trash2 size={28} /></div>
            <h3>¿Eliminar Centro Educativo?</h3>
            <p>
              Esta acción eliminará a <strong>{centro?.nombre}</strong> del sistema.<br />
              Se perderá el acceso a los datos vinculados.
            </p>
            <div className="confirm-actions">
              <button type="button" className="btn-cancel-confirm" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleEliminar}
                disabled={deletingId === centro?.id}
              >
                <Trash2 size={16} />
                {deletingId === centro?.id ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
