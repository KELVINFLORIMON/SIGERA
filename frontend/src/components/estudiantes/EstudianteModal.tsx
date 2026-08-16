import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { estudiantesService } from '../../services/estudiantes';
import { X } from 'lucide-react';
import { createFormatHandler, formatInput } from '../../utils/inputFormat';

interface Props {
  onClose: () => void;
  onSave: () => void;
  secciones: any[];
}

export const EstudianteModal: React.FC<Props> = ({ onClose, onSave, secciones }) => {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    rne: '',
    cedula: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    sexo: 'M' as 'M' | 'F',
    fecha_nacimiento: '',
    correo: '',
    telefono: '',
    seccion_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await estudiantesService.crearEstudiante(token, {
        ...formData,
        centro_id: user.centro_id || 1, // Defaulting to 1 for demo purposes
        seccion_id: formData.seccion_id ? parseInt(formData.seccion_id) : undefined,
        anio_escolar_id: formData.seccion_id ? 1 : undefined, // Default to 1 (2023-2024)
        cedula: formData.cedula || undefined,
        segundo_nombre: formData.segundo_nombre || undefined,
        segundo_apellido: formData.segundo_apellido || undefined,
        correo: formData.correo || undefined,
        telefono: formData.telefono || undefined,
      });
      onSave();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const setField = (field: string) => (val: string) =>
    setFormData(prev => ({ ...prev, [field]: val }));

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay-premium fade-in">
      <div className="modal-content-premium slide-up">
        <header className="modal-header-premium">
          <h2>Nuevo Estudiante</h2>
          <button className="btn-icon" onClick={onClose}><X size={24} /></button>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {error && <div className="error-banner" style={{ margin: '1rem 2rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>{error}</div>}

          <div className="modal-body-premium">
            <div className="form-section-premium">
              <h3 className="form-section-title">Datos Personales</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="label-premium">RNE *</label>
                  <input type="text" name="rne" required value={formData.rne}
                    onChange={createFormatHandler('codigo', setField('rne'))}
                    placeholder="AB12345678" className="input-premium" maxLength={20} />
                </div>
                <div>
                  <label className="label-premium">Cédula</label>
                  <input type="text" name="cedula" value={formData.cedula}
                    onChange={createFormatHandler('cedula', setField('cedula'))}
                    placeholder="0010000000" className="input-premium" maxLength={13} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="label-premium">Primer Nombre *</label>
                  <input type="text" name="primer_nombre" required value={formData.primer_nombre}
                    onChange={createFormatHandler('nombre', setField('primer_nombre'))}
                    className="input-premium" />
                </div>
                <div>
                  <label className="label-premium">Segundo Nombre</label>
                  <input type="text" name="segundo_nombre" value={formData.segundo_nombre}
                    onChange={createFormatHandler('nombre', setField('segundo_nombre'))}
                    className="input-premium" />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="label-premium">Primer Apellido *</label>
                  <input type="text" name="primer_apellido" required value={formData.primer_apellido}
                    onChange={createFormatHandler('nombre', setField('primer_apellido'))}
                    className="input-premium" />
                </div>
                <div>
                  <label className="label-premium">Segundo Apellido</label>
                  <input type="text" name="segundo_apellido" value={formData.segundo_apellido}
                    onChange={createFormatHandler('nombre', setField('segundo_apellido'))}
                    className="input-premium" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label-premium">Sexo *</label>
                  <select name="sexo" value={formData.sexo} onChange={handleSelectChange} required className="input-premium">
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
                <div>
                  <label className="label-premium">Fecha de Nacimiento *</label>
                  <input type="date" name="fecha_nacimiento" required value={formData.fecha_nacimiento} onChange={(e) => setFormData(prev => ({ ...prev, fecha_nacimiento: e.target.value }))} className="input-premium" />
                </div>
              </div>
            </div>

            <div className="form-section-premium">
              <h3 className="form-section-title">Datos de Contacto y Asignación</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="label-premium">Correo Electrónico</label>
                  <input type="email" name="correo" value={formData.correo}
                    onChange={createFormatHandler('email', setField('correo'))}
                    className="input-premium" />
                </div>
                <div>
                  <label className="label-premium">Teléfono</label>
                  <input type="text" name="telefono" value={formData.telefono}
                    onChange={createFormatHandler('telefono', setField('telefono'))}
                    className="input-premium" />
                </div>
              </div>

              <div>
                <label className="label-premium">Asignar a Sección</label>
                <select name="seccion_id" value={formData.seccion_id} onChange={handleSelectChange} className="input-premium">
                  <option value="">-- No asignar por ahora --</option>
                  {secciones.map(sec => (
                    <option key={sec.id} value={sec.id}>
                      {sec.grado.nombre} Grado - Sección {sec.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer-premium">
            <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.2)' }}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
              {loading ? 'Guardando...' : 'Guardar Estudiante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
