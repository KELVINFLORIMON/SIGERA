import { API_URL } from './auth';

export interface AsignaturaPayload {
  codigo: string;
  nombre: string;
  abreviatura?: string;
  es_activa?: boolean;
  orden?: number;
}

export interface SeccionPayload {
  nombre: string;
  tanda: string;
  capacidad_max?: number;
  es_activa?: boolean;
  grado_id: number;
}

export interface GradoPayload {
  numero: number;
  nombre: string;
  nivel?: string;
  ciclo: number;
  modalidad: string;
  anio_escolar_id: number;
}

export interface AsignacionPayload {
  docente_id: number;
  asignatura_id: number;
  seccion_id: number;
  anio_escolar_id: number;
}

export interface GradoAsignaturaPayload {
  grado_id: number;
  asignatura_id: number;
  creditos?: number;
  horas_semana?: number;
}

export interface GrupoCompetenciaPayload {
  nombre_grupo: string;
  descripcion?: string;
  peso_porcentaje: number;
  asignatura_id: number;
  grado_id: number;
  competencias_ids: number[];
}

export interface CompetenciaEspecificaPayload {
  codigo: string;
  nombre: string;
  descripcion?: string;
  asignatura_id: number;
}

export const configuracionService = {
  // Asignaturas
  obtenerAsignatura: async (token: string, id: number) => {
    const response = await fetch(`${API_URL}/asignaturas/${id}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) throw new Error('Error al obtener asignatura');
    return response.json();
  },
  obtenerGruposPlantilla: async (token: string, id: number) => {
    const response = await fetch(`${API_URL}/asignaturas/${id}/grupos-plantilla`, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) throw new Error('Error al obtener grupos plantilla');
    return response.json();
  },
  obtenerAsignaturas: async (token: string) => {
    const response = await fetch(`${API_URL}/asignaturas/`, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) throw new Error('Error al obtener asignaturas');
    return response.json();
  },
  crearAsignatura: async (token: string, payload: AsignaturaPayload) => {
    const response = await fetch(`${API_URL}/asignaturas/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Error al crear asignatura');
    return response.json();
  },
  actualizarAsignatura: async (token: string, id: number, payload: AsignaturaPayload) => {
    const response = await fetch(`${API_URL}/asignaturas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Error al actualizar asignatura');
    return response.json();
  },
  eliminarAsignatura: async (token: string, id: number) => {
    const response = await fetch(`${API_URL}/asignaturas/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) throw new Error('Error al eliminar asignatura');
  },
  seedAsignaturasMinerd: async (token: string) => {
    const response = await fetch(`${API_URL}/asignaturas/seed-minerd`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) throw new Error('Error al inicializar asignaturas');
    return response.json();
  },

  // Grados
  obtenerGrados: async (token: string, anio_escolar_id?: number) => {
    let url = `${API_URL}/secciones/grados`;
    if (anio_escolar_id) url += `?anio_escolar_id=${anio_escolar_id}`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) throw new Error('Error al obtener grados');
    return response.json();
  },
  crearGrado: async (token: string, payload: GradoPayload) => {
    const response = await fetch(`${API_URL}/secciones/grados`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      console.error("Error backend crearGrado:", errData);
      throw new Error(errData?.detail || 'Error al crear grado');
    }
    return response.json();
  },
  eliminarGrado: async (token: string, id: number) => {
    const response = await fetch(`${API_URL}/secciones/grados/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.detail || 'Error al eliminar grado');
    }
  },

  // Secciones
  obtenerSecciones: async (token: string) => {
    const response = await fetch(`${API_URL}/secciones/`, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) throw new Error('Error al obtener secciones');
    return response.json();
  },
  crearSeccion: async (token: string, payload: SeccionPayload) => {
    const response = await fetch(`${API_URL}/secciones/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      console.error("Error backend crearSeccion:", errData);
      throw new Error(errData?.detail || 'Error al crear sección');
    }
    return response.json();
  },
  eliminarSeccion: async (token: string, id: number) => {
    const response = await fetch(`${API_URL}/secciones/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.detail || 'Error al eliminar sección');
    }
  },

  // Asignaciones
  obtenerAsignacionesPorSeccion: async (token: string, seccionId: number) => {
    const response = await fetch(`${API_URL}/asignaciones/seccion/${seccionId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) throw new Error('Error al obtener asignaciones');
    return response.json();
  },
  // Alias usado en CargaAcademicaView
  obtenerAsignaciones: async (token: string, seccionId: number) => {
    const response = await fetch(`${API_URL}/asignaciones/seccion/${seccionId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) throw new Error('Error al obtener asignaciones');
    return response.json();
  },
  crearAsignacion: async (token: string, payload: AsignacionPayload) => {
    const response = await fetch(`${API_URL}/asignaciones/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Error al crear asignación');
    return response.json();
  },
  eliminarAsignacion: async (token: string, id: number) => {
    const response = await fetch(`${API_URL}/asignaciones/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) throw new Error('Error al eliminar asignación');
  },

  // Competencias y Plan de Estudio
  obtenerAsignaturasPorGrado: async (token: string, gradoId: number) => {
    const response = await fetch(`${API_URL}/competencias/grado/${gradoId}/asignaturas`, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) throw new Error('Error al obtener asignaturas del grado');
    return response.json();
  },
  asignarMateriaAGrado: async (token: string, payload: GradoAsignaturaPayload) => {
    const response = await fetch(`${API_URL}/competencias/grado-asignatura`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.detail || 'Error al asignar asignatura al grado');
    }
    return response.json();
  },
  removerMateriaDeGrado: async (token: string, id: number) => {
    const response = await fetch(`${API_URL}/competencias/grado-asignatura/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) throw new Error('Error al remover asignatura del grado');
  },
  crearGrupoCompetencia: async (token: string, payload: GrupoCompetenciaPayload) => {
    const response = await fetch(`${API_URL}/competencias/grupos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.detail || 'Error al crear grupo de competencia');
    }
    return response.json();
  },
  eliminarGrupoCompetencia: async (token: string, id: number) => {
    const response = await fetch(`${API_URL}/competencias/grupos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) throw new Error('Error al eliminar grupo de competencia');
  },
  obtenerCompetenciasEspecificas: async (token: string, asignaturaId: number) => {
    const response = await fetch(`${API_URL}/competencias/especificas/${asignaturaId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' }
    });
    if (!response.ok) throw new Error('Error al obtener competencias específicas');
    return response.json();
  },
  crearCompetenciaEspecifica: async (token: string, payload: CompetenciaEspecificaPayload) => {
    const response = await fetch(`${API_URL}/competencias/especificas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Centro-Id': localStorage.getItem('activeCentroId') || '' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Error al crear competencia específica');
    return response.json();
  },
};
