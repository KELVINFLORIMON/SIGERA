import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth as authService } from '../services/auth';

export interface User {
  id: number;
  correo: string;
  nombre_completo: string;
  es_superusuario: boolean;
  centro_id?: number;
  centro_nombre?: string;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeCentroId: number | null;
  setActiveCentroId: (id: number | null) => void;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto: Envuelve a toda la aplicación para que todos los componentes tengan acceso al estado
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado para guardar los datos del usuario (nombre, rol)
  const [user, setUser] = useState<User | null>(null);
  // Estado para guardar el token, inicializado con el valor de localStorage (por si el usuario refresca la página)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  // Estado para el centro activo
  const [activeCentroId, setActiveCentroId] = useState<number | null>(
    localStorage.getItem('activeCentroId') ? Number(localStorage.getItem('activeCentroId')) : null
  );
  // Estado de carga inicial, útil para no renderizar las rutas protegidas hasta saber si el usuario es válido
  const [isLoading, setIsLoading] = useState(true);

  // Efecto que se ejecuta al cargar la app o cuando cambia el token
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          // Si hay token, pedimos al backend los datos del usuario para validar que el token no haya expirado
          const userData = await authService.getCurrentUser(token);
          setUser(userData);
          // Auto-asignar centro: para usuarios no-superusuario, siempre usar su propio centro
          if (!userData.es_superusuario && userData.centro_id) {
            handleSetActiveCentroId(userData.centro_id);
          }
        } catch (error) {
          // Si el token es inválido o expiró, cerramos sesión automáticamente
          console.error("Token verification failed", error);
          setToken(null);
          setActiveCentroId(null);
          localStorage.removeItem('token');
          localStorage.removeItem('activeCentroId');
        }
      }
      setIsLoading(false); // Terminamos de cargar
    };

    initializeAuth();
  }, [token]);

  // Función que el componente Login llamará
  const login = async (correo: string, password: string) => {
    const data = await authService.login(correo, password);
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token); // Guardamos el token en el navegador para que persista
  };

  const handleSetActiveCentroId = (id: number | null) => {
    setActiveCentroId(id);
    if (id) {
      localStorage.setItem('activeCentroId', id.toString());
    } else {
      localStorage.removeItem('activeCentroId');
    }
  };

  // Función que el Sidebar llamará para cerrar sesión
  const logout = () => {
    setUser(null);
    setToken(null);
    setActiveCentroId(null);
    localStorage.removeItem('token'); // Borramos el rastro
    localStorage.removeItem('activeCentroId');
  };

  return (
    // Pasamos todas estas variables y funciones a los componentes hijos
    <AuthContext.Provider value={{ user, token, activeCentroId, setActiveCentroId: handleSetActiveCentroId, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
