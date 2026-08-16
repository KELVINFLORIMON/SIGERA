# SIGERA
## Sistema Inteligente de Gestión Educativa y Rendimiento Académico
### Documento de Arquitectura Funcional (DAF)
#### Capítulo 2 — Arquitectura del Negocio

---

**Versión:** 1.0  
**Fecha:** Agosto 2026  
**Estado:** Borrador para revisión  
**Referencia anterior:** [Capítulo 1 — Visión General](./SIGERA_DAF_Cap1_Vision_General.md)

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Mapa de Macroprocesos Académicos](#2-mapa-de-macroprocesos-académicos)
3. [Proceso 1 — Configuración del Año Escolar](#3-proceso-1--configuración-del-año-escolar)
4. [Proceso 2 — Registro y Organización de Estudiantes](#4-proceso-2--registro-y-organización-de-estudiantes)
5. [Proceso 3 — Asignación Académica de Docentes](#5-proceso-3--asignación-académica-de-docentes)
6. [Proceso 4 — Evaluación por Período](#6-proceso-4--evaluación-por-período)
7. [Proceso 5 — Recuperación Pedagógica](#7-proceso-5--recuperación-pedagógica)
8. [Proceso 6 — Cierre de Período](#8-proceso-6--cierre-de-período)
9. [Proceso 7 — Evaluación Completiva](#9-proceso-7--evaluación-completiva)
10. [Proceso 8 — Evaluación Extraordinaria](#10-proceso-8--evaluación-extraordinaria)
11. [Proceso 9 — Cierre del Año Escolar y Promoción](#11-proceso-9--cierre-del-año-escolar-y-promoción)
12. [Proceso 10 — Generación de Boletines](#12-proceso-10--generación-de-boletines)
13. [Flujos por Actor](#13-flujos-por-actor)
14. [Reglas de Negocio](#14-reglas-de-negocio)
15. [Validaciones del Sistema](#15-validaciones-del-sistema)
16. [Casos de Excepción](#16-casos-de-excepción)
17. [Decisiones Automáticas vs. Manuales](#17-decisiones-automáticas-vs-manuales)

---

## 1. Introducción

Este capítulo documenta el **modelo de negocio** del sistema educativo del nivel secundario de la República Dominicana desde la perspectiva de SIGERA. El objetivo es mapear con precisión todos los procesos que ocurren desde el inicio del año escolar hasta la entrega del boletín final, identificando:

- **Quién** realiza cada proceso (actor).
- **Qué** ocurre en cada paso (actividad).
- **Cuándo** ocurre (momento del año escolar).
- **Qué información** se genera o consume.
- **Qué decisiones** toma el sistema automáticamente.
- **Qué decisiones** siguen siendo responsabilidad humana.

> **Principio fundamental de diseño:** SIGERA no cambia la lógica del proceso educativo. La digitaliza. El docente sigue haciendo lo mismo que hacía en papel, pero más rápido, con cálculos automáticos y sin riesgo de error.

---

## 2. Mapa de Macroprocesos Académicos

El ciclo académico completo de SIGERA se organiza en **10 macroprocesos** que ocurren de forma secuencial a lo largo del año escolar:

```
╔══════════════════════════════════════════════════════════════════╗
║               CICLO ACADÉMICO ANUAL — SIGERA                    ║
╚══════════════════════════════════════════════════════════════════╝

  [INICIO DEL AÑO ESCOLAR]
          │
          ▼
  ┌─────────────────────────┐
  │  PROCESO 1              │
  │  Configuración del      │  ← Administrador
  │  año escolar            │
  └────────────┬────────────┘
               │
               ▼
  ┌─────────────────────────┐
  │  PROCESO 2              │
  │  Registro y organización│  ← Administrador
  │  de estudiantes         │
  └────────────┬────────────┘
               │
               ▼
  ┌─────────────────────────┐
  │  PROCESO 3              │
  │  Asignación académica   │  ← Administrador
  │  de docentes            │
  └────────────┬────────────┘
               │
               ▼
  ┌─────────────────────────────────────────────────────────┐
  │                SE REPITE 4 VECES (P1, P2, P3, P4)       │
  │                                                         │
  │    ┌─────────────────────────┐                         │
  │    │  PROCESO 4              │                         │
  │    │  Evaluación por período │  ← Docente             │
  │    └────────────┬────────────┘                         │
  │                 │                                       │
  │                 ▼                                       │
  │    ┌─────────────────────────┐                         │
  │    │  PROCESO 5              │                         │
  │    │  Recuperación           │  ← Docente             │
  │    │  pedagógica             │                         │
  │    └────────────┬────────────┘                         │
  │                 │                                       │
  │                 ▼                                       │
  │    ┌─────────────────────────┐                         │
  │    │  PROCESO 6              │                         │
  │    │  Cierre de período      │  ← Coordinador         │
  │    └─────────────────────────┘                         │
  └─────────────────────────────────────────────────────────┘
               │
               ▼
  ┌─────────────────────────┐
  │  PROCESO 7              │
  │  Evaluación completiva  │  ← Docente / Coordinador
  └────────────┬────────────┘
               │
               ▼
  ┌─────────────────────────┐
  │  PROCESO 8              │
  │  Evaluación             │  ← Docente / Coordinador
  │  extraordinaria         │
  └────────────┬────────────┘
               │
               ▼
  ┌─────────────────────────┐
  │  PROCESO 9              │
  │  Cierre del año escolar │  ← Coordinador / Director
  │  y promoción            │
  └────────────┬────────────┘
               │
               ▼
  ┌─────────────────────────┐
  │  PROCESO 10             │
  │  Generación de          │  ← Sistema automático
  │  boletines              │
  └─────────────────────────┘
          │
          ▼
  [FIN DEL AÑO ESCOLAR]
```

---

## 3. Proceso 1 — Configuración del Año Escolar

### 3.1 Descripción

Antes de que pueda registrarse un solo estudiante o una sola calificación, el sistema debe estar correctamente configurado para el año escolar en curso. Este proceso lo realiza el **Administrador** una única vez al inicio del año escolar.

### 3.2 Flujo detallado

```
ACTOR: Administrador
──────────────────────────────────────────────────────────────
INICIO
  │
  ├─► Ingresar datos del centro educativo
  │     • Nombre del centro
  │     • Código MINERD del centro
  │     • Regional educativa
  │     • Distrito educativo
  │     • Dirección física
  │     • Teléfono y correo institucional
  │
  ├─► Configurar el año escolar
  │     • Período: ej. "2025-2026"
  │     • Fecha de inicio
  │     • Fecha de cierre
  │     • Estado: Activo
  │
  ├─► Configurar el calendario de períodos
  │     • P1: fecha inicio → fecha fin
  │     • P2: fecha inicio → fecha fin
  │     • P3: fecha inicio → fecha fin
  │     • P4: fecha inicio → fecha fin
  │
  ├─► Crear grados y secciones
  │     • Por cada grado (1.º a 6.º):
  │         - Nombre del grado
  │         - Tanda (matutina / vespertina / nocturna)
  │         - Modalidad
  │         - Secciones (A, B, C, ...)
  │         - Capacidad máxima por sección
  │
  ├─► Configurar asignaturas por grado
  │     • Seleccionar las asignaturas que aplican a cada grado
  │     • Configurar las competencias específicas de cada asignatura
  │     • Configurar el peso de cada competencia (si aplica)
  │
  └─► Verificar y activar la configuración
        • El sistema valida que todos los campos requeridos estén completos
        • El administrador confirma la activación del año escolar
        • El sistema genera automáticamente los registros de grado vacíos

FIN DEL PROCESO 1
```

### 3.3 Datos generados

| Entidad creada | Descripción |
|---|---|
| Año escolar | Registro maestro del ciclo lectivo |
| Grados | 6 registros (1.º a 6.º) por tanda/modalidad |
| Secciones | Tantas como el centro requiera por grado |
| Asignaturas-por-grado | Relación entre asignatura y grado |
| Competencias | Las competencias específicas de cada asignatura |
| Registros de grado | Registros vacíos listos para ser llenados |

### 3.4 Condición para avanzar al Proceso 2

> El sistema **no permite registrar estudiantes** hasta que exista al menos un año escolar activo con al menos un grado y una sección configurados.

---

## 4. Proceso 2 — Registro y Organización de Estudiantes

### 4.1 Descripción

El administrador registra a todos los estudiantes del centro y los asigna a su grado y sección correspondiente. Este proceso puede realizarse de forma individual o mediante importación masiva desde Excel.

### 4.2 Flujo detallado

```
ACTOR: Administrador
──────────────────────────────────────────────────────────────
INICIO
  │
  ├─► ¿Cómo se registrarán los estudiantes?
  │     │
  │     ├─[Uno a uno]──────────────────────────────────────┐
  │     │                                                   │
  │     └─[Importación masiva desde Excel]──────────────┐  │
  │                                                      │  │
  │   ┌──────────────────────────────────────────────────┘  │
  │   │  El sistema valida el archivo Excel:               │
  │   │    • Formato correcto                              │
  │   │    • Campos obligatorios presentes                 │
  │   │    • RNE sin duplicados                            │
  │   │    • Grado y sección existen en el sistema         │
  │   │  Si hay errores → muestra lista de errores         │
  │   │  Si todo es válido → importa los registros         │
  │   └────────────────────────────────┬───────────────────┘
  │                                    │
  │   ┌────────────────────────────────┘
  │   │
  │   ▼  [Para cada estudiante]
  │
  ├─► Registrar datos personales
  │     • Número de orden en el registro
  │     • RNE (Registro Nacional del Estudiante)
  │     • Cédula de identidad (si aplica)
  │     • Nombre y apellidos
  │     • Sexo (M / F)
  │     • Fecha de nacimiento
  │     • Lugar de nacimiento
  │     • Dirección domiciliaria
  │     • Correo electrónico
  │     • Teléfono de contacto
  │
  ├─► Registrar condición inicial
  │     • Promovido del grado anterior
  │     • Repitente (reprobó el mismo grado el año anterior)
  │     • Reingreso (estuvo fuera del sistema y regresa)
  │     • Aplazado (queda pendiente de resolución)
  │
  ├─► Registrar datos familiares
  │     • Nombre del padre
  │     • Nombre de la madre
  │     • Nombre del tutor (si aplica)
  │     • Teléfonos de contacto
  │     • Correos de los representantes
  │     • Contacto de emergencia
  │     • Condiciones médicas relevantes
  │
  ├─► Asignar al grado y sección
  │     • Seleccionar grado (1.º a 6.º)
  │     • Seleccionar sección (A, B, C, ...)
  │     • El sistema asigna automáticamente el número de orden
  │     • Estado inicial: Activo
  │
  └─► El sistema genera el registro de grado del estudiante
        • Crea todos los campos de calificaciones vacíos
        • Por cada asignatura del grado
        • Por cada período (P1, P2, P3, P4)
        • Por cada competencia específica de la asignatura

FIN DEL PROCESO 2
```

### 4.3 Estados del estudiante

| Estado | Descripción | Efecto en el sistema |
|---|---|---|
| **Activo** | Asistiendo normalmente | Se incluye en todos los reportes y calificaciones |
| **Retirado** | Abandonó el centro | Se excluye de reportes activos pero conserva historial |
| **Transferido** | Cambió de centro | Se marca como transferido con fecha y centro destino |
| **Fallecido** | Situación excepcional | Se marca con estado especial para reportes estadísticos |

### 4.4 Regla de negocio — Número de orden

> El número de orden de cada estudiante en el registro de grado se asigna **alfabéticamente por apellido** al momento de registrar o importar. Si se agrega un estudiante después, el sistema le asigna el siguiente número disponible al final de la lista para no alterar los números ya asignados.

---

## 5. Proceso 3 — Asignación Académica de Docentes

### 5.1 Descripción

El administrador registra a cada docente del centro y le asigna las asignaturas, grados y secciones que impartirá durante el año escolar. Esta asignación determina qué puede ver y editar cada docente en el sistema.

### 5.2 Flujo detallado

```
ACTOR: Administrador
──────────────────────────────────────────────────────────────
INICIO
  │
  ├─► Registrar datos del docente
  │     • Nombre completo
  │     • Cédula de identidad
  │     • Correo electrónico institucional
  │     • Teléfono
  │     • Título académico
  │     • Especialidad
  │
  ├─► Crear credenciales de acceso
  │     • Usuario (puede ser el correo)
  │     • Contraseña temporal
  │     • Rol: DOCENTE
  │
  ├─► Asignar carga académica
  │     Por cada asignatura que impartirá:
  │     ┌─────────────────────────────────────────────┐
  │     │  Seleccionar asignatura                     │
  │     │  Seleccionar grado                          │
  │     │  Seleccionar sección(es)                    │
  │     │  El sistema valida que no haya conflictos   │
  │     │  (misma asignatura/sección asignada a       │
  │     │   otro docente)                             │
  │     └─────────────────────────────────────────────┘
  │     Se repite por cada asignatura/grado/sección
  │
  └─► Confirmación
        • El sistema muestra el resumen de la carga asignada
        • El administrador confirma
        • El docente recibe un correo con sus credenciales
        • El docente puede acceder al sistema y ver sus secciones asignadas

FIN DEL PROCESO 3
```

### 5.3 Regla de negocio — Conflicto de asignación

> **RN-03-01:** Una misma combinación de asignatura + grado + sección no puede estar asignada a dos docentes al mismo tiempo en el mismo año escolar. El sistema debe bloquear este escenario y mostrar un mensaje de error claro.

---

## 6. Proceso 4 — Evaluación por Período

### 6.1 Descripción

Es el proceso central del sistema y el que más utilizará el docente. Se repite cuatro veces al año (P1, P2, P3, P4). El docente registra las calificaciones de cada estudiante por competencia específica. El sistema calcula automáticamente la calificación del período.

### 6.2 Flujo detallado

```
ACTOR: Docente
──────────────────────────────────────────────────────────────
INICIO (al comenzar cada período)
  │
  ├─► El docente inicia sesión en SIGERA
  │
  ├─► Selecciona:
  │     • Asignatura
  │     • Grado
  │     • Sección
  │     • Período (P1 / P2 / P3 / P4)
  │
  ├─► El sistema muestra la tabla de calificaciones
  │     Formato visual:
  │     ┌────┬──────────────────┬──────┬──────┬──────┬──────┬──────┐
  │     │ N° │ Estudiante       │ PC1  │ PC2  │ PC3  │ PC4  │ Prom │
  │     ├────┼──────────────────┼──────┼──────┼──────┼──────┼──────┤
  │     │ 01 │ Pérez, Juan      │ ____ │ ____ │ ____ │ ____ │  --  │
  │     │ 02 │ García, María    │ ____ │ ____ │ __── │ ____ │  --  │
  │     └────┴──────────────────┴──────┴──────┴──────┴──────┴──────┘
  │     Donde PC1, PC2, PC3, PC4 = Competencias específicas
  │     El Promedio se calcula automáticamente
  │
  ├─► El docente ingresa la calificación por competencia
  │     Para cada estudiante, por cada competencia específica:
  │       • Ingresa un valor entre 70 y 100
  │       • O marca como "No aplica" si el estudiante no fue evaluado
  │       • O marca como "Incompleto" si falta evidencia
  │
  ├─► SIGERA calcula automáticamente al guardar cada nota:
  │     • Promedio de competencias específicas del período (PCn)
  │     • Nivel de desempeño (Destacado / Logrado / En proceso / Insuficiente)
  │     • Indicador de riesgo (si PCn < 70)
  │
  ├─► El docente puede:
  │     • Guardar como borrador (no se bloquea el período)
  │     • Guardar definitivamente (se puede editar hasta el cierre del período)
  │
  ├─► El sistema aplica validaciones en tiempo real:
  │     • Valor fuera del rango 70-100 → error
  │     • Campo vacío al guardar definitivo → advertencia
  │     • Estudiante en riesgo (nota < 70) → alerta visual
  │
  └─► Al finalizar el ingreso del período:
        • El docente marca el período como "Completado"
        • El sistema calcula la calificación del período para cada estudiante
        • Genera automáticamente la lista de estudiantes que requieren
          recuperación pedagógica

FIN DEL PROCESO 4
```

### 6.3 Estructura de competencias por asignatura

Cada asignatura tiene sus propias competencias específicas. El número de competencias varía por asignatura. A continuación, el ejemplo de Matemática extraído del registro analizado:

| Grupo | Competencias incluidas | Código |
|---|---|---|
| Grupo 1 | Competencia Específica 1 | PC1-MAT |
| Grupo 2 | Competencias 2 y 3 combinadas | PC2-MAT + PC3-MAT |
| Grupo 3 | Competencias 4 y 7 combinadas | PC4-MAT + PC3-MAT |
| Grupo 4 | Competencias 5 y 6 combinadas | PC1-MAT + PC2-MAT |

> **Nota de diseño:** La estructura exacta de competencias por asignatura debe validarse grado por grado con el registro oficial del MINERD. El Capítulo 4 (Arquitectura de Datos) detallará el catálogo completo de competencias.

### 6.4 Fórmula de cálculo del período

```
Para cada estudiante y cada asignatura en un período:

  Promedio de Competencias del Período (PCn) =
      Suma de calificaciones de todas las competencias
      ─────────────────────────────────────────────────
           Número de competencias evaluadas

  Si PCn >= 70 → El estudiante aprueba el período
  Si PCn < 70  → El estudiante requiere recuperación pedagógica
```

---

## 7. Proceso 5 — Recuperación Pedagógica

### 7.1 Descripción

La recuperación pedagógica es el proceso mediante el cual el docente brinda apoyo adicional a los estudiantes que no alcanzaron la calificación mínima en una competencia o período. Según la Ordenanza 04-2023, este proceso ocurre **dentro de cada período**, no al final del año.

### 7.2 Principio fundamental (Ordenanza 04-2023)

> La recuperación pedagógica **no borra la nota original del período**. Ambas calificaciones (la original y la de recuperación) deben quedar registradas. El sistema utiliza la **mejor calificación válida** para el cálculo del promedio final.

### 7.3 Flujo detallado

```
ACTOR: Docente (con supervisión del Coordinador)
──────────────────────────────────────────────────────────────
INICIO (durante o al final de cada período)
  │
  ├─► SIGERA identifica automáticamente a los estudiantes
  │     que tienen calificaciones < 70 en el período actual
  │
  ├─► El sistema genera la "Lista de Recuperación" del período:
  │     • Nombre del estudiante
  │     • Asignatura
  │     • Competencia(s) con calificación insuficiente
  │     • Calificación original
  │
  ├─► El docente revisa la lista y:
  │
  │   ┌─[El estudiante participó en recuperación]────────────┐
  │   │                                                      │
  │   │   ├─► El docente ingresa la nota de recuperación     │
  │   │   │     • Valor entre 70 y 100                       │
  │   │   │     • El campo se identifica como "RPn"          │
  │   │   │       (Recuperación del Período n)               │
  │   │   │                                                  │
  │   │   └─► SIGERA calcula automáticamente:               │
  │   │         • Conserva la nota original del período      │
  │   │         • Registra la nota de recuperación           │
  │   │         • Usa la mejor nota para el promedio         │
  │   │                                                      │
  │   └──────────────────────────────────────────────────────┘
  │
  │   ┌─[El estudiante NO participó en recuperación]─────────┐
  │   │                                                      │
  │   │   ├─► El campo RPn queda vacío                       │
  │   │   │                                                  │
  │   │   └─► La nota original del período se mantiene       │
  │   │         y se usa en el cálculo final                 │
  │   │                                                      │
  │   └──────────────────────────────────────────────────────┘
  │
  └─► Al cerrar el período:
        • SIGERA recalcula el promedio del período
          usando la mejor nota disponible (Pn o RPn)
        • Si el estudiante sigue < 70 después de recuperación:
          → Queda marcado como "pendiente de completiva"

FIN DEL PROCESO 5
```

### 7.4 Regla de uso de la nota de recuperación

```
Para cada competencia evaluada:

  Nota de Recuperación (RPn) = Calificación del período (Pn) + Puntos logrados en el proceso RP complementario

  Si no hay avance en la recuperación:
    Nota de Recuperación (RPn) = Calificación del período (Pn) (Se repite la nota original)

  Nota efectiva del período = RPn
```

> **Importante:** La nota de recuperación **nunca puede ser menor a la nota original**, ya que se construye sumando la nota original más lo que le falta para llegar al logro esperado. Si la nota Pn < 70, el campo RPn **no puede quedar vacío**, debe al menos repetir la nota original.

---

## 8. Proceso 6 — Cierre de Período

### 8.1 Descripción

Al finalizar cada período académico, el Coordinador valida las calificaciones y el sistema cierra el período, calculando todos los indicadores y generando los boletines parciales.

### 8.2 Flujo detallado

```
ACTORES: Coordinador → Director (aprobación final)
──────────────────────────────────────────────────────────────
INICIO (al finalizar las fechas del período)
  │
  ├─► El Coordinador accede al panel de cierre de período
  │
  ├─► El sistema muestra el estado de completitud:
  │     • Secciones con calificaciones al 100%: ✅
  │     • Secciones con calificaciones incompletas: ⚠️
  │     • Secciones sin calificaciones: ❌
  │
  ├─► Si hay secciones incompletas:
  │     │
  │     ├─► El Coordinador notifica al docente correspondiente
  │     │
  │     └─► El docente completa las calificaciones pendientes
  │
  ├─► Cuando todas las secciones están completas:
  │     │
  │     ├─► El Coordinador revisa calificaciones inusuales:
  │     │     • Estudiantes con todas las notas en 70 (mínimo exacto)
  │     │     • Calificaciones que bajaron drásticamente entre períodos
  │     │     • Secciones con promedio muy bajo o muy alto
  │     │
  │     └─► El Coordinador aprueba el cierre del período
  │
  ├─► SIGERA ejecuta el cierre:
  │     ✅ Congela las calificaciones del período
  │     ✅ Calcula el promedio del período por estudiante
  │     ✅ Genera la lista de recuperación para el período cerrado
  │     ✅ Actualiza los indicadores del dashboard
  │     ✅ Genera los boletines parciales del período
  │     ✅ Habilita el siguiente período para ingreso de calificaciones
  │
  └─► El Director recibe notificación del cierre con:
        • Promedio general del período por grado
        • Cantidad de estudiantes en recuperación
        • Cantidad de estudiantes en riesgo

FIN DEL PROCESO 6
(Se repite para P1, P2, P3 y P4)
```

### 8.3 Regla de negocio — Edición post-cierre

> **RN-06-01:** Una vez que el Coordinador cierra un período, los docentes **no pueden editar** las calificaciones de ese período. Solo el Coordinador o el Administrador pueden desbloquear un período cerrado para correcciones, y cualquier cambio debe quedar registrado en el historial de auditoría con la justificación correspondiente.

---

## 9. Proceso 7 — Evaluación Completiva

### 9.1 Descripción

La evaluación completiva se aplica cuando un estudiante finaliza el año (después de P4 y recuperación del P4) con una calificación final del área que no alcanza el mínimo aprobatorio, pero dentro del rango que permite una oportunidad adicional.

### 9.2 ¿Quiénes van a completiva?

```
Al cerrar P4:
  │
  ├─► SIGERA calcula la Calificación Final (CF) de cada área:
  │
  │     CF = Promedio de los cuatro períodos
  │          (usando la mejor nota entre Pn y RPn)
  │
  ├─► Para cada área, por cada estudiante:
  │
  │   ┌─ CF >= 70 ──► Aprobado en el área ✅
  │   │
  │   └─ CF < 70  ──► ¿Cuántas áreas reprobadas tiene?
  │                    │
  │                    ├─ [Dentro del límite permitido]
  │                    │    → Calificado para completiva ⚠️
  │                    │
  │                    └─ [Supera el límite de áreas]
  │                         → Reprobado directo ❌
  │                            (según reglas de la Ordenanza)
```

> **Nota:** El número exacto de áreas reprobadas que califican para completiva vs. reprobación directa debe verificarse en la versión vigente de la Ordenanza 04-2023 para el grado específico.

### 9.3 Flujo de la completiva

```
ACTORES: Docente, Coordinador
──────────────────────────────────────────────────────────────
INICIO
  │
  ├─► SIGERA genera automáticamente la lista de completiva:
  │     • Nombre del estudiante
  │     • Área(s) en completiva
  │     • Calificación final del área
  │     • Nota requerida en completiva para aprobar
  │
  ├─► El Coordinador comunica las fechas de evaluación completiva
  │
  ├─► El docente aplica la evaluación completiva
  │
  ├─► El docente registra la nota de completiva en SIGERA
  │     • Valor entre 70 y 100
  │
  ├─► SIGERA calcula la Calificación Completiva Final:
  │
  │     Calificación Completiva = (CF × 0.50) + (Nota Completiva × 0.50)
  │
  │     [Fórmula actualizada según Ordenanza 04-2023]
  │
  ├─► SIGERA determina la situación del estudiante:
  │
  │   ┌─ Calificación Completiva >= 70 ──► Aprobado ✅
  │   │
  │   └─ Calificación Completiva < 70  ──► Va a extraordinaria ⚠️
  │
  └─► Se actualiza el registro del estudiante

FIN DEL PROCESO 7
```

---

## 10. Proceso 8 — Evaluación Extraordinaria

### 10.1 Descripción

La evaluación extraordinaria es la última oportunidad del estudiante para aprobar un área antes de ser declarado reprobado. Se aplica cuando no aprueba la completiva.

### 10.2 Flujo de la extraordinaria

```
ACTORES: Docente, Coordinador, Director
──────────────────────────────────────────────────────────────
INICIO
  │
  ├─► SIGERA genera la lista de extraordinaria:
  │     • Estudiantes que no aprobaron la completiva
  │     • Áreas específicas a evaluar
  │
  ├─► El Coordinador o Director autoriza la evaluación
  │
  ├─► El docente aplica la evaluación extraordinaria
  │
  ├─► El docente registra la nota extraordinaria en SIGERA
  │
  ├─► SIGERA calcula la Calificación Extraordinaria Final:
  │     Calificación Extraordinaria = (CF × 0.30) + (Nota Extraordinaria × 0.70)
  │
  ├─► SIGERA determina la situación definitiva:
  │
  │   ┌─ Calificación Extraordinaria >= 70 ──► Aprobado ✅
  │   │
  │   └─ Calificación Extraordinaria < 70  ──► REPROBADO en el área ❌
  │
  └─► Se actualiza el registro del estudiante con la
      situación definitiva del área

FIN DEL PROCESO 8
```

---

## 11. Proceso 9 — Cierre del Año Escolar y Promoción

### 11.1 Descripción

Una vez completados todos los procesos de evaluación (incluyendo completiva y extraordinaria), el sistema determina la situación final de cada estudiante: promovido o reprobado.

### 11.2 Flujo de cierre y promoción

```
ACTORES: Coordinador, Director, Sistema automático
──────────────────────────────────────────────────────────────
INICIO
  │
  ├─► SIGERA verifica que todos los procesos estén completos:
  │     ✅ P1, P2, P3, P4 cerrados
  │     ✅ Recuperaciones registradas
  │     ✅ Completivas registradas (donde aplique)
  │     ✅ Extraordinarias registradas (donde aplique)
  │     ✅ Porcentaje de asistencia calculado
  │
  ├─► SIGERA calcula la situación final de cada estudiante:
  │
  │     Para cada estudiante:
  │       ¿Cumple con el 70% mínimo de asistencia?
  │       ├─ NO → Evaluación Especial con Equipo Multidisciplinar ⚠️
  │       │
  │       └─ SÍ → ¿Cuántas áreas reprobadas tiene (post-extraordinaria)?
  │                 │
  │                 ├─ 0 áreas reprobadas → PROMOVIDO ✅
  │                 │
  │                 ├─ 1 a 2 áreas reprobadas → EVALUACION_ESPECIAL ⚠️
  │                 │    (Se evalúa antes del inicio del próximo año escolar)
  │                 │
  │                 └─ 3 o más áreas reprobadas → REPROBADO (Repite grado) ❌
  │
  ├─► El Director revisa y aprueba la promoción
  │
  ├─► SIGERA genera automáticamente:
  │     📄 Registro de grado completo (para impresión oficial)
  │     📄 Boletines finales individuales
  │     📄 Acta de rendimiento del grado
  │     📊 Estadísticas finales del año
  │     📊 Dataset para Power BI
  │
  ├─► El Coordinador/Director firma digitalmente los documentos
  │
  └─► El sistema cierra el año escolar
        • Estado del año: CERRADO
        • Las calificaciones quedan congeladas en modo histórico
        • Los estudiantes promovidos se preparan para el siguiente grado

FIN DEL PROCESO 9
```

### 11.3 Reglas de promoción

| Situación | Áreas reprobadas / Condición | Decisión del sistema |
|---|---|---|
| Promovido | 0 áreas reprobadas y >= 70% asistencia | PROMOVIDO |
| Evaluación Especial | 1 o 2 áreas reprobadas post-extraordinaria O < 70% asistencia | EVALUACION_ESPECIAL |
| Reprobado | 3 o más áreas reprobadas | REPROBADO (Repite grado) |

> **Nota:** La Evaluación Especial se administra antes del inicio del siguiente año escolar. Si la inasistencia es < 70%, el caso se remite a un equipo multidisciplinar (gestión, docente encargada y docentes del área) para decidir la permanencia. Las asignaturas de Salida Optativa (Solo 4to, 5to y 6to) solo aplican a los grados 4.º, 5.º y 6.º del nivel secundario.

---

## 12. Proceso 10 — Generación de Boletines

### 12.1 Descripción

El boletín de calificaciones es el documento que recibe el estudiante al finalizar cada período y al cierre del año escolar. SIGERA lo genera automáticamente desde los datos ya registrados, sin necesidad de volver a ingresar información.

### 12.2 Tipos de boletines

| Tipo | Momento | Contenido |
|---|---|---|
| **Boletín de período** | Al cerrar P1, P2, P3 o P4 | Calificaciones del período en cuestión |
| **Boletín final** | Al cerrar el año escolar | Todos los períodos + situación final |

### 12.3 Contenido del boletín (formato MINERD)

```
╔══════════════════════════════════════════════════════════╗
║           BOLETÍN DE CALIFICACIONES — SIGERA            ║
╠══════════════════════════════════════════════════════════╣
║  Centro: [Nombre del centro]    Código: [Código MINERD] ║
║  Regional: [Regional]           Distrito: [Distrito]    ║
║  Año escolar: [Año]             Tanda: [Tanda]          ║
╠══════════════════════════════════════════════════════════╣
║  Estudiante: [Nombre completo]                          ║
║  RNE: [RNE]          Grado: [Grado]   Sección: [Sec]   ║
║  N.º de orden: [N.º]  Sexo: [M/F]                      ║
╠═══════════════════════╦════╦════╦════╦════╦══════╦═════╣
║  ASIGNATURA           ║ P1 ║ P2 ║ P3 ║ P4 ║  CF  ║ Sit ║
╠═══════════════════════╬════╬════╬════╬════╬══════╬═════╣
║  Lengua Española      ║    ║    ║    ║    ║      ║     ║
║  Matemática           ║    ║    ║    ║    ║      ║     ║
║  Ciencias Naturales   ║    ║    ║    ║    ║      ║     ║
║  Ciencias Sociales    ║    ║    ║    ║    ║      ║     ║
║  Inglés               ║    ║    ║    ║    ║      ║     ║
║  Francés              ║    ║    ║    ║    ║      ║     ║
║  Ed. Física           ║    ║    ║    ║    ║      ║     ║
║  Ed. Artística        ║    ║    ║    ║    ║      ║     ║
║  FIHR                 ║    ║    ║    ║    ║      ║     ║
║  Salida Optativa (Solo 4to, 5to y 6to)      ║    ║    ║    ║    ║      ║     ║
╠═══════════════════════╩════╩════╩════╩════╩══════╩═════╣
║  Promedio general: [Promedio]                           ║
║  Situación final: [PROMOVIDO / REPROBADO]               ║
╠══════════════════════════════════════════════════════════╣
║  Observaciones del docente:                             ║
║  [Texto libre]                                          ║
╠══════════════════════════════════════════════════════════╣
║  Firma del docente: ___________  Fecha: __________      ║
║  Firma del director: __________  Sello: __________      ║
╚══════════════════════════════════════════════════════════╝
```

### 12.4 Flujo de generación de boletines

```
ACTOR: Docente / Coordinador / Sistema automático
──────────────────────────────────────────────────────────────
INICIO
  │
  ├─► El boletín puede generarse de tres formas:
  │
  │   [Opción A] Por el docente para su sección
  │     • El docente selecciona sección y período
  │     • El sistema genera los boletines de todos los
  │       estudiantes de esa sección en PDF
  │
  │   [Opción B] Por el coordinador para todo el grado
  │     • El coordinador selecciona grado y período
  │     • El sistema genera todos los boletines del grado
  │
  │   [Opción C] Individual, por estudiante
  │     • Cualquier rol autorizado busca al estudiante
  │     • Genera el boletín individual
  │
  ├─► El sistema compila los datos del boletín:
  │     • Datos del centro (del Proceso 1)
  │     • Datos del estudiante (del Proceso 2)
  │     • Calificaciones de todos los períodos (Proceso 4)
  │     • Mejor nota entre período y recuperación (Proceso 5)
  │     • Completiva y extraordinaria (Procesos 7 y 8)
  │     • Calificación final calculada automáticamente
  │     • Situación final (Proceso 9)
  │
  ├─► El sistema genera el PDF con formato MINERD
  │
  └─► Opciones de salida:
        • Descargar PDF individual
        • Descargar PDF grupal (todos los de la sección)
        • Imprimir directamente
        • Enviar por correo (funcionalidad futura)

FIN DEL PROCESO 10
```

---

## 13. Flujos por Actor

### 13.1 Flujo completo del Administrador

```
ADMINISTRADOR
─────────────────────────────────────────────────
Inicio de sesión
    │
    ├── Configurar año escolar (una vez)
    ├── Crear grados y secciones (una vez)
    ├── Registrar asignaturas (una vez)
    ├── Registrar estudiantes (al inicio, con ajustes durante el año)
    ├── Registrar docentes (al inicio, con ajustes)
    ├── Asignar docentes → asignaturas → secciones (al inicio)
    ├── Gestionar usuarios y permisos (continuo)
    ├── Supervisar el estado del sistema (continuo)
    └── Exportar datos (cuando se requiera)
```

### 13.2 Flujo completo del Docente

```
DOCENTE (por cada período — 4 veces al año)
─────────────────────────────────────────────────
Inicio de sesión
    │
    ├── Ver mis asignaturas y secciones asignadas
    │
    ├── [Por cada período: P1, P2, P3, P4]
    │     │
    │     ├── Seleccionar asignatura + grado + sección + período
    │     ├── Ingresar calificaciones por competencia (estudiante a estudiante)
    │     ├── Guardar (borrador o definitivo)
    │     ├── Revisar lista de estudiantes en riesgo (nota < 70)
    │     ├── Aplicar proceso de recuperación pedagógica
    │     ├── Ingresar notas de recuperación (RPn)
    │     ├── Verificar que el período esté completo
    │     └── Notificar al coordinador para cierre
    │
    ├── [Al cierre del año]
    │     ├── Ingresar notas de completiva (si aplica)
    │     ├── Ingresar notas de extraordinaria (si aplica)
    │     └── Generar y revisar boletines de su sección
    │
    └── [En cualquier momento]
          ├── Consultar el avance de sus estudiantes
          ├── Generar boletines de su sección
          └── Ver estadísticas de su asignatura
```

### 13.3 Flujo completo del Coordinador Académico

```
COORDINADOR
─────────────────────────────────────────────────
Inicio de sesión
    │
    ├── [Durante cada período]
    │     ├── Monitorear el avance del ingreso de calificaciones
    │     ├── Identificar secciones con registro incompleto
    │     ├── Notificar a docentes con registros pendientes
    │     ├── Revisar calificaciones inusuales
    │     └── Aprobar el cierre del período
    │
    ├── [Al cierre de cada período]
    │     ├── Validar completitud de todos los registros
    │     ├── Revisar lista de estudiantes en recuperación
    │     ├── Autorizar generación de boletines de período
    │     └── Generar reportes de rendimiento
    │
    ├── [Al cierre del año]
    │     ├── Revisar lista de completiva
    │     ├── Supervisar proceso de completiva
    │     ├── Revisar lista de extraordinaria
    │     ├── Supervisar proceso de extraordinaria
    │     ├── Validar situación final de todos los estudiantes
    │     └── Presentar estadísticas finales al director
    │
    └── [En cualquier momento]
          ├── Consultar reportes por asignatura, docente, sección
          ├── Exportar datos para análisis
          └── Identificar tendencias de rendimiento
```

### 13.4 Flujo completo del Director

```
DIRECTOR
─────────────────────────────────────────────────
Inicio de sesión
    │
    ├── Ver el dashboard general del centro
    │     • Promedio general
    │     • Estudiantes en riesgo
    │     • Asistencia general (Etapa 2)
    │     • Comparativo entre períodos
    │
    ├── Consultar reportes específicos
    │     • Por grado
    │     • Por sección
    │     • Por asignatura
    │     • Por docente
    │
    ├── [Al cierre del año]
    │     ├── Revisar y aprobar la promoción final
    │     ├── Firmar digitalmente los documentos oficiales
    │     └── Autorizar la entrega de boletines
    │
    └── [En cualquier momento]
          ├── Exportar reportes institucionales
          └── Consultar el historial académico de cualquier estudiante
```

---

## 14. Reglas de Negocio

Las siguientes reglas de negocio son derivadas directamente de la Ordenanza 04-2023 y del Registro de Grado oficial del MINERD. Son de cumplimiento obligatorio en el sistema.

### 14.1 Reglas de calificación

| Código | Regla | Fuente |
|---|---|---|
| **RN-CAL-01** | La calificación mínima en cualquier campo es **70**. No se acepta ningún valor menor como válido para la escala de aprobación. | Ordenanza 04-2023 |
| **RN-CAL-02** | La calificación máxima es **100**. | Ordenanza 04-2023 |
| **RN-CAL-03** | La calificación se expresa en **números enteros**. No se aceptan decimales en el registro. | Registro MINERD |
| **RN-CAL-04** | El sistema **redondea automáticamente** SOLAMENTE las calificaciones finales (C.F., C.C.F., C.EX.F). No se redondean las notas de período ni parciales. | Práctica institucional |
| **RN-CAL-05** | Un estudiante **aprueba un área** si su Calificación Final (CF) es igual o mayor a 70. | Ordenanza 04-2023 |

### 14.2 Reglas de recuperación pedagógica

| Código | Regla | Fuente |
|---|---|---|
| **RN-REC-01** | La recuperación pedagógica se aplica **dentro del mismo período** en que el estudiante obtuvo una nota insuficiente. | Ordenanza 04-2023 |
| **RN-REC-02** | La nota original del período y la nota de recuperación deben **conservarse ambas** en el registro. | Registro MINERD |
| **RN-REC-03** | La nota RPn es **complementaria**. Se coloca la suma de la nota del período más la obtenida en el proceso de recuperación complementario. | Registro MINERD |
| **RN-REC-04** | La nota de recuperación **nunca puede ser menor** a la nota original, ya que es "nota original + lo que falta para llegar al logro". | Registro MINERD |
| **RN-REC-05** | La casilla RPn **nunca puede estar vacía** si la nota original es < 70; como mínimo debe repetir la misma nota original. | Registro MINERD |

### 14.3 Reglas de asistencia *(Preparadas para Etapa 2)*

| Código | Regla | Fuente |
|---|---|---|
| **RN-ASI-01** | Los estados de asistencia válidos son: Presente (P), Ausente (A), Tardanza (T), Excusa (E), Retiro (R). | Registro MINERD |
| **RN-ASI-02** | **Tres tardanzas equivalen a una ausencia.** El sistema hace esta conversión automáticamente. | Registro MINERD |
| **RN-ASI-03** | Un estudiante debe tener un mínimo de **70% de asistencia** a clases justificadas. Menos del 70% remite el caso a un equipo multidisciplinar (gestión, docente encargada y áreas). | Registro MINERD |
| **RN-ASI-04** | El porcentaje de asistencia se calcula sobre el total de días hábiles del año escolar. | Registro MINERD |

### 14.4 Reglas de cierre y auditoría

| Código | Regla | Fuente |
|---|---|---|
| **RN-AUD-01** | Un período **cerrado no puede ser editado** por el docente. Solo el Coordinador o Administrador puede reabrirlo. | Diseño del sistema |
| **RN-AUD-02** | Toda modificación a una calificación después del cierre debe registrar: usuario, fecha, hora, valor anterior y justificación. | Buena práctica |
| **RN-AUD-03** | El sistema conserva el **historial completo de cambios** de cada calificación. | Diseño del sistema |
| **RN-AUD-04** | El año escolar cerrado pasa a estado **histórico de solo lectura**. | Diseño del sistema |

---

## 15. Validaciones del Sistema

### 15.1 Validaciones de entrada de datos

| Campo | Validación | Mensaje de error |
|---|---|---|
| Calificación | Número entero entre 70 y 100, o vacío | "La calificación debe estar entre 70 y 100" |
| RNE | Formato numérico, único por año escolar | "Este RNE ya está registrado en el sistema" |
| Correo | Formato de correo electrónico válido | "Ingrese un correo electrónico válido" |
| Fecha de nacimiento | Fecha válida, no futura | "La fecha de nacimiento no puede ser futura" |
| Nombre del estudiante | No vacío, solo letras y caracteres especiales del español | "El nombre no puede estar vacío" |
| Asignación de docente | No duplicado (misma asignatura/sección ya asignada) | "Esta sección ya tiene un docente asignado en esta asignatura" |

### 15.2 Validaciones de proceso

| Proceso | Validación | Comportamiento |
|---|---|---|
| Cierre de período | Todos los estudiantes activos deben tener calificación en todas las competencias | Bloquea el cierre y muestra lista de faltantes |
| Ingreso de nota de recuperación | Solo se puede ingresar si existe una nota original < 70 | Bloquea el campo si la nota original es >= 70 |
| Promoción | No se puede promover si hay campos de completiva o extraordinaria pendientes | Muestra lista de estudiantes con procesos incompletos |
| Generación de boletín final | Solo se genera si el año escolar está en estado "Listo para cierre" | Muestra advertencia si hay datos incompletos |

### 15.3 Alertas automáticas del sistema

| Código | Condición | Nivel | Acción del sistema |
|---|---|---|---|
| **ALR-01** | Calificación del período < 70 | ⚠️ Advertencia | Marca al estudiante en la lista de recuperación |
| **ALR-02** | Calificación final < 70 | 🔴 Crítico | Marca al estudiante para completiva/reprobación |
| **ALR-03** | Docente con > 5 días sin ingresar calificaciones | ⚠️ Advertencia | Notifica al coordinador |
| **ALR-04** | Período a 3 días de su fecha de cierre con registros incompletos | ⚠️ Advertencia | Notifica al docente y coordinador |
| **ALR-05** | Asistencia < 70% | 🔴 Crítico | Notifica al equipo multidisciplinar para evaluar el caso |
| **ALR-06** | Promedio general de una sección cae más de 10 puntos entre períodos | ⚠️ Advertencia | Notifica al coordinador |

---

## 16. Casos de Excepción

### 16.1 Estudiante se retira durante el año escolar

```
Situación: Un estudiante deja el centro después de comenzado el año.

Acción del sistema:
  1. El administrador cambia el estado del estudiante a "Retirado"
  2. Registra la fecha de retiro
  3. Las calificaciones ya ingresadas se conservan
  4. El estudiante ya no aparece en las listas activas de calificaciones
  5. El estudiante sí aparece en reportes estadísticos (como retirado)
  6. Se genera automáticamente un registro parcial con las notas al momento del retiro
```

### 16.2 Estudiante se transfiere a otro centro

```
Situación: Un estudiante se cambia a otro centro educativo.

Acción del sistema:
  1. El administrador cambia el estado a "Transferido"
  2. Registra la fecha y el centro de destino
  3. Se puede generar un boletín parcial con las calificaciones hasta la transferencia
  4. El historial queda disponible para consulta
```

### 16.3 Estudiante llega de otro centro (nuevo ingreso tardío)

```
Situación: Un estudiante se matricula después de iniciado el año.

Acción del sistema:
  1. El administrador registra al estudiante con condición "Reingreso"
  2. Registra la fecha de ingreso
  3. Los campos de períodos ya cerrados quedan en blanco
  4. El docente puede ingresar calificaciones solo a partir del período activo
  5. Los reportes indican la fecha de incorporación
```

### 16.4 Corrección de calificación después del cierre

```
Situación: Se detecta un error en una calificación de un período ya cerrado.

Acción del sistema:
  1. El Coordinador o Administrador solicita la reapertura del período
  2. Registra la justificación de la reapertura
  3. El sistema desbloquea el período para ese docente/sección específico
  4. El docente realiza la corrección
  5. El sistema registra en auditoría: valor anterior, valor nuevo, usuario, fecha, justificación
  6. El Coordinador vuelve a cerrar el período
```

### 16.5 Docente sin asignaciones o con asignaciones incorrectas

```
Situación: Se descubre que un docente tiene asignaciones incorrectas.

Acción del sistema:
  1. Solo el Administrador puede modificar las asignaciones
  2. Si el docente ya tiene calificaciones ingresadas, el sistema advierte antes de cambiar
  3. Las calificaciones ya ingresadas quedan asociadas al docente original
  4. Se puede reasignar sin perder datos
```

---

## 17. Decisiones Automáticas vs. Manuales

Una de las claves del diseño de SIGERA es la clara separación entre lo que el sistema decide automáticamente y lo que sigue siendo responsabilidad de un ser humano.

### 17.1 Decisiones 100% automáticas (sin intervención humana)

| Decisión | Regla aplicada |
|---|---|
| Calcular el promedio de competencias del período | Promedio aritmético de las competencias ingresadas |
| Determinar si el estudiante requiere recuperación | Si el promedio del período < 70 |
| Determinar si el campo RPn requiere llenado | Si Pn < 70, RPn es obligatorio |
| Calcular la Calificación Final del área | Promedio de los 4 períodos (redondeado al final) |
| Determinar el nivel de desempeño (Destacado, etc.) | Según rango de la Ordenanza |
| Generar la lista de completiva | Basado en CF < 70 y reglas de Ordenanza |
| Calcular la ponderación de completiva | Fórmula de la Ordenanza |
| Redondear promedios | Al entero más cercano |
| Generar el boletín | Compilación de datos ya ingresados |

### 17.2 Decisiones que requieren intervención humana

| Decisión | Actor responsable | Razón |
|---|---|---|
| Ingresar la calificación del período | Docente | Es una evaluación profesional |
| Decidir si se aplica recuperación pedagógica | Docente | Depende del contexto pedagógico |
| Ingresar la nota de recuperación | Docente | Resultado de una evaluación real |
| Cerrar un período | Coordinador | Requiere validación institucional |
| Aprobar la promoción final | Director | Responsabilidad administrativa y pedagógica |
| Reabrir un período cerrado | Coordinador / Administrador | Decisión sensible que requiere justificación |
| Agregar observaciones al boletín | Docente | Es una comunicación profesional |
| Firmar los documentos oficiales | Director | Responsabilidad legal |

---

## Resumen del Capítulo 2

| Elemento documentado | Cantidad |
|---|---|
| Macroprocesos definidos | 10 |
| Flujos de proceso detallados | 10 |
| Flujos por actor | 4 (Administrador, Docente, Coordinador, Director) |
| Reglas de negocio | 17 (RN-CAL, RN-REC, RN-ASI, RN-AUD) |
| Validaciones de entrada | 6 |
| Validaciones de proceso | 4 |
| Alertas automáticas | 6 |
| Casos de excepción | 5 |
| Decisiones automáticas | 9 |
| Decisiones humanas | 8 |

---

## Historial de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| 1.0 | Agosto 2026 | Equipo SIGERA | Primera versión del Capítulo 2 |

---

*Este documento forma parte del Documento de Arquitectura Funcional (DAF) de SIGERA.*

**Capítulo anterior:** [Capítulo 1 — Visión General](./SIGERA_DAF_Cap1_Vision_General.md)  
**Siguiente capítulo:** [Capítulo 3 — Arquitectura Funcional](./SIGERA_DAF_Cap3_Arquitectura_Funcional.md)

---
*© 2026 SIGERA — Todos los derechos reservados*
