import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usuariosService } from '../../services/usuarios';
import { institucionalService } from '../../services/institucionalService';
import type { CentroEducativo } from '../../services/institucionalService';
import { X, Trash2 } from 'lucide-react';
import { createFormatHandler } from '../../utils/inputFormat';

interface Props {
  usuarioToEdit?: any;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export const UsuarioModal: React.FC<Props> = ({ usuarioToEdit, onClose, onSave, onDelete }) => {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    rol_nombre: 'DOCENTE' as 'ADMINISTRADOR' | 'DOCENTE' | 'COORDINADOR' | 'DIRECTOR',
    cedula: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    sexo: 'M' as 'M' | 'F',
    correo: '',
    telefono: '',
    titulo_academico: '',
    especialidad: '',
    centro_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [centros, setCentros] = useState<CentroEducativo[]>([]);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (usuarioToEdit) {
      setFormData({
        rol_nombre: usuarioToEdit.roles?.[0] || 'DOCENTE',
        cedula: usuarioToEdit.cedula || '',
        primer_nombre: usuarioToEdit.nombre_completo.split(' ')[0] || '',
        segundo_nombre: '',
        primer_apellido: usuarioToEdit.nombre_completo.split(' ').slice(1).join(' ') || '',
        segundo_apellido: '',
        sexo: 'M',
        correo: usuarioToEdit.correo || '',
        telefono: usuarioToEdit.telefono || '',
        titulo_academico: '',
        especialidad: usuarioToEdit.especialidad || '',
        centro_id: user?.es_superusuario ? '' : ''
      });
    }
  }, [usuarioToEdit, user]);

  useEffect(() => {
    if (user?.es_superusuario) {
      institucionalService.getCentros()
        .then(data => setCentros(data))
        .catch(err => console.error('Error cargando centros', err));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (user?.es_superusuario && !formData.centro_id) {
        throw new Error('Debe seleccionar un centro educativo');
      }

      const payload = {
        ...formData,
        centro_id: user?.es_superusuario ? Number(formData.centro_id) : (user?.centro_id || undefined),
        segundo_nombre: formData.segundo_nombre || undefined,
        segundo_apellido: formData.segundo_apellido || undefined,
        telefono: formData.telefono || undefined,
        titulo_academico: formData.titulo_academico || undefined,
        especialidad: formData.especialidad || undefined,
      };
      
      if (usuarioToEdit) {
        await usuariosService.actualizarUsuario(token, usuarioToEdit.id, payload);
      } else {
        await usuariosService.crearUsuario(token, payload);
      }
      onSave();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al guardar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!token || !usuarioToEdit) return;
    try {
      setDeleting(true);
      await usuariosService.eliminarUsuario(token, usuarioToEdit.id);
      if (onDelete) onDelete();
    } catch (err: any) {
      setError(`Error al eliminar usuario: ${err.message}`);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const setField = (field: string) => (val: string) =>
    setFormData(prev => ({ ...prev, [field]: val }));

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <header className="modal-header">
          <h2>{usuarioToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-banner">{error}</div>}

          <div className="form-grid">
            {user?.es_superusuario && (
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Centro Educativo *</label>
                <select name="centro_id" value={formData.centro_id} onChange={handleSelectChange} required>
                  <option value="">Seleccione un centro</option>
                  {centros.map(c => (
                    <option key={c.id} value={c.id}>{c.codigo_minerd} - {c.nombre}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Rol de Usuario *</label>
              <select name="rol_nombre" value={formData.rol_nombre} onChange={handleSelectChange} required>
                {user?.es_superusuario && (
                  <option value="ADMINISTRADOR">Administrador de Centro</option>
                )}
                <option value="COORDINADOR">Coordinador</option>
                <option value="DIRECTOR">Director</option>
                <option value="DOCENTE">Docente</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Cédula *</label>
              <input type="text" name="cedula" required value={formData.cedula}
                onChange={createFormatHandler('cedula', setField('cedula'))}
                placeholder="0010000000" maxLength={11} />
            </div>
            
            <div className="form-group">
              <label>Correo Electrónico (Usuario) *</label>
              <input type="email" name="correo" required value={formData.correo}
                onChange={createFormatHandler('email', setField('correo'))}
                placeholder="docente@ejemplo.com" />
            </div>

            <div className="form-group">
              <label>Primer Nombre *</label>
              <input type="text" name="primer_nombre" required value={formData.primer_nombre}
                onChange={createFormatHandler('nombre', setField('primer_nombre'))} />
            </div>
            
            <div className="form-group">
              <label>Segundo Nombre</label>
              <input type="text" name="segundo_nombre" value={formData.segundo_nombre}
                onChange={createFormatHandler('nombre', setField('segundo_nombre'))} />
            </div>
            
            <div className="form-group">
              <label>Primer Apellido *</label>
              <input type="text" name="primer_apellido" required value={formData.primer_apellido}
                onChange={createFormatHandler('nombre', setField('primer_apellido'))} />
            </div>
            
            <div className="form-group">
              <label>Segundo Apellido</label>
              <input type="text" name="segundo_apellido" value={formData.segundo_apellido}
                onChange={createFormatHandler('nombre', setField('segundo_apellido'))} />
            </div>

            <div className="form-group">
              <label>Sexo *</label>
              <select name="sexo" value={formData.sexo} onChange={handleSelectChange} required>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Teléfono</label>
              <input type="text" name="telefono" value={formData.telefono}
                onChange={createFormatHandler('telefono', setField('telefono'))} />
            </div>

            <div className="form-group">
              <label>Título Académico</label>
              <input type="text" name="titulo_academico" value={formData.titulo_academico}
                onChange={createFormatHandler('nombre', setField('titulo_academico'))}
                placeholder="Lic. en Educación..." />
            </div>

            <div className="form-group">
              <label>Especialidad</label>
              <input type="text" name="especialidad" value={formData.especialidad}
                onChange={createFormatHandler('nombre', setField('especialidad'))}
                placeholder="Matemáticas, Letras..." />
            </div>
          </div>
          
          {!usuarioToEdit && (
            <div className="info-banner" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--color-primary)' }}>
              <strong>Nota de Seguridad:</strong> La contraseña inicial de este usuario será generada automáticamente usando la inicial de su nombre, apellido y los últimos 6 dígitos de su cédula.
            </div>
          )}

          <div className="modal-actions" style={{ display: 'flex', justifyContent: usuarioToEdit && (user?.es_superusuario || (user?.roles?.includes('ADMINISTRADOR') && !usuarioToEdit?.roles?.includes('ADMINISTRADOR'))) ? 'space-between' : 'flex-end', width: '100%' }}>
            {usuarioToEdit && (user?.es_superusuario || (user?.roles?.includes('ADMINISTRADOR') && !usuarioToEdit?.roles?.includes('ADMINISTRADOR'))) && (
              <button type="button" className="btn-icon delete" onClick={() => setShowDeleteConfirm(true)} title="Eliminar usuario">
                <Trash2 size={20} />
              </button>
            )}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : (usuarioToEdit ? 'Actualizar Usuario' : 'Guardar Usuario')}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {showDeleteConfirm && (
        <div className="modal-overlay-premium fade-in" style={{ zIndex: 10000 }}>
          <div className="confirm-modal slide-up">
            <div className="confirm-icon danger"><Trash2 size={28} /></div>
            <h3>¿Eliminar usuario?</h3>
            <p>
              Esta acción desactivará al usuario <strong>{usuarioToEdit?.nombre_completo}</strong>.<br />
              El usuario ya no podrá iniciar sesión en este centro.
            </p>
            <div className="confirm-actions">
              <button className="btn-cancel-confirm" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
              <button
                className="btn-danger-confirm"
                onClick={handleEliminar}
                disabled={deleting}
              >
                <Trash2 size={16} />
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
