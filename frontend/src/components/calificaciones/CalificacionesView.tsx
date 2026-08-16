import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layout/DashboardLayout';
import { FilaEstudiante } from './FilaEstudiante';
import '../../TableStyles.css';
import { useAuth } from '../../context/AuthContext';
import { docentesService, type AsignacionDocente } from '../../services/docentes';
import { institucionalService } from '../../services/institucionalService';
import { ArrowLeft } from 'lucide-react';

export const CalificacionesView = () => {
  const { seccionId, asignaturaId } = useParams();
  const [estudiantes, setEstudiantes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'periodos' | 'situacion'>('periodos');
  const [asignacionActual, setAsignacionActual] = React.useState<AsignacionDocente | null>(null);
  const [misAsignaciones, setMisAsignaciones] = React.useState<AsignacionDocente[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Efecto que se ejecuta al cargar el componente
  React.useEffect(() => {
    const cargarDatos = async () => {
      try {
        if (!seccionId || !asignaturaId) return;
        
        // Importamos la API de forma dinámica para optimizar el bundle inicial
        const { api } = await import('../../services/api');
        
        const [dataEstudiantes, asignaciones, anios] = await Promise.all([
          api.obtenerEstudiantes(parseInt(seccionId), parseInt(asignaturaId)),
          token ? docentesService.obtenerMisAsignaciones(token) : Promise.resolve([]),
          institucionalService.getAniosEscolares()
        ]);
        
        const anioActivo = anios.find((a: any) => a.estado === 'ACTIVO');
        let asignacionesActivas = asignaciones;
        
        if (anioActivo) {
          asignacionesActivas = asignaciones.filter(a => a.anio_escolar_id === anioActivo.id);
        } else {
          asignacionesActivas = [];
        }

        setEstudiantes(dataEstudiantes);
        setMisAsignaciones(asignacionesActivas);
        
        const asignacion = asignacionesActivas.find(a => 
          a.seccion_id === parseInt(seccionId) && a.asignatura_id === parseInt(asignaturaId)
        );
        if (asignacion) {
          setAsignacionActual(asignacion);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar estudiantes');
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [seccionId, asignaturaId]);

  return (
    <DashboardLayout title="Registro de Calificaciones">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            {asignacionActual ? (
              <>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-light)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <ArrowLeft size={16} /> Volver a mis asignaturas
                </Link>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 0.3rem 0', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                  {asignacionActual.asignatura.nombre}
                </h2>
                <select 
                  value={`${asignacionActual.seccion_id}-${asignacionActual.asignatura_id}`}
                  onChange={(e) => {
                    const [sId, aId] = e.target.value.split('-');
                    navigate(`/calificaciones/${sId}/${aId}`);
                  }}
                  style={{
                    fontSize: '1.1rem', color: 'var(--color-primary-light)', fontWeight: '600', marginBottom: '1rem',
                    background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', outline: 'none'
                  }}
                >
                  {misAsignaciones.map(a => (
                    <option key={`${a.seccion_id}-${a.asignatura_id}`} value={`${a.seccion_id}-${a.asignatura_id}`} style={{ color: 'var(--text-main)', background: 'var(--bg-app)' }}>
                      {({ 1:'1ro', 2:'2do', 3:'3ro', 4:'4to', 5:'5to', 6:'6to' } as Record<number,string>)[a.seccion.grado.numero] ?? `${a.seccion.grado.numero}°`} {a.seccion.grado.nombre} • Sección "{a.seccion.nombre}" ({a.asignatura.nombre})
                    </option>
                  ))}
                </select>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Listado de Estudiantes
                </h3>
              </>
            ) : (
              <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-main)' }}>
                Estudiantes
              </h2>
            )}
          </div>
        </div>

        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'periodos' ? 'active' : ''}`}
            onClick={() => setActiveTab('periodos')}
          >
            Calificaciones por Competencia
          </button>
          <button
            className={`tab-button ${activeTab === 'situacion' ? 'active' : ''}`}
            onClick={() => setActiveTab('situacion')}
          >
            Promedio y Situación Final
          </button>
        </div>

        <div className="table-container">
          <table className="minerd-table">
            {activeTab === 'periodos' ? (
              <thead>
                <tr>
                  <th rowSpan={2} className="sticky-col left-col z-top">Estudiante</th>
                  {[1, 2, 3, 4].map(gc => (
                    <th key={gc} colSpan={5} className="gc-header">
                      Grupo de Competencias {gc}
                    </th>
                  ))}
                  <th rowSpan={2} className="sticky-col right-col z-top cf-header">C.F</th>
                </tr>
                <tr>
                  {[1, 2, 3, 4].map(gc => (
                    <React.Fragment key={`gc-${gc}`}>
                      <th className="period-header">P1</th>
                      <th className="period-header">P2</th>
                      <th className="period-header">P3</th>
                      <th className="period-header">P4</th>
                      <th className="pc-header">PC{gc}</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
            ) : (
              <thead>
                <tr>
                  <th rowSpan={2} className="sticky-col left-col z-top">Estudiante</th>
                  <th colSpan={4} className="gc-header">Promedios GC</th>
                  <th rowSpan={2} className="cf-header z-top">C.F.</th>
                  <th colSpan={4} className="cf-header" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>Calificación Completiva</th>
                  <th colSpan={4} className="cf-header" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>Calific. Extraordinarias</th>
                  <th colSpan={2} className="cf-header" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>Calif. Especiales</th>
                  <th colSpan={2} className="cf-header">Situación Final</th>
                </tr>
                <tr>
                  <th className="pc-header">PC1</th>
                  <th className="pc-header">PC2</th>
                  <th className="pc-header">PC3</th>
                  <th className="pc-header">PC4</th>

                  {/* Completiva */}
                  <th className="period-header">50% C.F.</th>
                  <th className="period-header">C.E.C</th>
                  <th className="period-header">50% C.E.C</th>
                  <th className="period-header">C.C.F</th>

                  {/* Extraordinaria */}
                  <th className="period-header">30% C.F.</th>
                  <th className="period-header">C.E.EX</th>
                  <th className="period-header">70% C.E.EX</th>
                  <th className="period-header">C.EX.F</th>

                  {/* Especial */}
                  <th className="period-header">C.F.</th>
                  <th className="period-header">C.E</th>

                  {/* Situacion Final */}
                  <th className="period-header">A</th>
                  <th className="period-header">R</th>
                </tr>
              </thead>
            )}
            <tbody>
              {loading && <tr><td colSpan={22} style={{ textAlign: 'center', padding: '2rem' }}>Cargando estudiantes de la Base de Datos...</td></tr>}
              {error && <tr><td colSpan={22} style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</td></tr>}
              {!loading && !error && estudiantes.map((est) => (
                <FilaEstudiante
                  key={est.estudianteSeccionId}
                  estudianteSeccionId={est.estudianteSeccionId}
                  numeroLista={est.numeroLista}
                  nombreCompleto={est.nombreCompleto}
                  notasIniciales={est.notasIniciales}
                  notaCompletivaInicial={est.nota_completiva}
                  notaExtraordinariaInicial={est.nota_extraordinaria}
                  notaEspecialInicial={est.nota_especial}
                  asignaturaId={asignaturaId ? parseInt(asignaturaId) : 1}
                  activeTab={activeTab}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
