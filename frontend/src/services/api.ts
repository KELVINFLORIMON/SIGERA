const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1';

export interface CalificacionGrupoPayload {
  grupo_competencia_id: number;
  nota_p1?: number | null;
  nota_rp1?: number | null;
  nota_p2?: number | null;
  nota_rp2?: number | null;
  nota_p3?: number | null;
  nota_rp3?: number | null;
  nota_p4?: number | null;
  nota_rp4?: number | null;
}
const getHeaders = () => {
  const token = localStorage.getItem('token');
  const centroId = localStorage.getItem('activeCentroId');
  const headers: any = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (centroId) headers['X-Centro-Id'] = centroId;
  return headers;
};

export interface CalificacionEstudiantePayload {
  grupos: CalificacionGrupoPayload[];
  nota_completiva?: number | null;
  nota_extraordinaria?: number | null;
  nota_especial?: number | null;
}

export interface GrupoResponse extends CalificacionGrupoPayload {
  promedio_competencia: number | null;
}

export interface CalificacionResponse {
  id: number;
  estudiante_seccion_id: number;
  asignatura_id: number;
  grupos: GrupoResponse[];
  calificacion_final: number | null;
  nota_completiva: number | null;
  nota_extraordinaria: number | null;
  nota_especial: number | null;
  situacion_final: string;
  nivel_desempeno: string;
}

export const api = {
  guardarCalificaciones: async (
    estudianteSeccionId: number,
    asignaturaId: number,
    payload: CalificacionEstudiantePayload
  ) => {
    try {
      const response = await fetch(
        `${BASE_URL}/calificaciones/${estudianteSeccionId}/asignatura/${asignaturaId}`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        let errorMsg = 'Error al guardar las calificaciones';
        
        if (errorData) {
           if (Array.isArray(errorData.detail)) {
               errorMsg = errorData.detail.map((e: any) => e.msg).join(", ");
           } else if (typeof errorData.detail === 'string') {
               errorMsg = errorData.detail;
           } else {
               errorMsg = JSON.stringify(errorData);
           }
        }
        window.alert("No se pudo guardar: " + errorMsg);
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (error) {
      console.error("Error en guardarCalificaciones:", error);
      throw error;
    }
  },

  obtenerEstudiantes: async (seccionId: number, asignaturaId: number) => {
    try {
      const response = await fetch(
        `${BASE_URL}/calificaciones/seccion/${seccionId}/asignatura/${asignaturaId}/estudiantes`,
        { headers: getHeaders() }
      );
      if (!response.ok) {
        throw new Error('Error al cargar la lista de estudiantes');
      }
      return await response.json();
    } catch (error) {
      console.error("Error en obtenerEstudiantes:", error);
      throw error;
    }
  }
  ,
  obtenerSecciones: async () => {
    try {
      const response = await fetch(`${BASE_URL}/secciones`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Error al cargar secciones');
      return await response.json();
    } catch (error) {
      console.error('Error en obtenerSecciones:', error);
      throw error;
    }
  }
};
