import { API_URL } from './auth';

export interface UsuarioPayload {
  rol_nombre: 'ADMINISTRADOR' | 'DOCENTE' | 'COORDINADOR' | 'DIRECTOR';
  cedula: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  sexo: 'M' | 'F';
  correo: string;
  telefono?: string;
  titulo_academico?: string;
  especialidad?: string;
  centro_id?: number;
}

export const usuariosService = {
  obtenerUsuarios: async (token: string) => {
    const response = await fetch(`${API_URL}/usuarios/`, {
      headers: {
        'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || ''
      }
    });
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
  },

  crearUsuario: async (token: string, payload: UsuarioPayload) => {
    const response = await fetch(`${API_URL}/usuarios/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || ''
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || 'Error al crear usuario');
    }
    
    return response.json();
  },

  actualizarUsuario: async (token: string, id: number, payload: UsuarioPayload) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || ''
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || 'Error al actualizar usuario');
    }
    
    return response.json();
  },

  resetearPassword: async (token: string, id: number) => {
    const response = await fetch(`${API_URL}/usuarios/${id}/reset-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || ''
      }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || 'Error al restaurar contraseña');
    }
    
    return response.json();
  },

  eliminarUsuario: async (token: string, id: number) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || ''
      }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || 'Error al eliminar usuario');
    }
    
    return response.json();
  }
};
