export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1';

export const auth = {
  // 1. Envía el correo y la contraseña al backend para intentar iniciar sesión
  login: async (correo: string, password: string) => {
    // OAuth2PasswordRequestForm en el backend espera los datos en formato "form-urlencoded"
    const formData = new URLSearchParams();
    formData.append('username', correo);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/login/access-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Correo o contraseña incorrectos');
    }

    // Retorna el Token JWT si fue exitoso
    return response.json();
  },

  // 2. Valida el token y obtiene la información del usuario logueado (Nombre, Rol, etc.)
  getCurrentUser: async (token: string) => {
    const response = await fetch(`${API_URL}/login/test-token`, {
      method: 'POST',
      headers: {
        // El estándar indica enviar el token en la cabecera 'Authorization' como 'Bearer <token>'
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error obteniendo usuario o token expirado');
    }

    // Retorna los datos del usuario (UsuarioSchema)
    return response.json();
  },
};
