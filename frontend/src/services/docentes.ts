import { API_URL } from './auth';

export interface Asignatura {
  id: number;
  codigo: string;
  nombre: string;
}

export interface Grado {
  id: number;
  numero: number;
  nombre: string;
}

export interface Seccion {
  id: number;
  nombre: string;
  grado: Grado;
}

export interface AsignacionDocente {
  id: number;
  seccion_id: number;
  asignatura_id: number;
  anio_escolar_id: number;
  es_activa: boolean;
  seccion: Seccion;
  asignatura: Asignatura;
}

export const docentesService = {
  obtenerMisAsignaciones: async (token: string): Promise<AsignacionDocente[]> => {
    const response = await fetch(`${API_URL}/docentes/me/asignaciones`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || 'Error al obtener asignaciones');
    }

    return response.json();
  },
};
