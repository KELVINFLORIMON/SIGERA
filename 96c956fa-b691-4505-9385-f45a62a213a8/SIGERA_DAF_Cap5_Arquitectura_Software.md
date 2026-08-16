# SIGERA
## Sistema Inteligente de Gestión Educativa y Rendimiento Académico
### Documento de Arquitectura Funcional (DAF)
#### Capítulo 5 — Arquitectura de Software

---

**Versión:** 1.0  
**Fecha:** Agosto 2026  
**Estado:** Borrador para revisión  
**Referencia anterior:** [Capítulo 4 — Arquitectura de Datos](./SIGERA_DAF_Cap4_Arquitectura_Datos.md)

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Arquitectura General del Sistema](#2-arquitectura-general-del-sistema)
3. [Arquitectura del Backend](#3-arquitectura-del-backend)
4. [API REST — Diseño de Endpoints](#4-api-rest--diseño-de-endpoints)
5. [Sistema de Autenticación y Autorización](#5-sistema-de-autenticación-y-autorización)
6. [Arquitectura del Frontend](#6-arquitectura-del-frontend)
7. [Comunicación Frontend ↔ Backend](#7-comunicación-frontend--backend)
8. [Generación de PDFs](#8-generación-de-pdfs)
9. [Manejo de Errores](#9-manejo-de-errores)
10. [Variables de Entorno y Configuración](#10-variables-de-entorno-y-configuración)
11. [Arquitectura de Despliegue](#11-arquitectura-de-despliegue)
12. [Estructura de Carpetas del Proyecto](#12-estructura-de-carpetas-del-proyecto)

---

## 1. Introducción

Este capítulo define la **arquitectura de software de SIGERA**: cómo están organizados el backend, el frontend, la API y la infraestructura. El objetivo es que cualquier desarrollador que se incorpore al proyecto pueda entender la estructura completa sin necesidad de explicaciones adicionales.

### 1.1 Stack tecnológico definitivo

| Capa | Tecnología | Versión mínima | Justificación |
|---|---|---|---|
| **Base de datos** | PostgreSQL | 15 | Robustez, integridad, columnas generadas |
| **ORM** | SQLAlchemy | 2.0 | Async nativo, tipo-seguro |
| **Backend** | Python + FastAPI | 3.11 / 0.111 | Rendimiento, tipado, async, ideal para IA futura |
| **Migraciones** | Alembic | 1.13 | Versionado de esquema de base de datos |
| **Autenticación** | JWT (python-jose) | — | Estándar de la industria |
| **Hashing contraseñas** | bcrypt (passlib) | — | Algoritmo seguro |
| **Generación PDF** | WeasyPrint | 60+ | HTML → PDF de alta fidelidad |
| **Excel/CSV** | OpenPyXL + Pandas | — | Importación y exportación de datos |
| **Frontend** | React + TypeScript | 18 / 5.0 | Ecosistema rico, tipado estricto |
| **Estilos** | Tailwind CSS | 3.4 | Productividad en UI, clases utilitarias |
| **State management** | Zustand | 4.x | Liviano y simple |
| **HTTP Client** | Axios | 1.x | Interceptores para JWT |
| **Tablas** | TanStack Table | 8.x | La mejor librería de tablas para React |
| **PDF Viewer** | react-pdf | 7.x | Previsualización de boletines |
| **Containerización** | Docker + Docker Compose | — | Portabilidad y despliegue sencillo |
| **Servidor web** | Nginx | 1.25 | Proxy reverso y servidor de estáticos |

---

## 2. Arquitectura General del Sistema

### 2.1 Diagrama de capas

```
╔══════════════════════════════════════════════════════════════════╗
║                     ARQUITECTURA SIGERA                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║   CLIENTE (Navegador Web)                                        ║
║   ┌────────────────────────────────────────────────────────┐    ║
║   │  React 18 + TypeScript                                 │    ║
║   │  Zustand (estado) │ Axios (HTTP) │ TanStack Table      │    ║
║   │  Tailwind CSS     │ react-pdf   │ react-query          │    ║
║   └─────────────────────────┬──────────────────────────────┘    ║
║                             │ HTTPS                              ║
║   PROXY / SERVIDOR WEB      ▼                                    ║
║   ┌────────────────────────────────────────────────────────┐    ║
║   │  Nginx                                                 │    ║
║   │  • Sirve archivos estáticos del frontend               │    ║
║   │  • Proxy reverso a FastAPI                             │    ║
║   │  • SSL/TLS termination                                 │    ║
║   └─────────────────────────┬──────────────────────────────┘    ║
║                             │                                    ║
║   BACKEND (API REST)        ▼                                    ║
║   ┌────────────────────────────────────────────────────────┐    ║
║   │  FastAPI (Python 3.11)                                 │    ║
║   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    ║
║   │  │ Routers  │ │Services  │ │ Schemas  │ │  Utils   │  │    ║
║   │  │(endpoints│ │(lógica de│ │(Pydantic │  │(PDF,Excel│  │    ║
║   │  │  API)    │ │ negocio) │ │validación│  │ cálculos)│  │    ║
║   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    ║
║   │  ┌──────────────────────────────────────────────────┐  │    ║
║   │  │  SQLAlchemy 2.0 (ORM async)                      │  │    ║
║   │  └──────────────────────────────────────────────────┘  │    ║
║   └─────────────────────────┬──────────────────────────────┘    ║
║                             │                                    ║
║   BASE DE DATOS             ▼                                    ║
║   ┌────────────────────────────────────────────────────────┐    ║
║   │  PostgreSQL 15                                         │    ║
║   │  • 28 tablas normalizadas                              │    ║
║   │  • Columnas generadas (notas efectivas)                │    ║
║   │  • Triggers de auditoría                               │    ║
║   └────────────────────────────────────────────────────────┘    ║
║                                                                  ║
║   ALMACENAMIENTO            CONTENEDORES                         ║
║   ┌──────────────┐          ┌─────────────────────────────┐     ║
║   │  /media      │          │  Docker Compose             │     ║
║   │  • PDFs      │          │  • sigera-db (PostgreSQL)   │     ║
║   │  • Uploads   │          │  • sigera-api (FastAPI)     │     ║
║   └──────────────┘          │  • sigera-web (Nginx+React) │     ║
║                             └─────────────────────────────┘     ║
╚══════════════════════════════════════════════════════════════════╝
```

### 2.2 Principios de arquitectura

| Principio | Descripción |
|---|---|
| **Separación de responsabilidades** | Router → Service → Repository → DB. Cada capa tiene una sola función |
| **API-First** | El backend expone únicamente JSON. El frontend consume la API |
| **Stateless** | El servidor no guarda estado de sesión. La autenticación es por JWT |
| **Validación en capas** | La base de datos valida tipos/restricciones; Pydantic valida entradas; el frontend valida UX |
| **Motor de cálculo centralizado** | Toda la lógica académica vive en el backend, nunca en el frontend |
| **Auditoría completa** | Todo cambio en calificaciones se registra automáticamente |

---

## 3. Arquitectura del Backend

### 3.1 Patrón de capas del backend

```
REQUEST HTTP
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  ROUTER (routers/)                                  │
│  • Recibe el request HTTP                           │
│  • Valida parámetros de ruta y query                │
│  • Llama al Service correspondiente                 │
│  • Retorna la respuesta HTTP                        │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  SERVICE (services/)                                │
│  • Contiene toda la lógica de negocio               │
│  • Aplica las reglas de la Ordenanza 04-2023        │
│  • Ejecuta el motor de cálculo académico            │
│  • Coordina múltiples operaciones de BD             │
│  • Llama al Repository para acceder a datos         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  REPOSITORY (repositories/)                         │
│  • Abstrae todas las consultas a la base de datos   │
│  • Usa SQLAlchemy 2.0 async                         │
│  • Nunca contiene lógica de negocio                 │
│  • Retorna modelos SQLAlchemy                       │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  DATABASE (PostgreSQL 15)                           │
└─────────────────────────────────────────────────────┘
```

### 3.2 Estructura del proyecto backend

```
sigera-api/
│
├── app/
│   ├── __init__.py
│   ├── main.py                    ← Punto de entrada FastAPI
│   ├── config.py                  ← Variables de entorno y settings
│   ├── database.py                ← Conexión async a PostgreSQL
│   │
│   ├── models/                    ← Modelos SQLAlchemy (mapean tablas)
│   │   ├── __init__.py
│   │   ├── base.py                ← Clase base con timestamps
│   │   ├── centro_educativo.py
│   │   ├── anio_escolar.py
│   │   ├── periodo_academico.py
│   │   ├── grado.py
│   │   ├── seccion.py
│   │   ├── asignatura.py
│   │   ├── competencia.py
│   │   ├── estudiante.py
│   │   ├── docente.py
│   │   ├── asignacion_docente.py
│   │   ├── calificacion.py        ← calificacion_periodo + competencia
│   │   ├── boletin.py
│   │   ├── usuario.py
│   │   └── auditoria.py
│   │
│   ├── schemas/                   ← Schemas Pydantic (validación y serialización)
│   │   ├── __init__.py
│   │   ├── auth.py                ← LoginRequest, TokenResponse
│   │   ├── estudiante.py          ← EstudianteCreate, EstudianteRead, etc.
│   │   ├── docente.py
│   │   ├── calificacion.py        ← CalificacionUpdate, CalificacionRead
│   │   ├── boletin.py
│   │   ├── reporte.py
│   │   └── common.py              ← Schemas reutilizables (Pagination, etc.)
│   │
│   ├── routers/                   ← Endpoints de la API (FastAPI APIRouter)
│   │   ├── __init__.py
│   │   ├── auth.py                ← POST /auth/login, POST /auth/logout
│   │   ├── configuracion.py       ← Centros, años escolares, períodos
│   │   ├── grados.py              ← Grados y secciones
│   │   ├── asignaturas.py         ← Asignaturas y competencias
│   │   ├── estudiantes.py         ← CRUD de estudiantes
│   │   ├── docentes.py            ← CRUD de docentes y asignaciones
│   │   ├── calificaciones.py      ← Ingreso y consulta de calificaciones
│   │   ├── boletines.py           ← Generación de boletines PDF
│   │   ├── reportes.py            ← Reportes académicos
│   │   ├── usuarios.py            ← Gestión de usuarios y roles
│   │   └── auditoria.py           ← Log de cambios
│   │
│   ├── services/                  ← Lógica de negocio
│   │   ├── __init__.py
│   │   ├── auth_service.py        ← Autenticación y JWT
│   │   ├── estudiante_service.py
│   │   ├── calificacion_service.py ← Motor de cálculo académico
│   │   ├── boletin_service.py     ← Generación de PDFs
│   │   ├── importacion_service.py ← Importación masiva desde Excel
│   │   ├── reporte_service.py     ← Generación de reportes
│   │   └── notificacion_service.py
│   │
│   ├── repositories/              ← Acceso a datos (SQLAlchemy)
│   │   ├── __init__.py
│   │   ├── base_repository.py     ← CRUD genérico
│   │   ├── estudiante_repository.py
│   │   ├── calificacion_repository.py
│   │   ├── docente_repository.py
│   │   ├── seccion_repository.py
│   │   └── reporte_repository.py
│   │
│   ├── core/                      ← Funcionalidades transversales
│   │   ├── __init__.py
│   │   ├── security.py            ← JWT, bcrypt, permisos
│   │   ├── dependencies.py        ← Dependencias FastAPI (get_db, get_current_user)
│   │   ├── exceptions.py          ← Excepciones personalizadas
│   │   └── middleware.py          ← CORS, logging, rate limiting
│   │
│   ├── engine/                    ← Motor de cálculo académico
│   │   ├── __init__.py
│   │   ├── calculo_notas.py       ← Todas las fórmulas de la Ordenanza 04-2023
│   │   ├── calculo_promocion.py   ← Reglas de promoción
│   │   └── calculo_completiva.py  ← Fórmulas de completiva/extraordinaria
│   │
│   ├── templates/                 ← Plantillas HTML para boletines PDF
│   │   ├── boletin_periodo.html
│   │   ├── boletin_final.html
│   │   ├── registro_grado.html
│   │   └── assets/
│   │       ├── boletin.css
│   │       └── logo_minerd.png
│   │
│   └── utils/
│       ├── __init__.py
│       ├── excel.py               ← OpenPyXL: importación y exportación
│       ├── pdf.py                 ← WeasyPrint: generación de PDFs
│       └── validators.py          ← Validadores de negocio reutilizables
│
├── migrations/                    ← Alembic migrations
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── 001_initial_schema.py
│
├── tests/                         ← Pruebas automatizadas
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_calificaciones.py
│   ├── test_motor_calculo.py      ← Pruebas unitarias del motor
│   └── test_boletines.py
│
├── .env                           ← Variables de entorno (no en Git)
├── .env.example                   ← Plantilla de variables
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### 3.3 Ejemplo de implementación — Motor de cálculo

```python
# app/engine/calculo_notas.py

from typing import Optional
from decimal import Decimal, ROUND_HALF_UP


class MotorCalculo:
    """
    Motor de cálculo académico de SIGERA.
    Implementa las reglas de evaluación de la Ordenanza 04-2023.
    """

    NOTA_MINIMA = 70
    NOTA_MAXIMA = 100

    @staticmethod
    def nota_efectiva(nota_periodo: Optional[int],
                      nota_recuperacion: Optional[int]) -> Optional[int]:
        """
        Calcula la nota efectiva de un período.
        Si existe recuperación, devuelve la nota de recuperación (que por regla de negocio
        es la suma de la nota original + el avance, y nunca puede ser menor a la original).
        """
        if nota_periodo is None:
            return None
        if nota_recuperacion is not None:
            # En SIGERA, RPn es complementaria. Si RPn se ingresó, esa es la nota efectiva.
            # La validación de que RPn >= Pn se maneja a nivel de base de datos.
            return nota_recuperacion
        return nota_periodo

    @staticmethod
    def calificacion_final(notas_efectivas: list[Optional[int]]) -> Optional[int]:
        """
        Calcula la calificación final del área.
        Promedio de las notas efectivas de los 4 períodos.
        Solo usa los períodos con datos.
        """
        notas_validas = [n for n in notas_efectivas if n is not None]
        if len(notas_validas) < 2:
            return None
        promedio = sum(notas_validas) / len(notas_validas)
        # Redondeo estándar (0.5 → arriba)
        return int(Decimal(str(promedio)).quantize(
            Decimal('1'), rounding=ROUND_HALF_UP
        ))

    @staticmethod
    def nivel_desempeno(calificacion: Optional[int]) -> str:
        """Determina el nivel de desempeño según la escala de la Ordenanza."""
        if calificacion is None:
            return "SIN_EVALUAR"
        if calificacion >= 89:
            return "DESTACADO"
        if calificacion >= 77:
            return "LOGRADO"
        if calificacion >= 70:
            return "EN_PROCESO"
        return "INSUFICIENTE"

    @staticmethod
    def calificacion_completiva(cf: int, nota_completiva: int) -> int:
        """
        Calcula la calificación completiva.
        Fórmula: 50% CF + 50% nota de completiva.
        """
        resultado = (cf * 0.50) + (nota_completiva * 0.50)
        return int(Decimal(str(resultado)).quantize(
            Decimal('1'), rounding=ROUND_HALF_UP
        ))

    @staticmethod
    def calificacion_extraordinaria(cf: int, nota_extraordinaria: int) -> int:
        """
        Calcula la calificación extraordinaria.
        Fórmula: 30% CF + 70% nota de extraordinaria.
        """
        resultado = (cf * 0.30) + (nota_extraordinaria * 0.70)
        return int(Decimal(str(resultado)).quantize(
            Decimal('1'), rounding=ROUND_HALF_UP
        ))

    @staticmethod
    def calificacion_especial(cf: int, nota_especial: int) -> int:
        """
        Calcula la calificación especial.
        """
        resultado = (cf * 0.30) + (nota_especial * 0.70)
        return int(Decimal(str(resultado)).quantize(
            Decimal('1'), rounding=ROUND_HALF_UP
        ))

    @staticmethod
    def requiere_recuperacion(nota_periodo: Optional[int]) -> bool:
        """Un estudiante requiere recuperación si su nota es menor a 70."""
        if nota_periodo is None:
            return False
        return nota_periodo < MotorCalculo.NOTA_MINIMA

    @staticmethod
    def calcular_todo(p1, rp1, p2, rp2, p3, rp3, p4, rp4) -> dict:
        """
        Calcula todas las notas derivadas de un registro de calificaciones.
        Retorna un diccionario con todos los valores calculados.
        """
        ne1 = MotorCalculo.nota_efectiva(p1, rp1)
        ne2 = MotorCalculo.nota_efectiva(p2, rp2)
        ne3 = MotorCalculo.nota_efectiva(p3, rp3)
        ne4 = MotorCalculo.nota_efectiva(p4, rp4)
        cf  = MotorCalculo.calificacion_final([ne1, ne2, ne3, ne4])

        return {
            "nota_efectiva_p1": ne1,
            "nota_efectiva_p2": ne2,
            "nota_efectiva_p3": ne3,
            "nota_efectiva_p4": ne4,
            "calificacion_final": cf,
            "nivel_desempeno": MotorCalculo.nivel_desempeno(cf),
            "requiere_completiva": cf is not None and cf < MotorCalculo.NOTA_MINIMA,
        }
```

---

## 4. API REST — Diseño de Endpoints

Todas las rutas tienen el prefijo `/api/v1/`.

### 4.1 Autenticación

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `POST` | `/auth/login` | Iniciar sesión, obtiene JWT | Público |
| `POST` | `/auth/logout` | Invalidar token | Autenticado |
| `POST` | `/auth/refresh` | Renovar token de acceso | Autenticado |
| `POST` | `/auth/reset-password` | Solicitar reset de contraseña | Público |
| `PATCH` | `/auth/change-password` | Cambiar contraseña | Autenticado |
| `GET` | `/auth/me` | Obtener datos del usuario actual | Autenticado |

### 4.11 Integración con SIGERD (Sincronización)

Módulo especial para exportar e importar datos con el sistema oficial del MINERD, evitando el doble trabajo docente.

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/sigerd/exportar-calificaciones` | Genera archivo CSV estructurado para importar al SIGERD | Director, Admin |
| `POST` | `/sigerd/importar-estudiantes` | Lee formato SIGERD para matricular estudiantes masivamente | Admin |

### 4.2 Configuración Institucional

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/config/centro` | Obtener datos del centro | Admin, Director |
| `PUT` | `/config/centro` | Actualizar datos del centro | Admin |
| `GET` | `/config/anio-escolar` | Listar años escolares | Admin |
| `POST` | `/config/anio-escolar` | Crear año escolar | Admin |
| `GET` | `/config/anio-escolar/activo` | Obtener año escolar activo | Todos |
| `PATCH` | `/config/anio-escolar/{id}/activar` | Activar un año escolar | Admin |
| `PATCH` | `/config/anio-escolar/{id}/cerrar` | Cerrar el año escolar | Admin |
| `GET` | `/config/periodos` | Listar períodos del año activo | Todos |
| `POST` | `/config/periodos` | Crear período académico | Admin |
| `PATCH` | `/config/periodos/{id}/cerrar` | Cerrar un período | Coordinador, Admin |
| `PATCH` | `/config/periodos/{id}/reabrir` | Reabrir período cerrado | Admin |

### 4.3 Grados y Secciones

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/grados` | Listar grados del año activo | Todos |
| `POST` | `/grados` | Crear grado | Admin |
| `GET` | `/grados/{id}/secciones` | Listar secciones de un grado | Todos |
| `POST` | `/grados/{id}/secciones` | Crear sección | Admin |
| `PUT` | `/secciones/{id}` | Actualizar sección | Admin |
| `GET` | `/secciones/{id}/estudiantes` | Listar estudiantes de la sección | Docente+ |
| `GET` | `/secciones/{id}/estado-calificaciones` | Estado de completitud | Coordinador+ |

### 4.4 Asignaturas y Competencias

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/asignaturas` | Listar todas las asignaturas | Todos |
| `POST` | `/asignaturas` | Crear asignatura | Admin |
| `GET` | `/asignaturas/{id}/competencias` | Competencias de una asignatura | Todos |
| `POST` | `/asignaturas/{id}/competencias` | Agregar competencia | Admin |
| `PUT` | `/competencias/{id}` | Actualizar competencia | Admin |
| `GET` | `/grados/{id}/asignaturas` | Asignaturas de un grado | Todos |
| `POST` | `/grados/{id}/asignaturas` | Asignar asignatura a grado | Admin |

### 4.5 Estudiantes

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/estudiantes` | Listar estudiantes (con filtros) | Admin, Coordinador |
| `POST` | `/estudiantes` | Registrar un estudiante | Admin |
| `GET` | `/estudiantes/{id}` | Obtener estudiante por ID | Admin, Coordinador |
| `PUT` | `/estudiantes/{id}` | Actualizar datos del estudiante | Admin |
| `PATCH` | `/estudiantes/{id}/estado` | Cambiar estado (retirar/transferir) | Admin |
| `GET` | `/estudiantes/{id}/calificaciones` | Historial de calificaciones | Admin, Coordinador |
| `GET` | `/estudiantes/{id}/boletin` | Generar boletín individual | Docente+ |
| `POST` | `/estudiantes/importar` | Importación masiva desde Excel | Admin |
| `GET` | `/estudiantes/plantilla-excel` | Descargar plantilla de importación | Admin |

### 4.6 Docentes y Asignaciones

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/docentes` | Listar docentes | Admin, Coordinador |
| `POST` | `/docentes` | Registrar docente | Admin |
| `GET` | `/docentes/{id}` | Obtener docente por ID | Admin |
| `PUT` | `/docentes/{id}` | Actualizar docente | Admin |
| `GET` | `/docentes/{id}/asignaciones` | Ver carga académica del docente | Admin, Coordinador |
| `POST` | `/docentes/{id}/asignaciones` | Asignar grado/sección/asignatura | Admin |
| `DELETE` | `/asignaciones/{id}` | Eliminar asignación | Admin |
| `GET` | `/docentes/mis-asignaciones` | Mis asignaciones (para el docente) | Docente |

### 4.7 Calificaciones (endpoints más críticos)

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/calificaciones` | Tabla de calificaciones con filtros | Docente+ |
| `GET` | `/calificaciones/seccion/{seccion_id}/asignatura/{asig_id}/periodo/{num}` | Tabla de calificaciones para el docente | Docente |
| `PUT` | `/calificaciones/{id}` | Actualizar calificaciones de un registro | Docente, Admin |
| `PATCH` | `/calificaciones/{id}/nota-periodo` | Actualizar nota de un período específico | Docente |
| `PATCH` | `/calificaciones/{id}/nota-recuperacion` | Actualizar nota de recuperación | Docente |
| `PATCH` | `/calificaciones/{id}/completiva` | Ingresar nota de completiva (50% CF + 50% CEC) | Docente, Coordinador |
| `PATCH` | `/calificaciones/{id}/extraordinaria` | Ingresar nota de extraordinaria (30% CF + 70% CEX) | Docente, Coordinador |
| `PATCH` | `/calificaciones/{id}/especial` | Ingresar nota de evaluación especial | Docente, Coordinador |
| `GET` | `/calificaciones/{id}/asistencia` | Obtener control de asistencia del estudiante | Docente, Coordinador |
| `POST` | `/calificaciones/{id}/recalcular` | Forzar recálculo de notas derivadas | Admin |
| `GET` | `/calificaciones/{id}/historial` | Ver historial de cambios | Coordinador, Admin |
| `GET` | `/calificaciones/competencias/seccion/{id}/periodo/{num}` | Notas por competencia | Docente |
| `PUT` | `/calificaciones/competencias/bulk` | Guardar múltiples notas de competencia | Docente |

### 4.8 Boletines

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `POST` | `/boletines/generar/individual` | Generar PDF boletín individual | Docente+ |
| `POST` | `/boletines/generar/seccion` | Generar PDF boletines de sección | Docente+ |
| `POST` | `/boletines/generar/grado` | Generar PDF boletines de grado | Coordinador+ |
| `GET` | `/boletines/historial/{estudiante_id}` | Historial de boletines del estudiante | Admin, Coordinador |
| `GET` | `/boletines/{id}/descargar` | Descargar PDF de boletín generado | Todos |
| `POST` | `/boletines/observacion` | Guardar observación del docente | Docente |

### 4.9 Reportes

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/reportes/dashboard` | Indicadores del dashboard principal | Todos (filtrado por rol) |
| `GET` | `/reportes/rendimiento-general` | Promedio y situación por grado/sección | Coordinador+ |
| `GET` | `/reportes/aprobados` | Lista de aprobados con filtros | Coordinador+ |
| `GET` | `/reportes/en-recuperacion` | Estudiantes en recuperación | Coordinador+ |
| `GET` | `/reportes/reprobados` | Estudiantes reprobados | Coordinador+ |
| `GET` | `/reportes/honor-roll` | Estudiantes destacados | Coordinador+ |
| `GET` | `/reportes/riesgo-academico` | Estudiantes en riesgo | Coordinador+ |
| `GET` | `/reportes/por-docente` | Rendimiento por docente | Director, Admin |
| `GET` | `/reportes/por-asignatura` | Comparativo por asignatura | Coordinador+ |
| `GET` | `/reportes/completiva` | Lista de completiva | Coordinador+ |
| `GET` | `/reportes/extraordinaria` | Lista de extraordinaria | Coordinador+ |
| `GET` | `/reportes/exportar/excel` | Exportar reporte a Excel | Coordinador+ |
| `GET` | `/reportes/exportar/power-bi` | Dataset para Power BI (CSV/JSON) | Admin, Director |

### 4.10 Usuarios y Seguridad

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/usuarios` | Listar usuarios del sistema | Admin |
| `POST` | `/usuarios` | Crear usuario | Admin |
| `PUT` | `/usuarios/{id}` | Actualizar usuario | Admin |
| `PATCH` | `/usuarios/{id}/activar` | Activar/desactivar usuario | Admin |
| `POST` | `/usuarios/{id}/reset-password` | Forzar reset de contraseña | Admin |
| `GET` | `/auditoria` | Ver log de auditoría | Admin, Coordinador |

### 4.11 Integración con SIGERD (Sincronización)

Módulo especial para exportar e importar datos con el sistema oficial del MINERD, evitando el doble trabajo docente.

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/sigerd/exportar-calificaciones` | Genera archivo CSV estructurado para importar al SIGERD | Director, Admin |
| `POST` | `/sigerd/importar-estudiantes` | Lee formato SIGERD para matricular estudiantes masivamente | Admin |

---

## 5. Sistema de Autenticación y Autorización

### 5.1 Flujo de autenticación JWT

```
FLUJO DE LOGIN
─────────────────────────────────────────────────────────────────

1. El usuario ingresa correo + contraseña en el frontend.

2. El frontend hace POST /api/v1/auth/login con:
   {
     "correo": "usuario@centro.edu.do",
     "password": "mi_contraseña"
   }

3. El backend:
   a. Busca el usuario por correo en la tabla `usuario`
   b. Verifica la contraseña con bcrypt.verify()
   c. Si es válido, genera dos tokens:
      • ACCESS_TOKEN  (expira en 60 minutos)
      • REFRESH_TOKEN (expira en 7 días)
   d. Registra el último acceso en la tabla `usuario`
   e. Retorna:
      {
        "access_token": "eyJhbGc...",
        "refresh_token": "eyJhbGc...",
        "token_type": "bearer",
        "expires_in": 3600,
        "usuario": {
          "id": 1,
          "nombre": "Ana García",
          "correo": "ana@centro.edu.do",
          "roles": ["DOCENTE"],
          "centro_id": 1
        }
      }

4. El frontend guarda los tokens:
   • access_token  → memoria (variable de Zustand)
   • refresh_token → httpOnly cookie (más seguro)

5. En cada request posterior, el frontend incluye:
   Authorization: Bearer {access_token}

6. Cuando el access_token expira (60 min):
   • El frontend detecta el error 401
   • Automáticamente hace POST /auth/refresh con el refresh_token
   • Obtiene un nuevo access_token
   • Reintenta el request original

7. Si el refresh_token también expiró:
   • El usuario es redirigido a la pantalla de login
```

### 5.2 Estructura del JWT payload

```json
{
  "sub": "1",
  "correo": "ana@centro.edu.do",
  "nombre": "Ana García",
  "roles": ["DOCENTE"],
  "centro_id": 1,
  "iat": 1754440000,
  "exp": 1754443600
}
```

### 5.3 Sistema de autorización por rol (RBAC)

```python
# app/core/security.py

from fastapi import Depends, HTTPException, status
from app.core.dependencies import get_current_user
from app.models.usuario import Usuario

def require_roles(*roles: str):
    """
    Decorador de FastAPI para proteger endpoints por rol.
    Uso: @require_roles("ADMINISTRADOR", "COORDINADOR")
    """
    def role_checker(current_user: Usuario = Depends(get_current_user)):
        user_roles = {r.nombre for r in current_user.roles}
        if not user_roles.intersection(set(roles)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta acción."
            )
        return current_user
    return Depends(role_checker)


# Uso en un router:
@router.patch("/{id}/cerrar")
async def cerrar_periodo(
    id: int,
    db: AsyncSession = Depends(get_db),
    _: Usuario = require_roles("ADMINISTRADOR", "COORDINADOR")
):
    ...
```

### 5.4 Validación de acceso a recursos propios del docente

```python
# Los docentes solo pueden ver/editar sus propias asignaciones

async def verificar_acceso_docente(
    seccion_id: int,
    asignatura_id: int,
    current_user: Usuario,
    db: AsyncSession
) -> bool:
    """
    Verifica que el docente tenga una asignación activa
    para la sección y asignatura solicitada.
    """
    if "ADMINISTRADOR" in [r.nombre for r in current_user.roles]:
        return True  # Los admins tienen acceso total

    asignacion = await AsignacionRepository.get_by_docente_seccion_asignatura(
        db=db,
        docente_id=current_user.docente_id,
        seccion_id=seccion_id,
        asignatura_id=asignatura_id
    )
    if not asignacion:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes asignación para esta sección y asignatura."
        )
    return True
```

### 5.5 Privacidad de Datos y Protección de Menores
Estrategia de encriptación y cumplimiento normativo para proteger datos estudiantiles.

---

## 6. Arquitectura del Frontend

### 6.1 Estructura de carpetas del frontend

```
sigera-web/
│
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── logo-sigera.svg
│
├── src/
│   ├── main.tsx                   ← Punto de entrada React
│   ├── App.tsx                    ← Router principal
│   │
│   ├── api/                       ← Capa de comunicación con el backend
│   │   ├── axios.ts               ← Instancia de Axios con interceptores JWT
│   │   ├── auth.api.ts
│   │   ├── calificaciones.api.ts  ← Todos los endpoints de calificaciones
│   │   ├── estudiantes.api.ts
│   │   ├── docentes.api.ts
│   │   ├── boletines.api.ts
│   │   └── reportes.api.ts
│   │
│   ├── store/                     ← Estado global (Zustand)
│   │   ├── auth.store.ts          ← Usuario actual, token, rol
│   │   ├── ui.store.ts            ← Sidebar, modales, notificaciones
│   │   └── anio.store.ts          ← Año escolar y período activo
│   │
│   ├── hooks/                     ← Custom hooks de React Query
│   │   ├── useCalificaciones.ts
│   │   ├── useEstudiantes.ts
│   │   ├── useReportes.ts
│   │   └── useBoletines.ts
│   │
│   ├── pages/                     ← Páginas del sistema (una por ruta)
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── calificaciones/
│   │   │   ├── CalificacionesPage.tsx      ← Selector de asig/secc/período
│   │   │   ├── TablaCalificaciones.tsx     ← La tabla principal del docente
│   │   │   └── VistaRegistroCompleto.tsx   ← Vista de todo el año
│   │   ├── estudiantes/
│   │   │   ├── EstudiantesPage.tsx
│   │   │   ├── EstudianteFormPage.tsx
│   │   │   └── EstudiantePerfilPage.tsx
│   │   ├── docentes/
│   │   │   ├── DocentesPage.tsx
│   │   │   └── DocenteFormPage.tsx
│   │   ├── boletines/
│   │   │   └── BoletinesPage.tsx
│   │   ├── reportes/
│   │   │   └── ReportesPage.tsx
│   │   ├── configuracion/
│   │   │   ├── ConfiguracionPage.tsx
│   │   │   ├── AnioEscolarPage.tsx
│   │   │   └── UsuariosPage.tsx
│   │   └── auditoria/
│   │       └── AuditoriaPage.tsx
│   │
│   ├── components/                ← Componentes reutilizables
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      ← Layout principal con sidebar
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── ProtectedRoute.tsx ← Protección de rutas por rol
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx          ← Badges de nivel de desempeño
│   │   │   ├── Alert.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Pagination.tsx
│   │   ├── calificaciones/
│   │   │   ├── CeldaCalificacion.tsx   ← Celda editable con validación
│   │   │   ├── CeldaRecuperacion.tsx   ← Celda de recuperación (condicional)
│   │   │   ├── FilaEstudiante.tsx      ← Fila completa en la tabla
│   │   │   ├── ResumenSeccion.tsx      ← Tarjetas de resumen abajo de la tabla
│   │   │   └── SemafороCompletitud.tsx ← Estado de completitud (verde/amarillo/rojo)
│   │   ├── dashboard/
│   │   │   ├── TarjetaMetrica.tsx     ← Las tarjetas con números grandes
│   │   │   ├── BarraRendimiento.tsx   ← Barra de rendimiento por grado
│   │   │   └── AlertaRiesgo.tsx
│   │   └── boletines/
│   │       ├── PreviewBoletin.tsx     ← Preview del boletín antes de generar
│   │       └── FormGenerarBoletin.tsx
│   │
│   ├── types/                     ← Interfaces TypeScript
│   │   ├── calificacion.types.ts
│   │   ├── estudiante.types.ts
│   │   ├── auth.types.ts
│   │   └── common.types.ts
│   │
│   ├── utils/                     ← Utilidades
│   │   ├── formatters.ts          ← Formatear nombres, fechas, notas
│   │   ├── validators.ts          ← Validaciones en el cliente
│   │   └── constants.ts           ← Constantes (nota mínima, colores, etc.)
│   │
│   └── styles/
│       ├── globals.css
│       └── tabla-calificaciones.css  ← Estilos específicos de la tabla
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── Dockerfile
```

### 6.2 Gestión de estado con Zustand

```typescript
// src/store/auth.store.ts

interface AuthState {
  usuario: Usuario | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  hasRole: (role: string) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  usuario: null,
  accessToken: null,
  isAuthenticated: false,

  login: async (credentials) => {
    const response = await authApi.login(credentials)
    set({
      usuario: response.usuario,
      accessToken: response.access_token,
      isAuthenticated: true,
    })
  },

  logout: () => {
    set({ usuario: null, accessToken: null, isAuthenticated: false })
  },

  hasRole: (role) => {
    const { usuario } = get()
    return usuario?.roles.includes(role) ?? false
  },
}))
```

### 6.3 Componente CeldaCalificacion — El más crítico

```typescript
// src/components/calificaciones/CeldaCalificacion.tsx

interface CeldaCalificacionProps {
  valor: number | null
  onChange: (valor: number | null) => void
  periodoAbierto: boolean
  esRecuperacion?: boolean
  notaPeriodo?: number | null  // Necesario para habilitar recuperación
}

const CeldaCalificacion: React.FC<CeldaCalificacionProps> = ({
  valor, onChange, periodoAbierto, esRecuperacion, notaPeriodo
}) => {
  // La celda de recuperación solo se habilita si nota del período < 70
  const habilitada = periodoAbierto && (
    !esRecuperacion || (notaPeriodo !== null && notaPeriodo < 70)
  )

  const colorClase = valor === null
    ? 'bg-gray-50 text-gray-400'
    : valor >= 77 ? 'bg-green-50 text-green-800'
    : valor >= 70 ? 'bg-yellow-50 text-yellow-800'
    : 'bg-red-50 text-red-800 font-bold'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '') { onChange(null); return }
    const num = parseInt(raw)
    if (!isNaN(num) && num >= 0 && num <= 100) {
      onChange(num)
    }
  }

  if (!habilitada) {
    return (
      <td className={`text-center px-2 py-1 ${colorClase}`}>
        {valor ?? (esRecuperacion ? '—' : '')}
        {valor !== null && valor < 70 && !esRecuperacion && (
          <span className="ml-1 text-red-500">⚠</span>
        )}
      </td>
    )
  }

  return (
    <td className={`p-0 ${colorClase}`}>
      <input
        type="number"
        min={0}
        max={100}
        value={valor ?? ''}
        onChange={handleChange}
        className={`w-full text-center px-2 py-1 bg-transparent
                   focus:outline-none focus:ring-2 focus:ring-blue-400`}
      />
    </td>
  )
}
```

---

## 7. Comunicación Frontend ↔ Backend

### 7.1 Configuración de Axios con interceptores JWT

```typescript
// src/api/axios.ts

import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor de request: agrega el JWT a cada solicitud
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de response: maneja expiración del token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si es 401 y no es un retry, intentar refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const newToken = await authApi.refreshToken()
        useAuthStore.getState().setAccessToken(newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

### 7.2 Formato estándar de respuestas del API

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación completada exitosamente",
  "timestamp": "2026-08-06T03:00:00Z"
}
```

**Respuesta de lista paginada:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 487,
    "pagina": 1,
    "por_pagina": 25,
    "paginas_totales": 20
  }
}
```

**Respuesta de error:**
```json
{
  "success": false,
  "error": {
    "codigo": "PERIODO_CERRADO",
    "mensaje": "No puedes editar calificaciones de un período cerrado.",
    "campo": null
  },
  "timestamp": "2026-08-06T03:00:00Z"
}
```

**Error de validación (422):**
```json
{
  "success": false,
  "error": {
    "codigo": "VALIDACION_FALLIDA",
    "mensaje": "Algunos campos tienen valores inválidos.",
    "campos": [
      { "campo": "nota_p1", "error": "La nota debe estar entre 0 y 100." }
    ]
  }
}
```

---

## 8. Generación de PDFs

### 8.1 Flujo de generación de boletines

```
FRONTEND                          BACKEND
─────────                         ────────
Usuario hace clic en              POST /boletines/generar/individual
"Generar Boletín"     ──────────► {
                                    "estudiante_seccion_id": 42,
                                    "periodo_numero": 2,
                                    "incluir_observaciones": true
                                  }
                                         │
                                         ▼
                                  BoletiнService.generar(...)
                                         │
                                         ├─ Obtiene datos del centro
                                         ├─ Obtiene datos del estudiante
                                         ├─ Obtiene calificaciones de todos los períodos
                                         ├─ Calcula promedios
                                         ├─ Obtiene observaciones del docente
                                         │
                                         ▼
                                  Jinja2 renderiza boletin_periodo.html
                                  con todos los datos
                                         │
                                         ▼
                                  WeasyPrint convierte HTML → PDF
                                         │
                                         ▼
                                  Guarda PDF en /media/boletines/
                                  Registra en tabla `boletin`
                                         │
                      ◄──────────        │
{                                        │
  "boletin_id": 88,                      │
  "url_descarga": "/boletines/88/descargar"
}
                                         │
Usuario descarga o                GET /boletines/88/descargar
previsualiza el PDF ◄──────────── Retorna el archivo PDF con
                                  Content-Type: application/pdf
```

### 8.2 Plantilla HTML del boletín

```html
<!-- app/templates/boletin_periodo.html -->
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="boletin.css">
  <title>Boletín — {{ estudiante.nombre_completo }}</title>
</head>
<body>
  <!-- ENCABEZADO DEL CENTRO -->
  <header class="centro-header">
    <img src="{{ logo_minerd }}" alt="MINERD" class="logo">
    <div class="info-centro">
      <h2>{{ centro.nombre }}</h2>
      <p>Regional: {{ centro.regional }} | Distrito: {{ centro.distrito }}</p>
      <p>Código: {{ centro.codigo_minerd }} | Año Escolar: {{ anio.descripcion }}</p>
    </div>
  </header>

  <!-- DATOS DEL ESTUDIANTE -->
  <section class="datos-estudiante">
    <table>
      <tr>
        <td><strong>Estudiante:</strong> {{ estudiante.nombre_completo }}</td>
        <td><strong>RNE:</strong> {{ estudiante.rne }}</td>
      </tr>
      <tr>
        <td><strong>Grado:</strong> {{ grado.nombre }}</td>
        <td><strong>Sección:</strong> {{ seccion.nombre }}</td>
      </tr>
      <tr>
        <td><strong>N.º de Orden:</strong> {{ estudiante_seccion.numero_orden }}</td>
        <td><strong>Período:</strong> {{ periodo.nombre }}</td>
      </tr>
    </table>
  </section>

  <!-- TABLA DE CALIFICACIONES -->
  <section class="calificaciones">
    <table class="tabla-notas">
      <thead>
        <tr>
          <th>Asignatura</th>
          <th>P1</th><th>P2</th><th>P3</th><th>P4</th>
          <th>CF</th><th>Comp.</th><th>Ext.</th><th>Situación</th>
        </tr>
      </thead>
      <tbody>
        {% for asig in calificaciones %}
        <tr class="{{ 'reprobado' if asig.situacion == 'REPROBADO' else '' }}">
          <td>{{ asig.nombre }}</td>
          <td>{{ asig.p1 or '—' }}</td>
          <td>{{ asig.p2 or '—' }}</td>
          <td>{{ asig.p3 or '—' }}</td>
          <td>{{ asig.p4 or '—' }}</td>
          <td><strong>{{ asig.cf or '—' }}</strong></td>
          <td>{{ asig.completiva or '—' }}</td>
          <td>{{ asig.extraordinaria or '—' }}</td>
          <td>
            <span class="badge-{{ asig.situacion | lower }}">
              {{ asig.situacion_display }}
            </span>
          </td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </section>

  <!-- OBSERVACIONES Y FIRMAS -->
  <section class="footer-boletin">
    <div class="observaciones">
      <strong>Observaciones:</strong>
      <p>{{ observacion or 'Sin observaciones.' }}</p>
    </div>
    <div class="firmas">
      <div class="firma">
        <div class="linea-firma"></div>
        <p>Firma del Docente</p>
      </div>
      <div class="firma">
        <div class="linea-firma"></div>
        <p>Firma del Director</p>
      </div>
      <div class="firma">
        <div class="linea-firma"></div>
        <p>Firma del Representante</p>
      </div>
    </div>
  </section>
</body>
</html>
```

---

## 9. Manejo de Errores

### 9.1 Códigos de error personalizados de SIGERA

| Código | HTTP | Descripción |
|---|---|---|
| `CREDENCIALES_INVALIDAS` | 401 | Usuario o contraseña incorrectos |
| `TOKEN_EXPIRADO` | 401 | El JWT de acceso expiró |
| `SIN_PERMISO` | 403 | El rol no tiene acceso a este recurso |
| `ACCESO_DENEGADO_DOCENTE` | 403 | El docente no tiene asignación para esta sección |
| `NO_ENCONTRADO` | 404 | El recurso solicitado no existe |
| `PERIODO_CERRADO` | 409 | No se pueden editar calificaciones de un período cerrado |
| `ANIO_CERRADO` | 409 | El año escolar ya fue cerrado |
| `NOTA_FUERA_DE_RANGO` | 422 | La nota no está en el rango permitido |
| `RNE_DUPLICADO` | 409 | Ya existe un estudiante con ese RNE |
| `ASIGNACION_DUPLICADA` | 409 | Esa sección/asignatura ya tiene un docente |
| `PERIODO_INCOMPLETO` | 409 | No se puede cerrar un período con registros incompletos |
| `IMPORTACION_FALLIDA` | 422 | El archivo Excel tiene errores (retorna lista de errores) |
| `ERROR_GENERACION_PDF` | 500 | Error interno al generar el boletín |

### 9.2 Handler global de excepciones (FastAPI)

```python
# app/core/exceptions.py

from fastapi import Request
from fastapi.responses import JSONResponse

class SigeraException(Exception):
    def __init__(self, codigo: str, mensaje: str,
                 status_code: int = 400, campo: str = None):
        self.codigo = codigo
        self.mensaje = mensaje
        self.status_code = status_code
        self.campo = campo

async def sigera_exception_handler(
    request: Request,
    exc: SigeraException
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "codigo": exc.codigo,
                "mensaje": exc.mensaje,
                "campo": exc.campo
            }
        }
    )
```

---

## 10. Variables de Entorno y Configuración

### 10.1 Backend — `.env.example`

```env
# ══════════════════════════════════════
# SIGERA API — Variables de entorno
# ══════════════════════════════════════

# Base de datos
DATABASE_URL=postgresql+asyncpg://sigera_user:password@localhost:5432/sigera_db
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20

# JWT
JWT_SECRET_KEY=cambia-esto-por-una-clave-segura-de-64-chars
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Aplicación
APP_NAME=SIGERA
APP_VERSION=1.0.0
DEBUG=False
ALLOWED_ORIGINS=https://sigera.tucentro.edu.do,http://localhost:5173

# Archivos
MEDIA_DIR=/app/media
MAX_UPLOAD_SIZE_MB=10

# Correo (para reset de contraseñas)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sigera@tucentro.edu.do
SMTP_PASSWORD=tu_app_password
EMAIL_FROM=SIGERA <sigera@tucentro.edu.do>

# Entorno
ENVIRONMENT=production
LOG_LEVEL=INFO
```

### 10.2 Frontend — `.env.example`

```env
# ══════════════════════════════════════
# SIGERA Web — Variables de entorno
# ══════════════════════════════════════

VITE_API_URL=https://sigera.tucentro.edu.do
VITE_APP_NAME=SIGERA
VITE_APP_VERSION=1.0.0
```

---

## 11. Arquitectura de Despliegue

### 11.1 Docker Compose

```yaml
# docker-compose.yml
version: '3.9'

services:
  # Base de datos PostgreSQL
  sigera-db:
    image: postgres:15-alpine
    container_name: sigera-db
    environment:
      POSTGRES_DB: sigera_db
      POSTGRES_USER: sigera_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - sigera_postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sigera_user -d sigera_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend FastAPI
  sigera-api:
    build:
      context: ./sigera-api
      dockerfile: Dockerfile
    container_name: sigera-api
    env_file: ./sigera-api/.env
    volumes:
      - sigera_media:/app/media
    ports:
      - "8000:8000"
    depends_on:
      sigera-db:
        condition: service_healthy
    restart: unless-stopped
    command: >
      sh -c "alembic upgrade head &&
             uvicorn app.main:app --host 0.0.0.0 --port 8000"

  # Frontend React + Nginx
  sigera-web:
    build:
      context: ./sigera-web
      dockerfile: Dockerfile
    container_name: sigera-web
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl  # Certificados SSL
    depends_on:
      - sigera-api
    restart: unless-stopped

volumes:
  sigera_postgres_data:
  sigera_media:
```

### 11.2 Diagrama de despliegue

```
INTERNET
    │
    ▼
┌───────────────────────────────────────────────────────┐
│  SERVIDOR VPS / NUBE                                  │
│  (Ubuntu 22.04 LTS, mínimo 2 vCPU, 4 GB RAM)         │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Docker Host                                    │  │
│  │                                                 │  │
│  │  [sigera-web: Nginx]                            │  │
│  │   • Puerto 443 (HTTPS) ←── Navegador del usuario│  │
│  │   • Puerto 80  (HTTP → redirect a 443)          │  │
│  │   • Sirve el build de React                     │  │
│  │   • Proxy /api/v1/* → sigera-api:8000           │  │
│  │                │                                │  │
│  │                ▼                                │  │
│  │  [sigera-api: FastAPI + Uvicorn]                │  │
│  │   • Puerto 8000 (interno, no expuesto al WAN)   │  │
│  │   • Procesa requests de la API                  │  │
│  │   • Genera PDFs y Excel                         │  │
│  │                │                                │  │
│  │                ▼                                │  │
│  │  [sigera-db: PostgreSQL]                        │  │
│  │   • Puerto 5432 (interno, no expuesto al WAN)   │  │
│  │   • Volumen persistente en disco                │  │
│  │                                                 │  │
│  │  [/media/] ← Volumen compartido                 │  │
│  │   • PDFs generados                              │  │
│  │   • Archivos subidos                            │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

### 11.3 Requisitos mínimos del servidor

| Recurso | Mínimo (Etapa 1) | Recomendado (Etapas 1-3) |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Almacenamiento | 40 GB SSD | 100 GB SSD |
| Sistema Operativo | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Ancho de banda | 100 Mbps | 1 Gbps |

---

## 12. Estructura de Carpetas del Proyecto (Raíz)

```
sigera/                            ← Raíz del proyecto
│
├── sigera-api/                    ← Backend (Python / FastAPI)
│   ├── app/
│   ├── migrations/
│   ├── tests/
│   ├── .env
│   ├── requirements.txt
│   └── Dockerfile
│
├── sigera-web/                    ← Frontend (React / TypeScript)
│   ├── src/
│   ├── public/
│   ├── .env
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── docs/                          ← Documentación del proyecto
│   ├── SIGERA_DAF_Cap1_Vision_General.md
│   ├── SIGERA_DAF_Cap2_Arquitectura_Negocio.md
│   ├── SIGERA_DAF_Cap3_Arquitectura_Funcional.md
│   ├── SIGERA_DAF_Cap4_Arquitectura_Datos.md
│   └── SIGERA_DAF_Cap5_Arquitectura_Software.md
│
├── docker-compose.yml             ← Orquestación de contenedores
├── nginx.conf                     ← Configuración de Nginx
├── .gitignore
└── README.md
```

---

## Resumen del Capítulo 5

| Elemento | Detalle |
|---|---|
| Capas de arquitectura | 4: Cliente → Nginx → FastAPI → PostgreSQL |
| Tecnologías definidas | 16 (backend + frontend + infra) |
| Endpoints de la API | 60+ organizados en 10 grupos |
| Patrones de diseño | Router → Service → Repository |
| Sistema de autenticación | JWT con access token (60min) + refresh token (7 días) |
| Sistema de autorización | RBAC con decorator `require_roles()` |
| Componentes React clave | `CeldaCalificacion`, `FilaEstudiante`, `TablaCalificaciones` |
| Generación de PDF | WeasyPrint: HTML + CSS → PDF formato MINERD |
| Códigos de error | 13 códigos personalizados de SIGERA |
| Contenedores Docker | 3: sigera-db, sigera-api, sigera-web |

---

## Historial de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| 1.0 | Agosto 2026 | Equipo SIGERA | Primera versión del Capítulo 5 |

---

*Este documento forma parte del Documento de Arquitectura Funcional (DAF) de SIGERA.*

**Capítulo anterior:** [Capítulo 4 — Arquitectura de Datos](./SIGERA_DAF_Cap4_Arquitectura_Datos.md)  
**Siguiente capítulo:** [Capítulo 6 — Reportes y Power BI](./SIGERA_DAF_Cap6_Reportes_PowerBI.md)

---
*© 2026 SIGERA — Todos los derechos reservados*
