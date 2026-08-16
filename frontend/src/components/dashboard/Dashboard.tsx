import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layout/DashboardLayout';
import { docentesService, type AsignacionDocente } from '../../services/docentes';
import { institucionalService } from '../../services/institucionalService';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export const Dashboard = () => {
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAsignaciones = async () => {
      try {
        if (!token) return;
        // Si el usuario es administrador, es posible que no tenga perfil de docente.
        // No forzamos la carga para que no dé el error 404/400.
        if (user?.es_superusuario) {
          setLoading(false);
          return;
        }

        const [data, anios] = await Promise.all([
          docentesService.obtenerMisAsignaciones(token),
          institucionalService.getAniosEscolares()
        ]);

        const anioActivo = anios.find((a: any) => a.estado === 'ACTIVO');
        
        if (anioActivo) {
          setAsignaciones(data.filter(a => a.anio_escolar_id === anioActivo.id));
        } else {
          setAsignaciones([]); // Si no hay año activo, no mostramos nada
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar las asignaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchAsignaciones();
  }, [token, user]);

  const handleCardClick = (seccionId: number, asignaturaId: number) => {
    navigate(`/calificaciones/${seccionId}/${asignaturaId}`);
  };

  if (user?.es_superusuario && asignaciones.length === 0) {
    return (
      <DashboardLayout title="Panel de Administración">
        <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginTop: '2rem' }}>
          <h2 style={{ color: 'var(--color-primary-light)', fontSize: '1.5rem', marginBottom: '1rem' }}>¡Bienvenido, Administrador!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Estás en el entorno administrativo de SIGERA. Utiliza el menú lateral izquierdo para gestionar Usuarios, Asignaturas, Secciones y la Carga Académica de los docentes.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button className="btn-primary" onClick={() => navigate('/usuarios')}>Gestión de Usuarios</button>
            <button className="btn-secondary" onClick={() => navigate('/configuracion/secciones')}>Ver Secciones</button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Mis Asignaturas${user?.centro_nombre ? ` - ${user.centro_nombre}` : ''}`}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
          Selecciona un curso para ver las calificaciones
        </h2>

        {loading && (
          <div style={{ color: 'var(--text-muted)' }}>Cargando asignaturas...</div>
        )}

        {error && (
          <div style={{ color: '#ef4444', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {!loading && !error && asignaciones.length === 0 && (
          <div style={{ color: 'var(--text-muted)' }}>
            No tienes asignaturas activas asignadas en este momento.
          </div>
        )}

        <div className="dashboard-grid">
          {asignaciones.map((asig) => (
            <div 
              key={asig.id} 
              className="asignacion-card"
              onClick={() => handleCardClick(asig.seccion_id, asig.asignatura_id)}
            >
              <div className="card-header">
                <div>
                  <h3 className="card-title">{asig.asignatura.nombre}</h3>
                  <div className="card-subtitle">{asig.asignatura.codigo}</div>
                </div>
                <div className="card-icon">
                  📚
                </div>
              </div>
              
              <div className="card-details">
                <div className="detail-row">
                  <span className="detail-label">Grado</span>
                  <span className="detail-value">
                    <span className="dash-grado-badge">
                      {({ 1:'1ro', 2:'2do', 3:'3ro', 4:'4to', 5:'5to', 6:'6to' } as Record<number,string>)[asig.seccion.grado.numero] ?? `${asig.seccion.grado.numero}°`}
                    </span>
                    {asig.seccion.grado.nombre}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Sección</span>
                  <span className="detail-value">{asig.seccion.nombre}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
