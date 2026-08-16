import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Función que se ejecuta cuando el usuario presiona "LOGIN" o da Enter
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue por defecto
    setError(''); // Limpiamos cualquier error previo
    setIsLoading(true); // Mostramos el estado de carga en el botón

    try {
      // Llamamos a la función de login del contexto (que a su vez llama al backend)
      await login(correo, password);
      // Si fue exitoso, redirigimos a la página principal (/)
      navigate('/');
    } catch (err: any) {
      // Si falla (credenciales incorrectas), mostramos el mensaje de error en pantalla
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false); // Ocultamos el estado de carga
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="login-error">{error}</div>}

        <div className="input-group">
          <User className="input-icon" />
          <input
            type="email"
            className="login-input"
            placeholder="Username"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <Lock className="input-icon" />
          <input
            type="password"
            className="login-input"
            placeholder="*********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? 'CARGANDO...' : 'LOGIN'}
        </button>
      </form>

      <div className="login-footer">
        Copyright © 2026 SIGERA, Inc "KLVFLORIMON"
      </div>
    </div>
  );
};
