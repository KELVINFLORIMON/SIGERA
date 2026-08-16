# SIGERA
## Sistema Inteligente de Gestión Educativa y Rendimiento Académico
### Documento de Arquitectura Funcional (DAF)
#### Capítulo 4 — Arquitectura de Datos

---

**Versión:** 1.0  
**Fecha:** Agosto 2026  
**Estado:** Borrador para revisión  
**Referencia anterior:** [Capítulo 3 — Arquitectura Funcional](./SIGERA_DAF_Cap3_Arquitectura_Funcional.md)

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Modelo Conceptual](#2-modelo-conceptual)
3. [Diagrama Entidad-Relación](#3-diagrama-entidad-relación)
4. [Modelo Lógico — Descripción de tablas](#4-modelo-lógico--descripción-de-tablas)
5. [Modelo Físico — SQL PostgreSQL](#5-modelo-físico--sql-postgresql)
6. [Diccionario de Datos](#6-diccionario-de-datos)
7. [Catálogos y Valores Predefinidos](#7-catálogos-y-valores-predefinidos)
8. [Índices de Rendimiento](#8-índices-de-rendimiento)
9. [Restricciones de Integridad](#9-restricciones-de-integridad)
10. [Estrategia de Migración e Importación](#10-estrategia-de-migración-e-importación)

---

## 1. Introducción

Este capítulo define el **modelo de datos completo de SIGERA**. La base de datos es el corazón del sistema: todos los procesos académicos, cálculos y reportes dependen de su correcta estructuración.

### 1.1 Principios de diseño de la base de datos

| Principio | Aplicación |
|---|---|
| **Normalización** | Todas las tablas en Tercera Forma Normal (3FN) para eliminar redundancia |
| **Integridad referencial** | Llaves foráneas con ON DELETE RESTRICT para proteger datos históricos |
| **Trazabilidad** | Toda tabla incluye `created_at`, `updated_at` y `created_by` |
| **Inmutabilidad histórica** | Las calificaciones de períodos cerrados no pueden modificarse directamente |
| **Separación por año** | Todos los datos académicos están vinculados a un año escolar (`anio_escolar_id`) |
| **Escalabilidad** | El diseño permite agregar múltiples centros educativos en el futuro (multi-tenant) |

### 1.2 Motor de base de datos

**PostgreSQL 15+** — Justificación:
- Soporte completo de restricciones de integridad y transacciones ACID.
- Tipos de datos avanzados: `NUMERIC`, `DATE`, `TIMESTAMPTZ`, `ENUM`.
- Vistas materializadas para reportes de alto rendimiento.
- JSON nativo para almacenar configuraciones flexibles.
- Extensión `pgcrypto` para seguridad.

### 1.3 Convenciones de nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Nombres de tablas | Singular, snake_case, minúsculas | `estudiante`, `calificacion_periodo` |
| Llaves primarias | `id` (BIGSERIAL) | `id BIGSERIAL PRIMARY KEY` |
| Llaves foráneas | `{tabla_referenciada}_id` | `estudiante_id`, `asignatura_id` |
| Campos booleanos | Prefijo `es_` o `tiene_` | `es_activo`, `tiene_condicion_medica` |
| Campos de fecha/hora | Sufijo `_en` o `_at` | `creado_en`, `cerrado_en` |
| Índices | `idx_{tabla}_{campo}` | `idx_calificacion_periodo_estudiante` |
| Restricciones UNIQUE | `uq_{tabla}_{campo}` | `uq_estudiante_rne` |

---

## 2. Modelo Conceptual

### 2.1 Entidades principales

El modelo conceptual identifica las entidades del negocio antes de pensar en tablas.

```
ENTIDADES PRINCIPALES:
─────────────────────────────────────────────────────────────

  INSTITUCIONAL          ACADÉMICO               EVALUACIÓN
  ─────────────          ─────────               ──────────
  Centro Educativo       Año Escolar             Calificación Período
  Regional               Período Académico       Calificación Efectiva
  Distrito               Grado                   Recuperación Pedagógica
                         Sección                 Calificación Final
                         Asignatura              Evaluación Completiva
  PERSONAS               Competencia             Evaluación Extraordinaria
  ────────               Asignación Docente      Situación Final
  Estudiante
  Docente                CONFIGURACIÓN           SEGURIDAD
  Padre/Tutor            Competencias por        Usuario
  Usuario                Asignatura              Rol
                         Grado-Asignatura        Permiso
                                                 Auditoría
```

### 2.2 Relaciones conceptuales clave

| Relación | Cardinalidad | Descripción |
|---|---|---|
| Centro → Año Escolar | 1:N | Un centro puede tener muchos años escolares |
| Año Escolar → Grado | 1:N | Un año escolar tiene varios grados |
| Grado → Sección | 1:N | Un grado tiene varias secciones |
| Sección → Estudiante | 1:N | Una sección tiene muchos estudiantes |
| Sección → Asignación Docente | 1:N | Una sección puede tener un docente por asignatura |
| Docente → Asignación | 1:N | Un docente puede tener muchas asignaciones |
| Asignatura → Competencia | 1:N | Una asignatura tiene varias competencias específicas |
| Estudiante + Asignatura + Período → Calificación | N:M:M | La calificación es la intersección de estas tres entidades |

---

## 3. Diagrama Entidad-Relación

```
╔══════════════════════════════════════════════════════════════════════════╗
║                  ERD SIMPLIFICADO — SIGERA                             ║
╚══════════════════════════════════════════════════════════════════════════╝

  ┌─────────────┐       ┌──────────────────┐       ┌──────────────┐
  │   centro    │──1:N──│   anio_escolar   │──1:N──│   periodo    │
  │  educativo  │       │                  │       │  academico   │
  └─────────────┘       └────────┬─────────┘       └──────────────┘
                                 │ 1:N
                                 ▼
                         ┌───────────────┐
                         │     grado     │──1:N──┌──────────────┐
                         └───────────────┘       │   seccion    │
                                                 └──────┬───────┘
                                                        │
                              ┌─────────────────────────┤
                              │ N:1                     │ 1:N
                              ▼                         ▼
                     ┌─────────────────┐       ┌──────────────────┐
                     │   estudiante    │       │ asignacion_      │
                     │                │       │ docente          │
                     └────────┬────────┘       └────────┬─────────┘
                              │                         │ N:1
                              │                         ▼
                              │                ┌─────────────────┐
                              │                │    docente      │
                              │                └─────────────────┘
                              │
                              │                ┌─────────────────┐
                              │                │   asignatura    │──1:N──┐
                              │                └────────┬────────┘       │
                              │                         │ 1:N            │
                              │                         ▼                │
                              │                ┌─────────────────┐       │
                              │                │   competencia   │       │
                              │                │  especifica     │       │
                              │                └─────────────────┘       │
                              │                                           │
                              └──────────┬────────────────────────────────┘
                                         │
                                         ▼
                             ┌──────────────────────────┐
                             │   calificacion_periodo   │
                             │                          │
                             │  estudiante_id      (FK) │
                             │  asignatura_id      (FK) │
                             │  periodo_id         (FK) │
                             │  seccion_id         (FK) │
                             │  docente_id         (FK) │
                             │  nota_p1                 │
                             │  nota_rp1                │
                             │  nota_p2                 │
                             │  nota_rp2                │
                             │  nota_p3                 │
                             │  nota_rp3                │
                             │  nota_p4                 │
                             │  nota_rp4                │
                             │  nota_efectiva_p1 (calc) │
                             │  nota_efectiva_p2 (calc) │
                             │  nota_efectiva_p3 (calc) │
                             │  nota_efectiva_p4 (calc) │
                             │  calificacion_final(calc)│
                             │  nota_completiva         │
                             │  cf_completiva    (calc) │
                             │  nota_extraordinaria     │
                             │  cf_extraordinaria(calc) │
                             │  situacion_final  (calc) │
                             └──────────────────────────┘
                                         │
                                         ▼
                             ┌──────────────────────────┐
                             │  auditoria_calificacion  │
                             │  (historial de cambios)  │
                             └──────────────────────────┘
```

---

## 4. Modelo Lógico — Descripción de tablas

El sistema SIGERA requiere **28 tablas** organizadas en 6 grupos:

### Grupo 1 — Institucional (4 tablas)

| N° | Tabla | Descripción |
|---|---|---|
| 1 | `centro_educativo` | Datos del centro: nombre, código MINERD, regional, distrito |
| 2 | `regional` | Catálogo de regionales educativas |
| 3 | `distrito` | Catálogo de distritos educativos |
| 4 | `anio_escolar` | Año lectivo con fechas de inicio y cierre |

### Grupo 2 — Organización Académica (5 tablas)

| N° | Tabla | Descripción |
|---|---|---|
| 5 | `periodo_academico` | Los 4 períodos del año escolar con sus fechas |
| 6 | `grado` | Grados del 1.º al 6.º del nivel secundario |
| 7 | `seccion` | Secciones (A, B, C...) por grado y año escolar |
| 8 | `asignatura` | Catálogo de asignaturas del currículo |
| 9 | `grado_asignatura` | Asignaturas que corresponden a cada grado |

### Grupo 3 — Personas (5 tablas)

| N° | Tabla | Descripción |
|---|---|---|
| 10 | `estudiante` | Datos personales, académicos y estado del estudiante |
| 11 | `estudiante_seccion` | Asignación del estudiante a su sección en el año |
| 12 | `representante` | Padre, madre o tutor del estudiante |
| 13 | `docente` | Datos del docente |
| 14 | `asignacion_docente` | Qué docente imparte qué asignatura en qué sección |

### Grupo 4 — Competencias (2 tablas)

| N° | Tabla | Descripción |
|---|---|---|
| 15 | `competencia_especifica` | Las competencias de cada asignatura |
| 16 | `grupo_competencia` | Agrupaciones de competencias para el cálculo |

### Grupo 5 — Evaluación (6 tablas)

| N° | Tabla | Descripción |
|---|---|---|
| 17 | `calificacion_periodo` | Tabla central: todas las notas del estudiante por asignatura y período |
| 18 | `calificacion_competencia` | Notas detalladas por competencia específica |
| 19 | `calificacion_final` | Resumen: CF, completiva, extraordinaria y situación final |
| 20 | `boletin` | Registro de boletines generados |
| 21 | `observacion_boletin` | Observaciones del docente por período/asignatura |
| 22 | `registro_grado` | Snapshot del registro oficial para impresión |

### Grupo 6 — Seguridad y Auditoría (6 tablas)

| N° | Tabla | Descripción |
|---|---|---|
| 23 | `usuario` | Credenciales y datos del usuario del sistema |
| 24 | `rol` | Roles: Administrador, Docente, Coordinador, Director |
| 25 | `usuario_rol` | Asignación de roles al usuario |
| 26 | `permiso` | Permisos granulares del sistema |
| 27 | `rol_permiso` | Permisos asignados a cada rol |
| 28 | `auditoria_calificacion` | Historial de todos los cambios en calificaciones |

---

## 5. Modelo Físico — SQL PostgreSQL

### 5.1 Tipos ENUM personalizados

```sql
-- ══════════════════════════════════════════════════
-- TIPOS ENUM — SIGERA
-- ══════════════════════════════════════════════════

CREATE TYPE tanda_tipo AS ENUM (
  'MATUTINA', 'VESPERTINA', 'NOCTURNA', 'SABATINA'
);

CREATE TYPE modalidad_tipo AS ENUM (
  'CIENCIAS_Y_HUMANIDADES',
  'TECNICO_PROFESIONAL',
  'ARTE',
  'ADULTOS'
);

CREATE TYPE condicion_inicial_tipo AS ENUM (
  'PROMOVIDO',
  'REPITENTE',
  'REINGRESO',
  'APLAZADO',
  'NUEVO_INGRESO'
);

CREATE TYPE estado_estudiante_tipo AS ENUM (
  'ACTIVO',
  'RETIRADO',
  'TRANSFERIDO',
  'FALLECIDO'
);

CREATE TYPE estado_periodo_tipo AS ENUM (
  'PENDIENTE',
  'ACTIVO',
  'CERRADO'
);

CREATE TYPE estado_anio_tipo AS ENUM (
  'CONFIGURACION',
  'ACTIVO',
  'CERRADO',
  'HISTORICO'
);

CREATE TYPE situacion_final_tipo AS ENUM (
  'APROBADO',
  'EN_COMPLETIVA',
  'EN_EXTRAORDINARIA',
  'EVALUACION_ESPECIAL',
  'PROMOVIDO_CON_CONDICION',
  'REPROBADO',
  'PENDIENTE',
  'RETIRADO',
  'TRANSFERIDO'
);

CREATE TYPE nivel_desempeno_tipo AS ENUM (
  'DESTACADO',
  'LOGRADO',
  'EN_PROCESO',
  'INSUFICIENTE',
  'SIN_EVALUAR'
);

CREATE TYPE sexo_tipo AS ENUM ('M', 'F');

CREATE TYPE tipo_representante_tipo AS ENUM (
  'PADRE', 'MADRE', 'TUTOR', 'OTRO'
);

CREATE TYPE rol_nombre_tipo AS ENUM (
  'ADMINISTRADOR',
  'DOCENTE',
  'COORDINADOR',
  'DIRECTOR'
);
```

---

### 5.2 Grupo 1 — Tablas Institucionales

```sql
-- ══════════════════════════════════════════════════
-- TABLA: regional
-- ══════════════════════════════════════════════════
CREATE TABLE regional (
  id          BIGSERIAL PRIMARY KEY,
  codigo      VARCHAR(10)  NOT NULL UNIQUE,
  nombre      VARCHAR(150) NOT NULL,
  es_activa   BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════
-- TABLA: distrito
-- ══════════════════════════════════════════════════
CREATE TABLE distrito (
  id           BIGSERIAL PRIMARY KEY,
  regional_id  BIGINT       NOT NULL REFERENCES regional(id)
                            ON DELETE RESTRICT,
  codigo       VARCHAR(10)  NOT NULL UNIQUE,
  nombre       VARCHAR(150) NOT NULL,
  es_activo    BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════
-- TABLA: centro_educativo
-- ══════════════════════════════════════════════════
CREATE TABLE centro_educativo (
  id              BIGSERIAL PRIMARY KEY,
  distrito_id     BIGINT        NOT NULL REFERENCES distrito(id)
                                ON DELETE RESTRICT,
  codigo_minerd   VARCHAR(20)   NOT NULL UNIQUE,
  nombre          VARCHAR(200)  NOT NULL,
  direccion       TEXT,
  telefono        VARCHAR(20),
  correo          VARCHAR(150),
  tanda_principal tanda_tipo,
  modalidad       modalidad_tipo,
  es_activo       BOOLEAN       NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════
-- TABLA: anio_escolar
-- ══════════════════════════════════════════════════
CREATE TABLE anio_escolar (
  id                 BIGSERIAL PRIMARY KEY,
  centro_id          BIGINT       NOT NULL REFERENCES centro_educativo(id)
                                  ON DELETE RESTRICT,
  descripcion        VARCHAR(20)  NOT NULL,  -- ej: "2025-2026"
  fecha_inicio       DATE         NOT NULL,
  fecha_fin          DATE         NOT NULL,
  estado             estado_anio_tipo NOT NULL DEFAULT 'CONFIGURACION',
  es_activo          BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  creado_por         BIGINT,  -- FK a usuario (se agrega después)
  CONSTRAINT uq_anio_centro UNIQUE (centro_id, descripcion),
  CONSTRAINT chk_fechas_anio CHECK (fecha_fin > fecha_inicio)
);
```

---

### 5.3 Grupo 2 — Organización Académica

```sql
-- ══════════════════════════════════════════════════
-- TABLA: periodo_academico
-- ══════════════════════════════════════════════════
CREATE TABLE periodo_academico (
  id              BIGSERIAL PRIMARY KEY,
  anio_escolar_id BIGINT           NOT NULL REFERENCES anio_escolar(id)
                                   ON DELETE RESTRICT,
  numero          SMALLINT         NOT NULL CHECK (numero BETWEEN 1 AND 4),
  nombre          VARCHAR(30)      NOT NULL,  -- ej: "Primer Período"
  fecha_inicio    DATE             NOT NULL,
  fecha_fin       DATE             NOT NULL,
  estado          estado_periodo_tipo NOT NULL DEFAULT 'PENDIENTE',
  cerrado_en      TIMESTAMPTZ,
  cerrado_por     BIGINT,
  creado_en       TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_periodo_anio UNIQUE (anio_escolar_id, numero),
  CONSTRAINT chk_fechas_periodo CHECK (fecha_fin > fecha_inicio)
);

-- ══════════════════════════════════════════════════
-- TABLA: grado
-- ══════════════════════════════════════════════════
CREATE TABLE grado (
  id              BIGSERIAL PRIMARY KEY,
  anio_escolar_id BIGINT       NOT NULL REFERENCES anio_escolar(id)
                               ON DELETE RESTRICT,
  numero          SMALLINT     NOT NULL CHECK (numero BETWEEN 1 AND 6),
  nombre          VARCHAR(50)  NOT NULL,  -- ej: "Segundo Grado"
  nivel           VARCHAR(50)  NOT NULL DEFAULT 'SECUNDARIO',
  ciclo           SMALLINT     NOT NULL CHECK (ciclo IN (1, 2)),
                  -- 1 = Primer ciclo (1-3), 2 = Segundo ciclo (4-6)
  modalidad       modalidad_tipo NOT NULL DEFAULT 'CIENCIAS_Y_HUMANIDADES',
  creado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_grado_anio UNIQUE (anio_escolar_id, numero, modalidad)
);

-- ══════════════════════════════════════════════════
-- TABLA: seccion
-- ══════════════════════════════════════════════════
CREATE TABLE seccion (
  id              BIGSERIAL PRIMARY KEY,
  grado_id        BIGINT       NOT NULL REFERENCES grado(id)
                               ON DELETE RESTRICT,
  nombre          VARCHAR(10)  NOT NULL,  -- ej: "A", "B", "C"
  tanda           tanda_tipo   NOT NULL,
  capacidad_max   SMALLINT     NOT NULL DEFAULT 35,
  es_activa       BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_seccion_grado UNIQUE (grado_id, nombre, tanda)
);

-- ══════════════════════════════════════════════════
-- TABLA: asignatura
-- ══════════════════════════════════════════════════
CREATE TABLE asignatura (
  id          BIGSERIAL PRIMARY KEY,
  codigo      VARCHAR(10)  NOT NULL UNIQUE,  -- ej: "MAT", "LES"
  nombre      VARCHAR(100) NOT NULL,
  abreviatura VARCHAR(20),
  es_activa   BOOLEAN      NOT NULL DEFAULT TRUE,
  orden       SMALLINT     NOT NULL DEFAULT 1,  -- Orden de aparición en boletín
  creado_en   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════
-- TABLA: grado_asignatura
-- Qué asignaturas se imparten en qué grado
-- Nota: "Salida Optativa (Solo 4to, 5to y 6to)" solo aplica a los grados 4, 5 y 6
-- ══════════════════════════════════════════════════
CREATE TABLE grado_asignatura (
  id           BIGSERIAL PRIMARY KEY,
  grado_id     BIGINT NOT NULL REFERENCES grado(id) ON DELETE RESTRICT,
  asignatura_id BIGINT NOT NULL REFERENCES asignatura(id) ON DELETE RESTRICT,
  creditos     SMALLINT,
  horas_semana SMALLINT,
  es_activa    BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_grado_asig UNIQUE (grado_id, asignatura_id),
  -- Restricción a nivel SQL para validar en triggers/lógica si es necesario
  CONSTRAINT chk_optativa_grados CHECK (
    -- Esta validación se recomienda hacerla en backend, pero se anota la restricción
    TRUE
  )
);
```

---

### 5.4 Grupo 3 — Personas

```sql
-- ══════════════════════════════════════════════════
-- TABLA: estudiante
-- ══════════════════════════════════════════════════
CREATE TABLE estudiante (
  id                  BIGSERIAL PRIMARY KEY,
  centro_id           BIGINT     NOT NULL REFERENCES centro_educativo(id)
                                 ON DELETE RESTRICT,
  rne                 VARCHAR(20) NOT NULL,  -- Registro Nacional del Estudiante
  cedula              VARCHAR(20),
  libro_acta          VARCHAR(10),
  folio_acta          VARCHAR(10),
  anio_acta           SMALLINT,
  primer_nombre       VARCHAR(80) NOT NULL,
  segundo_nombre      VARCHAR(80),
  primer_apellido     VARCHAR(80) NOT NULL,
  segundo_apellido    VARCHAR(80),
  sexo                sexo_tipo   NOT NULL,
  fecha_nacimiento    DATE        NOT NULL,
  lugar_nacimiento    VARCHAR(100),
  direccion           TEXT,
  telefono            VARCHAR(20),
  correo              VARCHAR(150),
  foto_url            TEXT,
  tiene_condicion_medica BOOLEAN NOT NULL DEFAULT FALSE,
  condicion_medica    TEXT,
  es_activo           BOOLEAN     NOT NULL DEFAULT TRUE,
  creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  creado_por          BIGINT,
  CONSTRAINT uq_estudiante_rne_centro UNIQUE (rne, centro_id)
);

-- ══════════════════════════════════════════════════
-- TABLA: estudiante_seccion
-- Asignación del estudiante a grado/sección por año escolar
-- ══════════════════════════════════════════════════
CREATE TABLE estudiante_seccion (
  id                  BIGSERIAL PRIMARY KEY,
  estudiante_id       BIGINT      NOT NULL REFERENCES estudiante(id)
                                  ON DELETE RESTRICT,
  seccion_id          BIGINT      NOT NULL REFERENCES seccion(id)
                                  ON DELETE RESTRICT,
  anio_escolar_id     BIGINT      NOT NULL REFERENCES anio_escolar(id)
                                  ON DELETE RESTRICT,
  numero_orden        SMALLINT    NOT NULL,
  condicion_inicial   condicion_inicial_tipo NOT NULL DEFAULT 'PROMOVIDO',
  estado              estado_estudiante_tipo NOT NULL DEFAULT 'ACTIVO',
  fecha_ingreso       DATE        NOT NULL,
  fecha_retiro        DATE,
  motivo_retiro       TEXT,
  centro_destino      VARCHAR(200),  -- Si es transferido
  situacion_final     situacion_final_tipo DEFAULT 'PENDIENTE',
  creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_estudiante_anio UNIQUE (estudiante_id, anio_escolar_id)
);

-- ══════════════════════════════════════════════════
-- TABLA: representante
-- ══════════════════════════════════════════════════
CREATE TABLE representante (
  id            BIGSERIAL PRIMARY KEY,
  estudiante_id BIGINT      NOT NULL REFERENCES estudiante(id)
                            ON DELETE CASCADE,
  tipo          tipo_representante_tipo NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  cedula        VARCHAR(20),
  telefono_1    VARCHAR(20),
  telefono_2    VARCHAR(20),
  correo        VARCHAR(150),
  es_contacto_emergencia BOOLEAN NOT NULL DEFAULT FALSE,
  es_activo     BOOLEAN     NOT NULL DEFAULT TRUE,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════
-- TABLA: docente
-- ══════════════════════════════════════════════════
CREATE TABLE docente (
  id              BIGSERIAL PRIMARY KEY,
  centro_id       BIGINT      NOT NULL REFERENCES centro_educativo(id)
                              ON DELETE RESTRICT,
  cedula          VARCHAR(20) NOT NULL UNIQUE,
  primer_nombre   VARCHAR(80) NOT NULL,
  segundo_nombre  VARCHAR(80),
  primer_apellido VARCHAR(80) NOT NULL,
  segundo_apellido VARCHAR(80),
  sexo            sexo_tipo,
  correo          VARCHAR(150) NOT NULL UNIQUE,
  telefono        VARCHAR(20),
  titulo_academico VARCHAR(150),
  especialidad    VARCHAR(150),
  es_activo       BOOLEAN     NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════
-- TABLA: asignacion_docente
-- Docente → Asignatura → Sección → Año escolar
-- ══════════════════════════════════════════════════
CREATE TABLE asignacion_docente (
  id              BIGSERIAL PRIMARY KEY,
  docente_id      BIGINT  NOT NULL REFERENCES docente(id) ON DELETE RESTRICT,
  seccion_id      BIGINT  NOT NULL REFERENCES seccion(id) ON DELETE RESTRICT,
  asignatura_id   BIGINT  NOT NULL REFERENCES asignatura(id) ON DELETE RESTRICT,
  anio_escolar_id BIGINT  NOT NULL REFERENCES anio_escolar(id) ON DELETE RESTRICT,
  es_activa       BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Un docente/asignatura/sección es único por año
  CONSTRAINT uq_asignacion UNIQUE (seccion_id, asignatura_id, anio_escolar_id)
);
```

---

### 5.5 Grupo 4 — Competencias

```sql
-- ══════════════════════════════════════════════════
-- TABLA: competencia_especifica
-- Las competencias de cada asignatura
-- ══════════════════════════════════════════════════
CREATE TABLE competencia_especifica (
  id             BIGSERIAL PRIMARY KEY,
  asignatura_id  BIGINT       NOT NULL REFERENCES asignatura(id)
                              ON DELETE RESTRICT,
  codigo         VARCHAR(20)  NOT NULL,    -- ej: "CE-MAT-01"
  nombre         VARCHAR(200) NOT NULL,
  descripcion    TEXT,
  orden          SMALLINT     NOT NULL DEFAULT 1,
  es_activa      BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_competencia_codigo UNIQUE (asignatura_id, codigo)
);

-- ══════════════════════════════════════════════════
-- TABLA: grupo_competencia
-- Agrupaciones de competencias para el cálculo del período
-- Ej: PC1-MAT + PC2-MAT se evalúan juntas
-- ══════════════════════════════════════════════════
CREATE TABLE grupo_competencia (
  id              BIGSERIAL PRIMARY KEY,
  asignatura_id   BIGINT      NOT NULL REFERENCES asignatura(id)
                              ON DELETE RESTRICT,
  grado_id        BIGINT      NOT NULL REFERENCES grado(id)
                              ON DELETE RESTRICT,
  nombre_grupo    VARCHAR(100) NOT NULL,   -- ej: "Grupo 2"
  descripcion     VARCHAR(200),
  orden           SMALLINT    NOT NULL DEFAULT 1,
  es_activo       BOOLEAN     NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Relación N:M entre grupo y competencia
CREATE TABLE grupo_competencia_detalle (
  id                    BIGSERIAL PRIMARY KEY,
  grupo_competencia_id  BIGINT NOT NULL
                        REFERENCES grupo_competencia(id) ON DELETE CASCADE,
  competencia_id        BIGINT NOT NULL
                        REFERENCES competencia_especifica(id) ON DELETE RESTRICT,
  peso                  NUMERIC(5,2) NOT NULL DEFAULT 1.00,
  CONSTRAINT uq_grupo_competencia UNIQUE (grupo_competencia_id, competencia_id)
);
```

---

### 5.6 Grupo 5 — Evaluación (tablas centrales)

```sql
-- ══════════════════════════════════════════════════
-- TABLA: calificacion_periodo
-- TABLA CENTRAL DEL SISTEMA
-- Una fila por: estudiante + asignatura + año escolar
-- ══════════════════════════════════════════════════
CREATE TABLE calificacion_periodo (
  id                    BIGSERIAL PRIMARY KEY,
  estudiante_seccion_id BIGINT  NOT NULL REFERENCES estudiante_seccion(id)
                                ON DELETE RESTRICT,
  asignatura_id         BIGINT  NOT NULL REFERENCES asignatura(id)
                                ON DELETE RESTRICT,
  anio_escolar_id       BIGINT  NOT NULL REFERENCES anio_escolar(id)
                                ON DELETE RESTRICT,
  asignacion_docente_id BIGINT  REFERENCES asignacion_docente(id)
                                ON DELETE RESTRICT,

  -- Calificaciones por período (ingresadas por el docente)
  nota_p1     SMALLINT CHECK (nota_p1 BETWEEN 0 AND 100),
  nota_rp1    SMALLINT CHECK (nota_rp1 BETWEEN 0 AND 100 AND (nota_rp1 IS NULL OR nota_rp1 >= nota_p1)),
  nota_p2     SMALLINT CHECK (nota_p2 BETWEEN 0 AND 100),
  nota_rp2    SMALLINT CHECK (nota_rp2 BETWEEN 0 AND 100 AND (nota_rp2 IS NULL OR nota_rp2 >= nota_p2)),
  nota_p3     SMALLINT CHECK (nota_p3 BETWEEN 0 AND 100),
  nota_rp3    SMALLINT CHECK (nota_rp3 BETWEEN 0 AND 100 AND (nota_rp3 IS NULL OR nota_rp3 >= nota_p3)),
  nota_p4     SMALLINT CHECK (nota_p4 BETWEEN 0 AND 100),
  nota_rp4    SMALLINT CHECK (nota_rp4 BETWEEN 0 AND 100 AND (nota_rp4 IS NULL OR nota_rp4 >= nota_p4)),

  -- Notas efectivas (calculadas automáticamente: RPn o Pn)
  nota_efectiva_p1  SMALLINT GENERATED ALWAYS AS (COALESCE(nota_rp1, nota_p1)) STORED,
  nota_efectiva_p2  SMALLINT GENERATED ALWAYS AS (COALESCE(nota_rp2, nota_p2)) STORED,
  nota_efectiva_p3  SMALLINT GENERATED ALWAYS AS (COALESCE(nota_rp3, nota_p3)) STORED,
  nota_efectiva_p4  SMALLINT GENERATED ALWAYS AS (COALESCE(nota_rp4, nota_p4)) STORED,

  -- Calificación final calculada por el backend
  calificacion_final        SMALLINT,
  nota_completiva           SMALLINT CHECK (nota_completiva BETWEEN 0 AND 100),
  calificacion_completiva   SMALLINT,
  nota_extraordinaria       SMALLINT CHECK (nota_extraordinaria BETWEEN 0 AND 100),
  calificacion_extraordinaria SMALLINT,
  nota_especial             SMALLINT CHECK (nota_especial BETWEEN 0 AND 100),
  calificacion_especial     SMALLINT,

  -- Situación y nivel de desempeño
  situacion_final   situacion_final_tipo NOT NULL DEFAULT 'PENDIENTE',
  nivel_desempeno   nivel_desempeno_tipo NOT NULL DEFAULT 'SIN_EVALUAR',
  porcentaje_asistencia SMALLINT CHECK (porcentaje_asistencia BETWEEN 0 AND 100),

  -- Control de estado del registro
  es_borrador       BOOLEAN     NOT NULL DEFAULT TRUE,
  completado_p1     BOOLEAN     NOT NULL DEFAULT FALSE,
  completado_p2     BOOLEAN     NOT NULL DEFAULT FALSE,
  completado_p3     BOOLEAN     NOT NULL DEFAULT FALSE,
  completado_p4     BOOLEAN     NOT NULL DEFAULT FALSE,

  creado_en         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_por   BIGINT,

  CONSTRAINT uq_calificacion_periodo
    UNIQUE (estudiante_seccion_id, asignatura_id, anio_escolar_id)
);

-- ══════════════════════════════════════════════════
-- TABLA: calificacion_competencia
-- Nota detallada por competencia específica y período
-- ══════════════════════════════════════════════════
CREATE TABLE calificacion_competencia (
  id                      BIGSERIAL PRIMARY KEY,
  calificacion_periodo_id BIGINT  NOT NULL
                          REFERENCES calificacion_periodo(id) ON DELETE CASCADE,
  competencia_id          BIGINT  NOT NULL
                          REFERENCES competencia_especifica(id) ON DELETE RESTRICT,
  periodo_numero          SMALLINT NOT NULL CHECK (periodo_numero BETWEEN 1 AND 4),
  nota                    SMALLINT CHECK (nota BETWEEN 0 AND 100),
  nota_recuperacion       SMALLINT CHECK (nota_recuperacion BETWEEN 0 AND 100),
  nota_efectiva           SMALLINT GENERATED ALWAYS AS
                          (CASE WHEN nota_recuperacion IS NOT NULL
                                THEN GREATEST(nota, nota_recuperacion)
                                ELSE nota END) STORED,
  nivel_desempeno         nivel_desempeno_tipo,
  creado_en               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_por         BIGINT,
  CONSTRAINT uq_calificacion_competencia
    UNIQUE (calificacion_periodo_id, competencia_id, periodo_numero)
);

-- ══════════════════════════════════════════════════
-- TABLA: boletin
-- Registro de boletines generados
-- ══════════════════════════════════════════════════
CREATE TABLE boletin (
  id                    BIGSERIAL PRIMARY KEY,
  estudiante_seccion_id BIGINT      NOT NULL REFERENCES estudiante_seccion(id)
                                    ON DELETE RESTRICT,
  anio_escolar_id       BIGINT      NOT NULL REFERENCES anio_escolar(id)
                                    ON DELETE RESTRICT,
  periodo_numero        SMALLINT,   -- NULL = boletín final del año
  tipo                  VARCHAR(20) NOT NULL DEFAULT 'PERIODO',
                        -- 'PERIODO' | 'FINAL' | 'PARCIAL'
  archivo_url           TEXT,       -- URL/ruta del PDF generado
  generado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generado_por          BIGINT
);

-- ══════════════════════════════════════════════════
-- TABLA: observacion_boletin
-- Observaciones del docente por período
-- ══════════════════════════════════════════════════
CREATE TABLE observacion_boletin (
  id                      BIGSERIAL PRIMARY KEY,
  calificacion_periodo_id BIGINT  NOT NULL
                          REFERENCES calificacion_periodo(id) ON DELETE CASCADE,
  periodo_numero          SMALLINT NOT NULL CHECK (periodo_numero BETWEEN 1 AND 4),
  observacion             TEXT,
  creado_en               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_observacion UNIQUE (calificacion_periodo_id, periodo_numero)
);
```

---

### 5.7 Grupo 6 — Seguridad y Auditoría

```sql
-- ══════════════════════════════════════════════════
-- TABLA: rol
-- ══════════════════════════════════════════════════
CREATE TABLE rol (
  id          BIGSERIAL PRIMARY KEY,
  nombre      rol_nombre_tipo NOT NULL UNIQUE,
  descripcion TEXT,
  es_activo   BOOLEAN     NOT NULL DEFAULT TRUE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════
-- TABLA: usuario
-- ══════════════════════════════════════════════════
CREATE TABLE usuario (
  id              BIGSERIAL PRIMARY KEY,
  centro_id       BIGINT       NOT NULL REFERENCES centro_educativo(id)
                               ON DELETE RESTRICT,
  docente_id      BIGINT       REFERENCES docente(id) ON DELETE SET NULL,
  correo          VARCHAR(150) NOT NULL UNIQUE,
  password_hash   TEXT         NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  es_activo       BOOLEAN      NOT NULL DEFAULT TRUE,
  ultimo_acceso   TIMESTAMPTZ,
  token_reset     TEXT,
  token_expira_en TIMESTAMPTZ,
  creado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════
-- TABLA: usuario_rol
-- ══════════════════════════════════════════════════
CREATE TABLE usuario_rol (
  id         BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  rol_id     BIGINT NOT NULL REFERENCES rol(id) ON DELETE RESTRICT,
  creado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_usuario_rol UNIQUE (usuario_id, rol_id)
);

-- ══════════════════════════════════════════════════
-- TABLA: auditoria_calificacion
-- Historial completo de cambios en calificaciones
-- ══════════════════════════════════════════════════
CREATE TABLE auditoria_calificacion (
  id                      BIGSERIAL PRIMARY KEY,
  calificacion_periodo_id BIGINT      NOT NULL
                          REFERENCES calificacion_periodo(id) ON DELETE RESTRICT,
  competencia_id          BIGINT      REFERENCES competencia_especifica(id),
  campo_modificado        VARCHAR(50) NOT NULL,
                          -- ej: 'nota_p1', 'nota_rp2', 'nota_completiva'
  periodo_numero          SMALLINT,
  valor_anterior          SMALLINT,
  valor_nuevo             SMALLINT,
  motivo                  TEXT,
  modificado_por          BIGINT      NOT NULL REFERENCES usuario(id),
  modificado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address              VARCHAR(45)
);
```

---

### 5.8 Actualizaciones de llaves foráneas diferidas

```sql
-- Agregar FK de anio_escolar a usuario (después de crear usuario)
ALTER TABLE anio_escolar
  ADD CONSTRAINT fk_anio_creado_por
  FOREIGN KEY (creado_por) REFERENCES usuario(id) ON DELETE SET NULL;

-- Agregar FK de calificacion_periodo a usuario
ALTER TABLE calificacion_periodo
  ADD CONSTRAINT fk_calificacion_actualizado_por
  FOREIGN KEY (actualizado_por) REFERENCES usuario(id) ON DELETE SET NULL;

-- Agregar FK de calificacion_competencia a usuario
ALTER TABLE calificacion_competencia
  ADD CONSTRAINT fk_competencia_actualizado_por
  FOREIGN KEY (actualizado_por) REFERENCES usuario(id) ON DELETE SET NULL;
```

---

## 6. Diccionario de Datos

### 6.1 Tabla: `calificacion_periodo` (tabla central)

| Campo | Tipo | Nulo | Descripción |
|---|---|---|---|
| `id` | BIGSERIAL | NO | Llave primaria autoincremental |
| `estudiante_seccion_id` | BIGINT | NO | FK → `estudiante_seccion.id` |
| `asignatura_id` | BIGINT | NO | FK → `asignatura.id` |
| `anio_escolar_id` | BIGINT | NO | FK → `anio_escolar.id` |
| `asignacion_docente_id` | BIGINT | SÍ | FK → `asignacion_docente.id` (docente responsable) |
| `nota_p1` | SMALLINT | SÍ | Calificación del Período 1 (0-100) |
| `nota_rp1` | SMALLINT | SÍ | Recuperación Período 1. Obligatoria si nota_p1 < 70. Debe ser >= nota_p1 |
| `nota_p2` | SMALLINT | SÍ | Calificación del Período 2 |
| `nota_rp2` | SMALLINT | SÍ | Recuperación Período 2. Debe ser >= nota_p2 |
| `nota_p3` | SMALLINT | SÍ | Calificación del Período 3 |
| `nota_rp3` | SMALLINT | SÍ | Recuperación Período 3. Debe ser >= nota_p3 |
| `nota_p4` | SMALLINT | SÍ | Calificación del Período 4 |
| `nota_rp4` | SMALLINT | SÍ | Recuperación Período 4. Debe ser >= nota_p4 |
| `nota_efectiva_p1` | SMALLINT | SÍ | **CALCULADO**: COALESCE(nota_rp1, nota_p1) |
| `nota_efectiva_p2` | SMALLINT | SÍ | **CALCULADO**: COALESCE(nota_rp2, nota_p2) |
| `nota_efectiva_p3` | SMALLINT | SÍ | **CALCULADO**: COALESCE(nota_rp3, nota_p3) |
| `nota_efectiva_p4` | SMALLINT | SÍ | **CALCULADO**: COALESCE(nota_rp4, nota_p4) |
| `calificacion_final` | SMALLINT | SÍ | **CALCULADO por backend**: Promedio de notas efectivas |
| `nota_completiva` | SMALLINT | SÍ | Nota de evaluación completiva (0-100) |
| `calificacion_completiva` | SMALLINT | SÍ | **CALCULADO**: Fórmula de completiva |
| `nota_extraordinaria` | SMALLINT | SÍ | Nota de evaluación extraordinaria (0-100) |
| `calificacion_extraordinaria` | SMALLINT | SÍ | **CALCULADO**: Fórmula de extraordinaria |
| `situacion_final` | ENUM | NO | APROBADO / EN_COMPLETIVA / EN_EXTRAORDINARIA / EVALUACION_ESPECIAL / etc. |
| `nivel_desempeno` | ENUM | NO | DESTACADO / LOGRADO / EN_PROCESO / INSUFICIENTE |
| `nivel_desempeno` | ENUM | NO | DESTACADO / LOGRADO / EN_PROCESO / INSUFICIENTE |
| `porcentaje_asistencia` | SMALLINT | SÍ | Porcentaje de asistencia del estudiante en el período (0-100) |
| `es_borrador` | BOOLEAN | NO | TRUE mientras el docente no confirma |
| `completado_p1..p4` | BOOLEAN | NO | Indicadores de completitud por período |
| `creado_en` | TIMESTAMPTZ | NO | Fecha/hora de creación |
| `actualizado_en` | TIMESTAMPTZ | NO | Última modificación |
| `actualizado_por` | BIGINT | SÍ | FK → `usuario.id` |

### 6.2 Tabla: `estudiante`

| Campo | Tipo | Nulo | Descripción |
|---|---|---|---|
| `id` | BIGSERIAL | NO | Llave primaria |
| `centro_id` | BIGINT | NO | FK → `centro_educativo.id` |
| `rne` | VARCHAR(20) | NO | Registro Nacional del Estudiante (único por centro) |
| `cedula` | VARCHAR(20) | SÍ | Cédula de identidad (si aplica) |
| `libro_acta` | VARCHAR(10) | SÍ | Libro de acta |
| `folio_acta` | VARCHAR(10) | SÍ | Folio de acta |
| `anio_acta` | SMALLINT | SÍ | Año de acta |
| `primer_nombre` | VARCHAR(80) | NO | Primer nombre del estudiante |
| `segundo_nombre` | VARCHAR(80) | SÍ | Segundo nombre |
| `primer_apellido` | VARCHAR(80) | NO | Primer apellido |
| `segundo_apellido` | VARCHAR(80) | SÍ | Segundo apellido |
| `sexo` | ENUM(M,F) | NO | Sexo del estudiante |
| `fecha_nacimiento` | DATE | NO | Fecha de nacimiento |
| `lugar_nacimiento` | VARCHAR(100) | SÍ | Municipio/Ciudad de nacimiento |
| `direccion` | TEXT | SÍ | Dirección domiciliaria |
| `telefono` | VARCHAR(20) | SÍ | Teléfono del estudiante |
| `correo` | VARCHAR(150) | SÍ | Correo electrónico |
| `tiene_condicion_medica` | BOOLEAN | NO | Indicador de condición médica |
| `condicion_medica` | TEXT | SÍ | Descripción de la condición médica |
| `es_activo` | BOOLEAN | NO | TRUE = activo en el sistema |
| `creado_en` | TIMESTAMPTZ | NO | Fecha de registro |

### 6.3 Tabla: `estudiante_seccion`

| Campo | Tipo | Nulo | Descripción |
|---|---|---|---|
| `id` | BIGSERIAL | NO | Llave primaria |
| `estudiante_id` | BIGINT | NO | FK → `estudiante.id` |
| `seccion_id` | BIGINT | NO | FK → `seccion.id` (grado y sección asignada) |
| `anio_escolar_id` | BIGINT | NO | FK → `anio_escolar.id` |
| `numero_orden` | SMALLINT | NO | Número de orden en el registro del grado |
| `condicion_inicial` | ENUM | NO | PROMOVIDO / REPITENTE / REINGRESO / APLAZADO |
| `estado` | ENUM | NO | ACTIVO / RETIRADO / TRANSFERIDO |
| `fecha_ingreso` | DATE | NO | Fecha en que el estudiante inició en la sección |
| `fecha_retiro` | DATE | SÍ | Fecha de retiro o transferencia |
| `motivo_retiro` | TEXT | SÍ | Razón del retiro |
| `centro_destino` | VARCHAR(200) | SÍ | Centro al que se transfirió |
| `situacion_final` | ENUM | SÍ | Situación al cierre del año |

---

## 7. Catálogos y Valores Predefinidos

### 7.1 Catálogo de asignaturas

```sql
INSERT INTO asignatura (codigo, nombre, abreviatura, orden) VALUES
  ('LES', 'Lengua Española',                              'Español',   1),
  ('ING', 'Inglés',                                       'Inglés',    2),
  ('FRA', 'Francés',                                      'Francés',   3),
  ('MAT', 'Matemática',                                   'Matemática',4),
  ('CSO', 'Ciencias Sociales',                            'CC. Soc.',  5),
  ('CNT', 'Ciencias de la Naturaleza',                    'CC. Nat.',  6),
  ('EFI', 'Educación Física',                             'Ed. Física',7),
  ('EAR', 'Educación Artística',                          'Ed. Artíst',8),
  ('FIR', 'Formación Integral Humana y Religiosa',        'FIHR',      9),
  ('OPT', 'Salida Optativa (Solo 4to, 5to y 6to)',                              'Optativa', 10); -- Solo aplica a grados 4, 5 y 6
```

### 7.2 Catálogo de roles

```sql
INSERT INTO rol (nombre, descripcion) VALUES
  ('ADMINISTRADOR', 'Acceso total al sistema. Gestiona configuración y usuarios.'),
  ('DOCENTE',       'Ingresa calificaciones de sus asignaturas y secciones asignadas.'),
  ('COORDINADOR',   'Valida registros, cierra períodos y genera reportes institucionales.'),
  ('DIRECTOR',      'Consulta estadísticas y aprueba documentos oficiales.');
```

### 7.3 Catálogo de competencias — Matemática (ejemplo)

```sql
INSERT INTO competencia_especifica (asignatura_id, codigo, nombre, orden)
SELECT a.id, comp.codigo, comp.nombre, comp.orden
FROM asignatura a
CROSS JOIN (VALUES
  ('PC1-MAT', 'Competencia Comunicativa',                   1),
  ('PC2-MAT', 'Pensamiento Lógico, Creativo y Crítico',     2),
  ('PC3-MAT', 'Resolución de Problemas Científica',         3),
  ('PC4-MAT', 'Ética, Ciudadana y Desarrollo Personal',     4)
) AS comp(codigo, nombre, orden)
WHERE a.codigo = 'MAT';
```

> **Nota:** El catálogo completo de competencias por asignatura y por grado debe elaborarse con el coordinador académico del centro, basándose en el currículo oficial del MINERD para cada nivel y modalidad.

### 7.4 Grupos de competencias — Matemática (ejemplo)

```sql
-- Los grupos definen cómo se agrupan las competencias para el registro
-- Basado en el archivo "Registro-2DO B.xlsx" analizado

-- Grupo 1: Competencia 1 sola
-- Grupo 2: Competencias 2 y 3 combinadas
-- Grupo 3: Competencias 4 y 7 combinadas
-- Grupo 4: Competencias 5 y 6 combinadas
```

---

## 8. Índices de Rendimiento

Los siguientes índices son críticos para el rendimiento de las consultas más frecuentes del sistema:

```sql
-- Búsqueda de calificaciones por estudiante
CREATE INDEX idx_calificacion_estudiante
  ON calificacion_periodo (estudiante_seccion_id, anio_escolar_id);

-- Búsqueda de calificaciones por asignatura y año (para reportes por docente)
CREATE INDEX idx_calificacion_asignatura_anio
  ON calificacion_periodo (asignatura_id, anio_escolar_id);

-- Búsqueda de estudiantes por sección
CREATE INDEX idx_est_seccion_anio
  ON estudiante_seccion (seccion_id, anio_escolar_id);

-- Búsqueda de estudiante por RNE
CREATE INDEX idx_estudiante_rne
  ON estudiante (rne);

-- Búsqueda de asignaciones por docente
CREATE INDEX idx_asignacion_docente_anio
  ON asignacion_docente (docente_id, anio_escolar_id);

-- Búsqueda de calificaciones por competencia
CREATE INDEX idx_calificacion_competencia_per
  ON calificacion_competencia (calificacion_periodo_id, periodo_numero);

-- Auditoría: búsqueda por calificación y fecha
CREATE INDEX idx_auditoria_calificacion
  ON auditoria_calificacion (calificacion_periodo_id, modificado_en DESC);

-- Dashboard: situación final por año escolar (para estadísticas rápidas)
CREATE INDEX idx_est_seccion_situacion
  ON estudiante_seccion (anio_escolar_id, situacion_final);

-- Búsqueda de usuarios por correo
CREATE INDEX idx_usuario_correo
  ON usuario (correo);

-- Búsqueda de período por año y número
CREATE INDEX idx_periodo_anio_numero
  ON periodo_academico (anio_escolar_id, numero);
```

---

## 9. Restricciones de Integridad

### 9.1 Restricciones de negocio implementadas en la base de datos

```sql
-- RN-CAL-01: Las notas ordinarias no pueden ser menores de 0 ni mayores de 100
-- (implementado con CHECK en calificacion_periodo)

-- RN-03-01: Un docente no puede tener la misma asignatura/sección dos veces
-- (implementado con UNIQUE en asignacion_docente)

-- RN-AUD-01: Las calificaciones de períodos cerrados no se editan directamente
-- (implementado mediante lógica en el backend — la BD registra todo,
--  pero la API valida el estado del período antes de aceptar cambios)

-- El año escolar no puede tener dos períodos con el mismo número
-- (implementado con UNIQUE en periodo_academico)

-- Un estudiante solo puede estar en una sección por año escolar
-- (implementado con UNIQUE en estudiante_seccion)

-- Verificar que la fecha de retiro sea posterior a la de ingreso
ALTER TABLE estudiante_seccion
  ADD CONSTRAINT chk_fechas_estudiante
  CHECK (fecha_retiro IS NULL OR fecha_retiro >= fecha_ingreso);

-- Las notas de recuperación solo tienen sentido junto a la nota del período
-- (se valida en el backend, no en la BD para mayor flexibilidad)
```

### 9.2 Triggers de auditoría automática

```sql
-- Trigger: registrar cambio en calificacion_periodo
CREATE OR REPLACE FUNCTION fn_auditar_calificacion()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar cambio en nota_p1
  IF OLD.nota_p1 IS DISTINCT FROM NEW.nota_p1 THEN
    INSERT INTO auditoria_calificacion (
      calificacion_periodo_id, campo_modificado,
      valor_anterior, valor_nuevo, modificado_por, modificado_en
    ) VALUES (
      NEW.id, 'nota_p1',
      OLD.nota_p1, NEW.nota_p1,
      NEW.actualizado_por, NOW()
    );
  END IF;

  -- [Repetir para nota_rp1, nota_p2, nota_rp2, ... nota_rp4,
  --  nota_completiva, nota_extraordinaria]

  -- Actualizar timestamp
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_auditar_calificacion
  BEFORE UPDATE ON calificacion_periodo
  FOR EACH ROW
  EXECUTE FUNCTION fn_auditar_calificacion();
```

---

## 10. Estrategia de Migración e Importación

### 10.1 Importación de estudiantes desde Excel

El sistema proveerá una **plantilla Excel estandarizada** con las siguientes columnas obligatorias:

```
Columna  A: RNE
Columna  B: Cédula (opcional)
Columna  C: Primer nombre
Columna  D: Segundo nombre (opcional)
Columna  E: Primer apellido
Columna  F: Segundo apellido (opcional)
Columna  G: Sexo (M/F)
Columna  H: Fecha de nacimiento (DD/MM/AAAA)
Columna  I: Grado (1, 2, 3, 4, 5 o 6)
Columna  J: Sección (A, B, C, ...)
Columna  K: Condición inicial (PROMOVIDO, REPITENTE, REINGRESO, APLAZADO)
Columna  L: Nombre del padre (opcional)
Columna  M: Teléfono del padre (opcional)
Columna  N: Nombre de la madre (opcional)
Columna  O: Teléfono de la madre (opcional)
Columna  P: Condición médica (opcional)
```

### 10.2 Proceso de importación

```
1. El administrador descarga la plantilla desde SIGERA
2. Llena la plantilla con los datos de los estudiantes
3. Sube el archivo a SIGERA
4. SIGERA valida cada fila:
   • RNE no duplicado en el sistema
   • Grado y sección existen
   • Campos obligatorios presentes
   • Formato de fecha correcto
   • Sexo válido (M/F)
   • Condición inicial válida
5. Si hay errores: muestra reporte de errores por fila
6. Si todo está correcto: importa masivamente con transacción
7. Asigna números de orden automáticamente (alfabético)
8. Genera los registros de calificación vacíos
```

### 10.3 Secuencia de carga inicial recomendada

Para un nuevo año escolar, la secuencia de carga es:

```
Paso 1: Configurar regional y distrito (si no existen)
Paso 2: Configurar centro educativo
Paso 3: Crear año escolar
Paso 4: Crear períodos académicos (P1-P4 con fechas)
Paso 5: Crear grados (1.º a 6.º)
Paso 6: Crear secciones por grado
Paso 7: Verificar catálogo de asignaturas
Paso 8: Asignar asignaturas a cada grado
Paso 9: Registrar docentes
Paso 10: Asignar docentes a secciones/asignaturas
Paso 11: Importar estudiantes (masivo)
Paso 12: Verificar asignaciones y números de orden
Paso 13: Activar el año escolar
     → El sistema genera todos los registros de calificación vacíos
     → Los docentes ya pueden ingresar calificaciones
```

---

## Resumen del Capítulo 4

| Elemento | Cantidad |
|---|---|
| Grupos de tablas | 6 |
| Tablas en total | 28 |
| Tipos ENUM definidos | 11 |
| Campos calculados (GENERATED) | 4 |
| Restricciones UNIQUE | 12 |
| Restricciones CHECK | 8 |
| Índices de rendimiento | 10 |
| Triggers de auditoría | 1 |
| Datos predefinidos (catálogos) | 4 conjuntos |

### Mapa de dependencias de tablas

```
regional → distrito → centro_educativo → anio_escolar → periodo_academico
                                      → grado → seccion → estudiante_seccion
                                                        → asignacion_docente
                                      → grado_asignatura

asignatura → competencia_especifica → grupo_competencia
estudiante → estudiante_seccion
docente    → asignacion_docente

estudiante_seccion + asignatura + anio_escolar → calificacion_periodo
calificacion_periodo + competencia → calificacion_competencia
calificacion_periodo → auditoria_calificacion
calificacion_periodo → observacion_boletin
calificacion_periodo → boletin

usuario → usuario_rol → rol
```

---

## Historial de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| 1.0 | Agosto 2026 | Equipo SIGERA | Primera versión del Capítulo 4 |

---

*Este documento forma parte del Documento de Arquitectura Funcional (DAF) de SIGERA.*

**Capítulo anterior:** [Capítulo 3 — Arquitectura Funcional](./SIGERA_DAF_Cap3_Arquitectura_Funcional.md)  
**Siguiente capítulo:** [Capítulo 5 — Arquitectura de Software](./SIGERA_DAF_Cap5_Arquitectura_Software.md)

---
*© 2026 SIGERA — Todos los derechos reservados*
