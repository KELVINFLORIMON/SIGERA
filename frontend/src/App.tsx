import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './components/auth/Login';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { CalificacionesView } from './components/calificaciones/CalificacionesView';
import { Dashboard } from './components/dashboard/Dashboard';
import { EstudiantesView } from './components/estudiantes/EstudiantesView';
import { UsuariosView } from './components/usuarios/UsuariosView';
import { AsignaturasView } from './components/configuracion/AsignaturasView';
import { SeccionesView } from './components/configuracion/SeccionesView';
import { CargaAcademicaView } from './components/configuracion/CargaAcademicaView';
import { AnioEscolarView } from './components/configuracion/AnioEscolarView';
import { CentroEducativoView } from './components/configuracion/CentroEducativoView';
import { ConfiguracionAsignaturasView } from './components/configuracion/ConfiguracionAsignaturasView';
import { AsistenteAnualView } from './components/configuracion/AsistenteAnualView';
import { NetworkStatus } from './components/NetworkStatus';

function App() {
  return (
    // AuthProvider provee los datos de sesión a todos los componentes que están dentro
    <AuthProvider>
      <NetworkStatus />
      {/* BrowserRouter habilita la navegación por URLs sin recargar la página */}
      <BrowserRouter>
        <Routes>
          {/* Ruta pública: Cualquier persona puede ver el login */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas: Requieren haber iniciado sesión */}
          {/* El componente ProtectedRoute intercepta estas rutas. Si no hay token, te envía a /login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calificaciones/:seccionId/:asignaturaId" element={<CalificacionesView />} />
            <Route path="/estudiantes" element={<EstudiantesView />} />
            <Route path="/usuarios" element={<UsuariosView />} />
            <Route path="/configuracion/asignaturas" element={<AsignaturasView />} />
            <Route path="/configuracion/carga-academica" element={<CargaAcademicaView />} />
            <Route path="/configuracion/centro" element={<CentroEducativoView />} />
            <Route path="/configuracion/asistente-anual" element={<AsistenteAnualView />} />
            {/* Redirecciones de compatibilidad hacia el nuevo asistente */}
            <Route path="/configuracion/anios-escolares" element={<Navigate to="/configuracion/asistente-anual" replace />} />
            <Route path="/configuracion/secciones" element={<Navigate to="/configuracion/asistente-anual" replace />} />
            <Route path="/configuracion/asignaturas-competencias" element={<Navigate to="/configuracion/asistente-anual" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
