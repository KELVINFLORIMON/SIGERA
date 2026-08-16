import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { institucionalService } from '../../services/institucionalService';
import type { CentroEducativo } from '../../services/institucionalService';
import { DashboardLayout } from '../layout/DashboardLayout';
import { CentroEducativoModal } from './CentroEducativoModal';
import { School, Search, Edit, Plus, Mail, Phone, Clock, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import '../estudiantes/Estudiantes.css';

export const CentroEducativoView: React.FC = () => {
  const { user } = useAuth();
  const [centros, setCentros] = useState<CentroEducativo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCentro, setSelectedCentro] = useState<CentroEducativo | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCentros = async () => {
    try {
      setLoading(true);
      const data = await institucionalService.getCentros();
      setCentros(data);
      setError(null);
    } catch (err: any) {
      setError('Error al cargar la lista de centros educativos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentros();
  }, []);

  const handleOpenModal = (centro?: CentroEducativo) => {
    setSelectedCentro(centro);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    await fetchCentros();
    setIsModalOpen(false);
  };

  const centrosFiltrados = centros.filter(c => 
    `${c.nombre} ${c.codigo_minerd}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Gestión de Centros Educativos">
      <div className="estudiantes-container fade-in">
        <header className="module-header">
          <div>
            <h1>Centros Educativos</h1>
            <p>Administración y configuración de los planteles registrados.</p>
          </div>
          {user?.es_superusuario && (
            <button className="btn-primary" onClick={() => handleOpenModal()}>
              <Plus size={20} />
              <span>Nuevo Centro</span>
            </button>
          )}
        </header>

        {error && <div className="error-banner">{error}</div>}

        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o código MINERD..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Cargando centros educativos...
            </div>
          ) : centrosFiltrados.length === 0 ? (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
              <School size={48} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto 1rem', display: 'block' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No hay centros educativos registrados.</p>
              {user?.es_superusuario && (
                <button className="btn-primary" style={{ margin: '1.5rem auto 0' }} onClick={() => handleOpenModal()}>
                  Configurar Primer Plantel
                </button>
              )}
            </div>
          ) : (
            centrosFiltrados.map((centro) => (
              <div key={centro.id} className="glass-panel fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.4rem', lineHeight: '1.3' }}>{centro.nombre}</h3>
                    <span className="badge-rne" style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                      Cód: {centro.codigo_minerd}
                    </span>
                  </div>
                  <button 
                    className="btn-icon" 
                    title="Editar centro" 
                    disabled={!user?.es_superusuario}
                    onClick={() => handleOpenModal(centro)}
                    style={{ background: 'rgba(255,255,255,0.05)', padding: '0.6rem', borderRadius: '10px', color: '#60a5fa' }}
                  >
                    <Edit size={18} />
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <Clock size={16} color="#94a3b8" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{centro.tanda_principal || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <BookOpen size={16} color="#94a3b8" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{centro.modalidad === 'ACADEMICA' ? 'Académica' : centro.modalidad || 'N/A'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <Mail size={16} color="#94a3b8" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{centro.correo || 'Sin correo asignado'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <Phone size={16} color="#94a3b8" />
                    <span>{centro.telefono || 'Sin teléfono asignado'}</span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                   {centro.es_activo ? (
                     <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                       <CheckCircle size={14} /> Activo
                     </span>
                   ) : (
                     <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                       <XCircle size={14} /> Inactivo
                     </span>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <CentroEducativoModal
          centro={selectedCentro}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </DashboardLayout>
  );
};
