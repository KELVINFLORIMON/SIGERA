import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Settings, Building, Calendar, Layers, BookOpen, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title = 'SIGERA' }) => {
  // Consumimos el contexto global para obtener quién está logueado y la función para desloguear
  const { user, logout, activeCentroId, setActiveCentroId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [centros, setCentros] = useState<any[]>([]);
  
  const isSuper = user?.es_superusuario;
  const isAdmin = isSuper || user?.roles?.includes('ADMINISTRADOR');
  const isDirector = user?.roles?.includes('DIRECTOR');
  const isCoordinador = user?.roles?.includes('COORDINADOR');
  
  // Roles que ven Inicio y Todos los Estudiantes (Cualquier rol administrativo)
  const isManagement = isSuper || isAdmin || isDirector || isCoordinador;

  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [isHovered, setIsHovered] = useState(false);
  const [justClicked, setJustClicked] = useState(false);

  // Si acaba de hacer clic, obligamos a que se colapse ignorando el hover actual
  const effectivelyCollapsed = isSidebarCollapsed && (!isHovered || justClicked);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    setJustClicked(true);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setJustClicked(false); // Al volver a entrar o moverse, reactivamos el hover
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setJustClicked(false);
  };

  useEffect(() => {
    if (user?.es_superusuario) {
      import('../../services/institucionalService').then(m => {
        m.institucionalService.getCentros().then(data => {
          setCentros(data);
          if (data.length > 0 && !activeCentroId) {
            setActiveCentroId(data[0].id);
          }
        }).catch(console.error);
      });
    }
  }, [user, activeCentroId, setActiveCentroId]);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('theme-light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('theme-light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);
  
  return (
    <div className={`dashboard-container ${effectivelyCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar - Panel lateral izquierdo con efecto de vidrio empañado (Glassmorphism) */}
      <aside 
        className={`dashboard-sidebar glass-panel ${effectivelyCollapsed ? 'collapsed' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="sidebar-header-row">
          <div className="sidebar-logo">
            <div className="logo-icon">S</div>
            {!effectivelyCollapsed && <h2>SIGERA</h2>}
          </div>
          <button 
            className="sidebar-toggle-btn"
            onClick={handleToggleSidebar}
            title={isSidebarCollapsed ? "Expandir Menú" : "Ocultar Menú"}
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} title="Inicio">
            <LayoutDashboard size={20} />
            {!effectivelyCollapsed && <span>{isManagement ? 'Inicio' : 'Mis Asignaturas'}</span>}
          </Link>
          <Link to="/estudiantes" className={`nav-item ${location.pathname === '/estudiantes' ? 'active' : ''}`} title="Estudiantes">
            <Users size={20} />
            {!effectivelyCollapsed && <span>{isManagement ? 'Todos los Estudiantes' : 'Mis Estudiantes'}</span>}
          </Link>
          {isAdmin && (
            <Link to="/usuarios" className={`nav-item ${location.pathname === '/usuarios' ? 'active' : ''}`} title="Gestión de Usuarios">
              <Settings size={20} />
              {!effectivelyCollapsed && <span>Gestión de Usuarios</span>}
            </Link>
          )}
          
          {(isAdmin || isSuper) && (
            <>
              {!effectivelyCollapsed && (
                <div style={{ padding: '1rem 0 0.5rem 1rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Config. Académica
                </div>
              )}
              {isSuper && (
                <>
                  <Link to="/configuracion/centro" className={`nav-item ${location.pathname === '/configuracion/centro' ? 'active' : ''}`} title="Centros Educativos">
                    <Building size={20} /> {!effectivelyCollapsed && <span>Centros Educativos</span>}
                  </Link>
                </>
              )}
              {(isSuper || isAdmin) && (
                <Link to="/configuracion/asignaturas" className={`nav-item ${location.pathname === '/configuracion/asignaturas' ? 'active' : ''}`} title="Banco de Asignaturas">
                  <BookOpen size={20} /> {!effectivelyCollapsed && <span>Banco de Asignaturas</span>}
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link to="/configuracion/asistente-anual" className={`nav-item ${location.pathname === '/configuracion/asistente-anual' ? 'active' : ''}`} title="Configuración Anual">
                    <Calendar size={20} /> {!effectivelyCollapsed && <span>Configuración Anual</span>}
                  </Link>
                  <Link to="/configuracion/grados" className={`nav-item ${location.pathname === '/configuracion/grados' ? 'active' : ''}`} title="Grados y Secciones">
                    <Layers size={20} /> {!effectivelyCollapsed && <span>Grados y Secciones</span>}
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              {user?.nombre_completo?.charAt(0) || 'U'}
            </div>
            {!effectivelyCollapsed && (
              <div className="user-info">
                <span className="user-name">{user?.nombre_completo || 'Usuario'}</span>
                <span className="user-role">{isSuper ? 'Súper Administrador' : (user?.roles?.[0] || 'Docente')}</span>
              </div>
            )}
          </div>
          
          <button className={`btn-logout ${effectivelyCollapsed ? 'collapsed' : ''}`} onClick={logout} title="Cerrar Sesión">
            {!effectivelyCollapsed ? 'Cerrar Sesión' : 'Cerrar'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <header className="dashboard-header glass-panel">
          <h1>{title}</h1>
          <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {user?.es_superusuario && centros.length > 0 && (
              <select 
                value={activeCentroId || ''} 
                onChange={(e) => setActiveCentroId(Number(e.target.value))}
                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.9rem' }}
              >
                {centros.map(c => (
                  <option key={c.id} value={c.id}>{c.codigo_minerd} - {c.nombre}</option>
                ))}
              </select>
            )}
            <button 
              onClick={() => setIsLightMode(!isLightMode)} 
              style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '50%', padding: '0.6rem', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}
              title={isLightMode ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
            >
              {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>
        
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
};
