# SIGERA - Sistema Inteligente de Gestión Educativa y Rendimiento Académico

Este es el repositorio base del Proyecto SIGERA. Está organizado como un monorepo que contiene tanto el backend (API) como el frontend (Aplicación Web).

## Estructura del Proyecto

- `/backend`: Servidor API construido con **Python y FastAPI**.
- `/frontend`: Aplicación cliente construida con **React y Vite**.

## Cómo iniciar el proyecto localmente

### Backend
1. Instalar Python 3.10+.
2. Abrir la terminal en la carpeta `/backend`.
3. Usar el entorno virtual único del backend: `backend/env`.
4. Activarlo en PowerShell con `./env/Scripts/activate`.
5. Instalar dependencias si hace falta: `python -m pip install -r requirements.txt`.
6. Ejecutar el servidor: `uvicorn app.main:app --reload --port 8000`.
7. La API estará disponible en `http://localhost:8000` (y la documentación Swagger en `http://localhost:8000/docs`).

### Frontend
1. Instalar Node.js.
2. Abrir la terminal en la carpeta `/frontend`.
3. Instalar módulos: `npm install`.
4. Ejecutar el servidor de desarrollo: `npm run dev`.
5. La aplicación web se abrirá normalmente en `http://localhost:5173`.
