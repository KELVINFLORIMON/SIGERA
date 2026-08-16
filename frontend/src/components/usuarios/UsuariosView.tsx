import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usuariosService } from '../../services/usuarios';
import { institucionalService } from '../../services/institucionalService';
import type { CentroEducativo } from '../../services/institucionalService';
import { DashboardLayout } from '../layout/DashboardLayout';
import { UsuarioModal } from './UsuarioModal';
import { UserPlus, Search, Edit, Key, Trash2 } from 'lucide-react';
import '../estudiantes/Estudiantes.css'; // Reusing styles

export const UsuariosView = () => {
  const { token, user } = useAuth();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [centros, setCentros] = useState<CentroEducativo[]>([]);
  const [filterCentro, setFilterCentro] = useState<string>('');

  const cargarDatos = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await usuariosService.obtenerUsuarios(token);
      setUsuarios(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    if (user?.es_superusuario) {
      institucionalService.getCentros().then(setCentros).catch(console.error);
    }
  }, [token, user]);

  const handleSave = async () => {
    await cargarDatos();
    setIsModalOpen(false);
    setEditingUsuario(null);
  };

  const handleEdit = (usuario: any) => {
    setEditingUsuario(usuario);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingUsuario(null);
    setIsModalOpen(true);
  };

  const handleResetPassword = async (usuario: any) => {
    if (!window.confirm(`¿Estás seguro que deseas restaurar la contraseña del usuario ${usuario.nombre_completo}?\n\nLa nueva contraseña será generada a partir de su nombre, apellido y los últimos 6 dígitos de su cédula.`)) return;
    
    if (!token) return;
    try {
      setLoading(true);
      const res = await usuariosService.resetearPassword(token, usuario.id);
      alert(`Contraseña restaurada correctamente.\n\nLa nueva contraseña es: ${res.nueva_password}`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      await cargarDatos();
    }
  };

  const filtrados = usuarios.filter(u => {
    const matchesSearch = `${u.nombre_completo} ${u.cedula} ${u.correo}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCentro = true;
    if (user?.es_superusuario && filterCentro !== '') {
      if (filterCentro === 'none') {
        matchesCentro = u.centro_id === null || u.centro_id === undefined;
      } else {
        matchesCentro = u.centro_id === Number(filterCentro);
      }
    }

    return matchesSearch && matchesCentro;
  });

  return (
    <DashboardLayout>
      <div className="estudiantes-container">
        <header className="module-header">
          <div>
            <h1>Gestión de Usuarios</h1>
            <p>Administra los perfiles y permisos (Roles) del personal asociado a este centro.</p>
          </div>
          {(user?.es_superusuario || user?.roles?.includes('ADMINISTRADOR')) && (
            <button className="btn-primary" onClick={handleNew}>
              <UserPlus size={20} />
              <span>Nuevo Usuario</span>
            </button>
          )}
        </header>

        {error && <div className="error-banner">{error}</div>}

        <div className="search-bar-container" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: '300px' }}>
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, apellido o cédula..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          {user?.es_superusuario && (
            <div style={{ minWidth: '250px' }}>
              <select 
                value={filterCentro}
                onChange={(e) => setFilterCentro(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
              >
                <option value="">Todos los centros</option>
                {centros.map(c => (
                  <option key={c.id} value={c.id}>Centro: {c.nombre}</option>
                ))}
                <option value="none">Sin centro asignado</option>
              </select>
            </div>
          )}
        </div>

        <div className="table-container fade-in">
          <table className="sigera-table">
            <thead>
              <tr>
                <th>Cédula</th>
                <th>Nombre Completo</th>
                <th>Rol</th>
                <th>Correo (Login)</th>
                <th>Teléfono</th>
                <th>Acciones</th>
                {user?.es_superusuario && <th>Centro</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={user?.es_superusuario ? 7 : 6} className="text-center">Cargando usuarios...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={user?.es_superusuario ? 7 : 6} className="text-center">No se encontraron usuarios.</td></tr>
              ) : (
                filtrados.map((u) => {
                  const centroInfo = centros.find(c => c.id === u.centro_id);
                  return (
                    <tr key={u.id} style={{ opacity: u.es_activo ? 1 : 0.6, background: u.es_activo ? 'inherit' : '#f8717111' }}>
                      <td><span className="badge-rne" style={{ textDecoration: u.es_activo ? 'none' : 'line-through' }}>{u.cedula}</span></td>
                      <td className="fw-bold">
                        {u.nombre_completo}
                        {!u.es_activo && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#ef4444', border: '1px solid #ef4444', padding: '2px 6px', borderRadius: '12px' }}>Inactivo</span>}
                      </td>
                      <td>
                        <span className="badge" style={{ 
                          background: u.es_activo ? '#e0e7ff' : '#f1f5f9', 
                          color: u.es_activo ? '#4f46e5' : '#64748b' 
                        }}>
                          {u.roles[0]}
                        </span>
                      </td>
                      <td>{u.correo}</td>
                      <td>{u.telefono || '-'}</td>
                      <td>
                        <button className="btn-icon" title="Restaurar contraseña" disabled={!user?.es_superusuario && (!user?.roles?.includes('ADMINISTRADOR') || u.roles.includes('ADMINISTRADOR'))} onClick={() => handleResetPassword(u)} style={{ marginRight: '0.5rem', color: '#f59e0b' }}>
                          <Key size={18} />
                        </button>
                        <button className="btn-icon" title="Editar usuario" disabled={!user?.es_superusuario && (!user?.roles?.includes('ADMINISTRADOR') || u.roles.includes('ADMINISTRADOR'))} onClick={() => handleEdit(u)}>
                          <Edit size={18} />
                        </button>
                      </td>
                      {user?.es_superusuario && (
                        <td>
                          {centroInfo ? <span className="seccion-chip">{centroInfo.nombre}</span> : <span className="vacio">—</span>}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <UsuarioModal 
          usuarioToEdit={editingUsuario}
          onClose={() => {
            setIsModalOpen(false);
            setEditingUsuario(null);
          }} 
          onSave={handleSave}
          onDelete={async () => {
            await cargarDatos();
            setIsModalOpen(false);
            setEditingUsuario(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};
