import React, { useState, useEffect } from 'react';
import { configuracionService } from '../../services/configuracion';
import type { AsignaturaPayload } from '../../services/configuracion';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Plus, Trash2, BookOpen, Download, Layers } from 'lucide-react';
import { AsignaturaPlantillaModal } from './AsignaturaPlantillaModal';
import { createFormatHandler } from '../../utils/inputFormat';
import './AsignaturasView.css';

interface Asignatura extends AsignaturaPayload {
  id: number;
}

export const AsignaturasView: React.FC = () => {
  const { token, activeCentroId } = useAuth();
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [showPlantillaModal, setShowPlantillaModal] = useState(false);
  const [selectedAsignatura, setSelectedAsignatura] = useState<Asignatura | null>(null);

  const [formData, setFormData] = useState<AsignaturaPayload>({
    codigo: '', nombre: '', abreviatura: '', es_activa: true, orden: 1
  });

  useEffect(() => {
    if (token && activeCentroId) {
      cargarAsignaturas();
    }
  }, [token, activeCentroId]);

  const cargarAsignaturas = async () => {
    try {
      setLoading(true);
      setError('');
      if (token) {
        const data = await configuracionService.obtenerAsignaturas(token);
        setAsignaturas(data);
      }
    } catch (err: any) {
      setError('Error al cargar asignaturas.');
    } finally {
      setLoading(false);
    }
  };


  const handleSeed = async () => {
    if (!window.confirm('Esto insertará automáticamente las asignaturas de la Modalidad Académica. ¿Proceder?')) return;
    try {
      if (token) {
        await configuracionService.seedAsignaturasMinerd(token);
        cargarAsignaturas();
      }
    } catch (err: any) {
      alert('Error al inicializar asignaturas.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta asignatura?')) return;
    try {
      if (token) {
        await configuracionService.eliminarAsignatura(token, id);
        cargarAsignaturas();
      }
    } catch (err: any) {
      alert('No se pudo eliminar la asignatura. Es posible que tenga registros asociados.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (token) {
        await configuracionService.crearAsignatura(token, formData);
        setShowModal(false);
        setFormData({ codigo: '', nombre: '', abreviatura: '', es_activa: true, orden: 1 });
        cargarAsignaturas();
      }
    } catch (err: any) {
      alert('Error al crear la asignatura. Verifica que el código no esté en uso.');
    }
  };

  return (
    <DashboardLayout title="Catálogo de Asignaturas">
      <div className="asignaturas-container">
        <div className="header-actions">
          <h2 className="title"><BookOpen size={24} /> Catálogo de Asignaturas</h2>
          <div className="actions-group">
            <button className="btn-secondary" onClick={handleSeed}>
              <Download size={18} /> Sembrar MINERD
            </button>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} /> Nueva Asignatura
            </button>
          </div>
        </div>

      {!activeCentroId && (
        <div className="error-message">No hay un centro educativo activo. Por favor, selecciona un centro.</div>
      )}
      {error && <div className="error-message">{error}</div>}

      <div className="table-responsive">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Código</th>
              <th>Nombre Completo</th>
              <th>Abreviatura</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Cargando...</td></tr>
            ) : asignaturas.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No hay asignaturas registradas. Haz clic en 'Sembrar MINERD' para iniciar.</td></tr>
            ) : (
              asignaturas.map(a => (
                <tr key={a.id}>
                  <td>{a.orden}</td>
                  <td><span className="badge">{a.codigo}</span></td>
                  <td style={{ fontWeight: 600 }}>{a.nombre}</td>
                  <td>{a.abreviatura}</td>
                  <td>{a.es_activa ? <span className="status-active">Activa</span> : <span className="status-inactive">Inactiva</span>}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-icon primary" 
                      onClick={() => {
                        setSelectedAsignatura(a);
                        setShowPlantillaModal(true);
                      }} 
                      title="Configurar Plantilla de Grupos"
                    >
                      <Layers size={16} />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(a.id)} title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nueva Asignatura</h3>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Código</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={createFormatHandler('codigo', (val) => setFormData({...formData, codigo: val}))}
                  required
                  placeholder="Ej. MAT"
                  maxLength={20}
                />
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={createFormatHandler('nombre', (val) => setFormData({...formData, nombre: val}))}
                  required
                  placeholder="Ej. Matemáticas"
                />
              </div>
              <div className="form-group">
                <label>Abreviatura</label>
                <input
                  type="text"
                  value={formData.abreviatura || ''}
                  onChange={createFormatHandler('abreviatura', (val) => setFormData({...formData, abreviatura: val}))}
                  placeholder="Ej. Mat."
                  maxLength={15}
                />
              </div>
              <div className="form-group">
                <label>Orden en Boletín</label>
                <input type="number" min="1" value={formData.orden} onChange={e => setFormData({...formData, orden: parseInt(e.target.value)})} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
        )}

      {showPlantillaModal && selectedAsignatura && (
        <AsignaturaPlantillaModal
          asignaturaId={selectedAsignatura.id}
          asignaturaNombre={selectedAsignatura.nombre}
          onClose={() => {
            setShowPlantillaModal(false);
            setSelectedAsignatura(null);
          }}
        />
      )}
      </div>
    </DashboardLayout>
  );
};
