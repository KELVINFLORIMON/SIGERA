import { syncQueue } from './syncQueue';

export const apiClient = async (url: string, options: RequestInit = {}) => {
  const method = options.method || 'GET';
  
  try {
    const response = await fetch(url, options);
    
    // Si la API responde con un error de servidor, lanzamos excepción.
    if (!response.ok) {
      throw new Error(`Error de API: ${response.status}`);
    }
    
    return await response.json();
    
  } catch (error: any) {
    // Detectamos si es un error de red (el TypeError de fetch suele indicar fallo de red o CORS)
    const isNetworkError = error.name === 'TypeError' || error.message.includes('Failed to fetch');
    
    // Si no hay internet y es una operación de escritura (POST, PUT, DELETE, PATCH)
    if (isNetworkError && method !== 'GET') {
      console.warn(`[ApiClient] Red caída. Encolando petición ${method} a ${url}`);
      
      const headers = options.headers as Record<string, string> || {};
      let body = options.body;
      
      // Parsear cuerpo si es JSON string
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          // Mantener como string si no es parseable
        }
      }
      
      await syncQueue.enqueueRequest(url, method, headers, body);
      
      // Devolvemos una respuesta falsa de éxito para que la interfaz no se rompa 
      // y asuma que se guardó correctamente (optimistic UI)
      return { success: true, offline: true, message: 'Guardado localmente. Se sincronizará al conectar.' };
    }
    
    // Si es GET o no es un error de red, lanzamos el error para que el componente lo maneje
    throw error;
  }
};
