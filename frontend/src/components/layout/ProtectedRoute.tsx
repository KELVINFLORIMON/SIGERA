import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = () => {
  const { token, isLoading } = useAuth();

  // 1. Mientras la aplicación revisa si el token es válido, mostramos un loading
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-main)', color: 'white' }}>
        Cargando...
      </div>
    );
  }

  // 2. Si terminó de cargar y no hay token (no inició sesión o caducó), lo pateamos al /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si tiene token, renderizamos el componente que intentó visitar (<Outlet /> representa a los componentes hijos en React Router)
  return <Outlet />;
};
