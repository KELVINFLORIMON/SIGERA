import { API_URL } from './auth';

export interface EstudiantePayload {
  rne: string;
  cedula?: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  sexo: 'M' | 'F';
  fecha_nacimiento: string;
  correo?: string;
  telefono?: string;
  centro_id: number;
  seccion_id?: number;
  anio_escolar_id?: number;
}

export const estudiantesService = {
  obtenerEstudiantes: async (token: string, anioEscolarId?: string | number) => {
    const centroId = localStorage.getItem('activeCentroId');
    let url = `${API_URL}/estudiantes/`;
    if (anioEscolarId) {
      url += `?anio_escolar_id=${anioEscolarId}`;
    }
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': centroId || '' }
    });
    if (!response.ok) throw new Error('Error al obtener estudiantes');
    return response.json();
  },

  crearEstudiante: async (token: string, payload: EstudiantePayload) => {
    const centroId = localStorage.getItem('activeCentroId');
    const response = await fetch(`${API_URL}/estudiantes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Centro-Id': centroId || '' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || 'Error al crear estudiante');
    }
    return response.json();
  },

  actualizarEstudiante: async (token: string, id: number, payload: Partial<EstudiantePayload>) => {
    const centroId = localStorage.getItem('activeCentroId');
    const response = await fetch(`${API_URL}/estudiantes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Centro-Id': centroId || '' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || 'Error al actualizar estudiante');
    }
    return response.json();
  },

  eliminarEstudiante: async (token: string, id: number) => {
    const centroId = localStorage.getItem('activeCentroId');
    const response = await fetch(`${API_URL}/estudiantes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': centroId || '' }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || 'Error al eliminar estudiante');
    }
    return response.json();
  }
};
