# Plan de Implementación Técnica - Inicialización de SIGERA

Dado que los documentos de Arquitectura están completos, procedemos con el **Paso 1 del Plan de Implementación**: inicializar el código fuente.
El código será almacenado directamente en la carpeta solicitada: `C:\Users\kelvi\OneDrive - Transformación Digital Educación\Proyecto_SIGERA`.

## User Review Required
> [!IMPORTANT]
> Revisa la estructura de carpetas propuesta abajo y las librerías iniciales. Si estás de acuerdo, haz clic en **Proceed** para que yo ejecute todos los comandos y genere la estructura base automáticamente.

## Open Questions
> [!NOTE]
> 1. Para el frontend (React), propongo utilizar **Vite** con **TypeScript** porque es el estándar moderno, rápido y altamente recomendado para aplicaciones de tipo Dashboard administrativo como SIGERA. ¿Estás de acuerdo con usar TypeScript o prefieres JavaScript puro?
> 2. ¿Tienes instalado `Node.js` (para el frontend) y `Python` en tu computadora para poder correr el servidor una vez lo creemos?

## Proposed Changes

Crearemos dos grandes carpetas principales para mantener el código ordenado y separado:

### Backend (Python + FastAPI)
Crearemos la carpeta `backend/` con la siguiente estructura base profesional:
- `backend/requirements.txt`: Dependencias principales (`fastapi`, `uvicorn`, `sqlalchemy`, `alembic`, `psycopg2`).
- `backend/alembic.ini` & `backend/alembic/`: Para gestionar las migraciones de la base de datos PostgreSQL.
- `backend/app/main.py`: Punto de entrada de la API.
- `backend/app/core/config.py`: Configuraciones y variables de entorno.
- `backend/app/db/`: Configuración de conexión a PostgreSQL (SQLAlchemy).
- `backend/app/models/`: Donde irán nuestras 28 tablas mapeadas.
- `backend/app/schemas/`: Validaciones de entrada/salida (Pydantic).
- `backend/app/api/`: Controladores y rutas (Endpoints).

### Frontend (React + Vite)
Ejecutaremos el comando de inicialización de Vite para crear la carpeta `frontend/`:
- Utilizaremos `React` + `TypeScript`.
- Instalaremos TailwindCSS (si lo apruebas) o prepararemos CSS estándar para el diseño premium.
- Configuraremos la conexión (proxy) para que el frontend pueda hablar con la API (FastAPI) en entorno local.

## Verification Plan
1. Ejecutar los scripts de creación de carpetas y archivos base.
2. Iniciar el servidor backend (`uvicorn`) de prueba.
3. Iniciar el servidor frontend (`npm run dev`) de prueba.
4. Validar que ambos corren sin errores antes de empezar a programar el módulo de configuración escolar.
