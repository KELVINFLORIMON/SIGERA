export interface Regional {
  id: number;
  codigo: string;
  nombre: string;
}

export interface Distrito {
  id: number;
  codigo: string;
  nombre: string;
  regional_id: number;
}

export interface CentroEducativo {
  id: number;
  distrito_id: number;
  codigo_minerd: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  tanda_principal?: string;
  modalidad?: string;
  es_activo: boolean;
}

export interface PeriodoAcademico {
  id: number;
  anio_escolar_id: number;
  numero: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

export interface AnioEscolar {
  id: number;
  centro_id: number;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  es_activo: boolean;
  periodos?: PeriodoAcademico[];
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1';

const fetchWrapper = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('token');
  const centroId = localStorage.getItem('activeCentroId');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(centroId ? { 'X-Centro-Id': centroId } : {}),
    ...options?.headers,
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw { response: { data: errorData } };
  }
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
};

export const institucionalService = {
  // Regionales
  getRegionales: () => fetchWrapper<Regional[]>('/institucional/regionales'),
  createRegional: (data: Omit<Regional, 'id'>) => 
    fetchWrapper<Regional>('/institucional/regionales', { method: 'POST', body: JSON.stringify(data) }),

  // Distritos
  getDistritos: () => fetchWrapper<Distrito[]>('/institucional/distritos'),
  createDistrito: (data: Omit<Distrito, 'id'>) => 
    fetchWrapper<Distrito>('/institucional/distritos', { method: 'POST', body: JSON.stringify(data) }),

  // Centros
  getCentros: () => fetchWrapper<CentroEducativo[]>('/institucional/centros'),
  createCentro: (data: Omit<CentroEducativo, 'id'>) => 
    fetchWrapper<CentroEducativo>('/institucional/centros', { method: 'POST', body: JSON.stringify(data) }),
  updateCentro: (id: number, data: Partial<CentroEducativo>) => 
    fetchWrapper<CentroEducativo>(`/institucional/centros/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteCentro: (id: number) => 
    fetchWrapper<void>(`/institucional/centros/${id}`, { method: 'DELETE' }),

  // Años Escolares
  getAniosEscolares: () => fetchWrapper<AnioEscolar[]>('/institucional/anios-escolares'),
  createAnioEscolar: (data: Omit<AnioEscolar, 'id' | 'periodos'>) => 
    fetchWrapper<AnioEscolar>('/institucional/anios-escolares', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateAnioEscolar: (id: number, data: Partial<AnioEscolar>) => 
    fetchWrapper<AnioEscolar>(`/institucional/anios-escolares/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteAnioEscolar: (id: number) => 
    fetchWrapper<void>(`/institucional/anios-escolares/${id}`, { method: 'DELETE' }),

  // Periodos
  getPeriodosByAnio: (anioId: number) => fetchWrapper<PeriodoAcademico[]>(`/institucional/periodos/anio/${anioId}`),
  updatePeriodo: (id: number, data: Partial<PeriodoAcademico>) => 
    fetchWrapper<PeriodoAcademico>(`/institucional/periodos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
};
