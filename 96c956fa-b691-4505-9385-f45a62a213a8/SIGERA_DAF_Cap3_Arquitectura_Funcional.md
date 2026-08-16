# SIGERA
## Sistema Inteligente de Gestión Educativa y Rendimiento Académico
### Documento de Arquitectura Funcional (DAF)
#### Capítulo 3 — Arquitectura Funcional

---

**Versión:** 1.0  
**Fecha:** Agosto 2026  
**Estado:** Borrador para revisión  
**Referencia anterior:** [Capítulo 2 — Arquitectura del Negocio](./SIGERA_DAF_Cap2_Arquitectura_Negocio.md)

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Casos de Uso del Sistema](#2-casos-de-uso-del-sistema)
3. [Historias de Usuario](#3-historias-de-usuario)
4. [Motor de Cálculo Académico](#4-motor-de-cálculo-académico)
5. [Diseño de Pantallas](#5-diseño-de-pantallas)
6. [Flujo de Navegación del Sistema](#6-flujo-de-navegación-del-sistema)
7. [Especificaciones de Componentes Clave](#7-especificaciones-de-componentes-clave)
8. [Requisitos No Funcionales](#8-requisitos-no-funcionales)

---

## 1. Introducción

Este capítulo define la **arquitectura funcional** de SIGERA: qué puede hacer el sistema, quién puede hacerlo, cómo se calculan las calificaciones y cómo lucen las pantallas. Es el puente entre los procesos de negocio del Capítulo 2 y el modelo de datos del Capítulo 4.

Tres elementos fundamentales se documentan aquí:

1. **Casos de uso**: las interacciones precisas entre los actores y el sistema.
2. **Motor de cálculo**: las fórmulas exactas que el sistema aplica automáticamente.
3. **Diseño de pantallas**: cómo se ve y se siente el sistema para cada actor.

---

## 2. Casos de Uso del Sistema

### 2.1 Diagrama general de casos de uso

```
╔══════════════════════════════════════════════════════════════════╗
║                    ACTORES DEL SISTEMA                          ║
╚══════════════════════════════════════════════════════════════════╝

  ┌─────────────────┐     ┌─────────────────┐
  │  ADMINISTRADOR  │     │     DOCENTE      │
  └────────┬────────┘     └────────┬────────┘
           │                       │
           │    ╔══════════════════════════════════╗
           │    ║         SIGERA                  ║
           ├───►║ UC-01 Configurar año escolar    ║
           ├───►║ UC-02 Gestionar estudiantes     ║
           ├───►║ UC-03 Gestionar docentes        ║
           ├───►║ UC-04 Asignar carga académica   ║
           ├───►║ UC-05 Gestionar asignaturas     ║◄────┐
           │    ║                                 ║     │
           │    ║ UC-06 Registrar calificaciones  ║◄────┤
           │    ║ UC-07 Registrar recuperación    ║◄────┤
           │    ║ UC-08 Registrar completiva      ║◄────┤
           │    ║ UC-09 Registrar extraordinaria  ║◄────┤
           │    ║ UC-10 Generar boletines         ║◄────┤
           │    ║ UC-11 Consultar mis estadísticas║◄────┘
           │    ║                                 ║
           │    ║ UC-12 Validar registros         ║◄──── COORDINADOR
           │    ║ UC-13 Cerrar período            ║◄──── COORDINADOR
           │    ║ UC-14 Aprobar promoción         ║◄──── COORDINADOR
           │    ║ UC-15 Generar reportes          ║◄──── COORDINADOR / DIRECTOR
           │    ║                                 ║
           ├───►║ UC-16 Gestionar usuarios        ║
           ├───►║ UC-17 Exportar datos            ║◄──── COORDINADOR
           │    ║ UC-18 Ver dashboard general     ║◄──── DIRECTOR
           │    ║ UC-19 Auditar cambios           ║
           └───►║ UC-20 Configurar competencias   ║
                ╚══════════════════════════════════╝
```

---

### 2.2 Casos de uso detallados

#### UC-01 — Configurar año escolar

| Campo | Detalle |
|---|---|
| **ID** | UC-01 |
| **Nombre** | Configurar año escolar |
| **Actor principal** | Administrador |
| **Precondición** | El sistema no tiene un año escolar activo para el período a configurar |
| **Postcondición** | El año escolar queda activo y los registros de grado se generan vacíos |
| **Frecuencia** | Una vez por año escolar |

**Flujo principal:**
1. El administrador accede a *Configuración → Año Escolar*.
2. Ingresa el período (ej. "2025-2026"), fechas de inicio y cierre.
3. Configura las fechas de los cuatro períodos académicos.
4. Crea los grados (1.º a 6.º) con sus secciones.
5. Asocia las asignaturas a cada grado.
6. Confirma la activación.
7. El sistema crea los registros de grado vacíos automáticamente.

**Flujos alternativos:**
- *FA-01a:* Si ya existe un año activo, el sistema muestra advertencia y solicita confirmación de cierre del anterior.
- *FA-01b:* Si algún campo obligatorio está vacío, el sistema bloquea la confirmación.

---

#### UC-02 — Gestionar estudiantes

| Campo | Detalle |
|---|---|
| **ID** | UC-02 |
| **Nombre** | Gestionar estudiantes |
| **Actor principal** | Administrador |
| **Precondición** | Existe al menos un año escolar activo con grados y secciones configurados |
| **Postcondición** | El estudiante queda registrado y asignado a su sección |
| **Frecuencia** | Alta — múltiples veces durante el año |

**Subfunciones:**
- UC-02a: Registrar estudiante individual
- UC-02b: Importar estudiantes desde Excel
- UC-02c: Editar datos del estudiante
- UC-02d: Cambiar estado del estudiante (Activo / Retirado / Transferido)
- UC-02e: Reasignar a otro grado o sección

---

#### UC-06 — Registrar calificaciones

| Campo | Detalle |
|---|---|
| **ID** | UC-06 |
| **Nombre** | Registrar calificaciones por período |
| **Actor principal** | Docente |
| **Actores secundarios** | Administrador (puede editar en casos excepcionales) |
| **Precondición** | El período está abierto. El docente tiene asignaciones válidas. |
| **Postcondición** | Las calificaciones quedan guardadas y los promedios se calculan automáticamente |
| **Frecuencia** | Muy alta — durante todo el año escolar |

**Flujo principal:**
1. El docente selecciona: Asignatura → Grado → Sección → Período.
2. El sistema muestra la tabla de calificaciones con los estudiantes de la sección.
3. El docente ingresa la calificación por competencia para cada estudiante.
4. El sistema calcula el promedio del período en tiempo real.
5. El sistema resalta en rojo los estudiantes con promedio < 70.
6. El docente guarda (borrador o definitivo).

**Flujos alternativos:**
- *FA-06a:* Calificación fuera de rango → error en campo + mensaje.
- *FA-06b:* El docente guarda como borrador → puede editar después.
- *FA-06c:* Período cerrado → campo bloqueado con indicador visual.

---

#### UC-07 — Registrar recuperación pedagógica

| Campo | Detalle |
|---|---|
| **ID** | UC-07 |
| **Nombre** | Registrar nota de recuperación pedagógica |
| **Actor principal** | Docente |
| **Precondición** | El estudiante tiene al menos una competencia con nota < 70 en el período |
| **Postcondición** | La nota de recuperación queda registrada y el sistema recalcula el promedio |
| **Frecuencia** | Alta — durante y al cierre de cada período |

**Regla clave:** El campo de recuperación (RPn) solo se habilita si la nota del período (Pn) es menor que 70.

---

#### UC-10 — Generar boletines

| Campo | Detalle |
|---|---|
| **ID** | UC-10 |
| **Nombre** | Generar boletines de calificaciones |
| **Actor principal** | Docente, Coordinador, Administrador |
| **Precondición** | Existen calificaciones registradas para el período o año a reportar |
| **Postcondición** | Se genera un PDF con el formato oficial del MINERD |
| **Frecuencia** | Al cierre de cada período y al cierre del año |

**Modos de generación:**
1. **Individual:** Un boletín por estudiante.
2. **Por sección:** Todos los boletines de una sección en un solo PDF.
3. **Por grado:** Todos los boletines del grado.
4. **Histórico:** Boletín de un período anterior ya cerrado.

---

#### UC-13 — Cerrar período

| Campo | Detalle |
|---|---|
| **ID** | UC-13 |
| **Nombre** | Cerrar período académico |
| **Actor principal** | Coordinador |
| **Precondición** | Todas las secciones tienen calificaciones al 100% en el período |
| **Postcondición** | El período queda congelado. Se habilita el siguiente período. Se generan los boletines del período. |
| **Frecuencia** | 4 veces al año (al finalizar P1, P2, P3, P4) |

**Flujo principal:**
1. El coordinador accede a *Gestión Académica → Cierre de Período*.
2. Selecciona el período a cerrar.
3. El sistema muestra el semáforo de completitud por sección.
4. Si hay secciones incompletas: el coordinador puede ver y notificar al docente.
5. Cuando todo está completo: el coordinador confirma el cierre.
6. El sistema ejecuta el motor de cálculo final del período.
7. Las calificaciones quedan congeladas.
8. Los boletines del período se habilitan para descarga.

---

## 3. Historias de Usuario

Las historias de usuario complementan los casos de uso con la perspectiva humana del sistema.

### 3.1 Historias del Docente

| ID | Como... | Quiero... | Para... | Prioridad |
|---|---|---|---|---|
| HU-D01 | Docente | Ver la lista de mis estudiantes por sección | Saber con quiénes trabajo en cada asignatura | 🔴 Alta |
| HU-D02 | Docente | Ingresar las calificaciones en una tabla igual al registro de papel | No tener que aprender un formato nuevo | 🔴 Alta |
| HU-D03 | Docente | Ver automáticamente qué estudiantes tienen notas < 70 | Identificar rápidamente quiénes necesitan recuperación | 🔴 Alta |
| HU-D04 | Docente | Guardar las calificaciones como borrador | Poder continuar después sin perder lo que ya ingresé | 🔴 Alta |
| HU-D05 | Docente | Ingresar la nota de recuperación junto a la nota original | Tener ambas visibles en la misma pantalla | 🔴 Alta |
| HU-D06 | Docente | Generar el boletín de mi sección con un clic | Ahorrar horas de trabajo manual | 🔴 Alta |
| HU-D07 | Docente | Ver el promedio calculado automáticamente mientras ingreso notas | Verificar en tiempo real el rendimiento del estudiante | 🟡 Media |
| HU-D08 | Docente | Agregar observaciones personalizadas al boletín | Comunicar información adicional al representante | 🟡 Media |
| HU-D09 | Docente | Ver el historial de cambios de una calificación | Saber cuándo y qué se modificó | 🟢 Baja |
| HU-D10 | Docente | Exportar mi registro de notas a Excel | Tener una copia local de respaldo | 🟡 Media |

### 3.2 Historias del Coordinador Académico

| ID | Como... | Quiero... | Para... | Prioridad |
|---|---|---|---|---|
| HU-C01 | Coordinador | Ver el estado de completitud de calificaciones por sección | Saber qué docentes están al día | 🔴 Alta |
| HU-C02 | Coordinador | Ver una lista de estudiantes con calificaciones < 70 en cualquier área | Hacer seguimiento de los estudiantes en riesgo | 🔴 Alta |
| HU-C03 | Coordinador | Cerrar un período cuando todas las secciones estén completas | Oficializar el fin de cada etapa académica | 🔴 Alta |
| HU-C04 | Coordinador | Reabrir un período cerrado con justificación | Corregir errores detectados después del cierre | 🟡 Media |
| HU-C05 | Coordinador | Ver el promedio de cada asignatura por período | Identificar asignaturas con bajo rendimiento | 🟡 Media |
| HU-C06 | Coordinador | Generar reportes de aprobados, en recuperación y reprobados | Presentar estadísticas a la dirección | 🔴 Alta |
| HU-C07 | Coordinador | Validar las calificaciones antes del cierre | Asegurar que los datos son correctos | 🟡 Media |

### 3.3 Historias del Director

| ID | Como... | Quiero... | Para... | Prioridad |
|---|---|---|---|---|
| HU-DR01 | Director | Ver un dashboard con el rendimiento general del centro | Tener una visión ejecutiva del estado académico | 🔴 Alta |
| HU-DR02 | Director | Ver el promedio por grado, sección y asignatura | Comparar el rendimiento entre secciones | 🔴 Alta |
| HU-DR03 | Director | Aprobar la lista final de promovidos y reprobados | Tener control sobre la decisión de promoción | 🔴 Alta |
| HU-DR04 | Director | Firmar digitalmente los boletines y actas | Cumplir con el proceso oficial del MINERD | 🟡 Media |
| HU-DR05 | Director | Exportar un informe ejecutivo del año escolar | Presentarlo a la regional o al distrito | 🟡 Media |

### 3.4 Historias del Administrador

| ID | Como... | Quiero... | Para... | Prioridad |
|---|---|---|---|---|
| HU-A01 | Administrador | Configurar el año escolar antes de que comiencen las clases | Preparar el sistema para el ciclo lectivo | 🔴 Alta |
| HU-A02 | Administrador | Importar estudiantes desde un archivo Excel del MINERD | Evitar ingresar manualmente cientos de registros | 🔴 Alta |
| HU-A03 | Administrador | Asignar docentes a sus asignaturas y secciones fácilmente | Definir quién puede ingresar qué calificaciones | 🔴 Alta |
| HU-A04 | Administrador | Crear y gestionar usuarios con sus roles | Controlar el acceso al sistema | 🔴 Alta |
| HU-A05 | Administrador | Ver el log de auditoría de cambios en calificaciones | Detectar modificaciones no autorizadas | 🟡 Media |

---

## 4. Motor de Cálculo Académico

Este es el módulo más crítico de SIGERA. Toda la lógica de evaluación basada en la Ordenanza 04-2023 se implementa aquí. Las fórmulas son determinísticas: los mismos datos siempre producen el mismo resultado.

### 4.1 Datos de entrada del motor

```
Para cada [Estudiante] en cada [Asignatura]:

  P1   = Calificación del Período 1  (entero 70-100, o nulo)
  RP1  = Recuperación del Período 1  (entero 70-100, o nulo)
  P2   = Calificación del Período 2  (entero 70-100, o nulo)
  RP2  = Recuperación del Período 2  (entero 70-100, o nulo)
  P3   = Calificación del Período 3  (entero 70-100, o nulo)
  RP3  = Recuperación del Período 3  (entero 70-100, o nulo)
  P4   = Calificación del Período 4  (entero 70-100, o nulo)
  RP4  = Recuperación del Período 4  (entero 70-100, o nulo)
  COMP = Calificación Completiva     (entero 70-100, o nulo)
  EXT  = Calificación Extraordinaria (entero 70-100, o nulo)
```

> **Nota sobre valores nulos:** Un campo nulo significa que aún no se ha ingresado la calificación. El motor distingue entre "nulo" (sin datos) y cualquier valor numérico.

### 4.2 Paso 1 — Calificación efectiva por período

Para cada período `n` (donde n ∈ {1, 2, 3, 4}):

```
FUNCIÓN: calcular_nota_efectiva(Pn, RPn)

  SI Pn es nulo:
    RETORNAR nulo  ← El período no tiene datos aún

  SI RPn es nulo (no participó):
    RETORNAR Pn    ← Se usa la nota del período original

  SI RPn existe:
    RETORNAR RPn   ← El valor de RPn es la suma complementaria (Pn + avance). RPn nunca puede ser menor a Pn.

  [Equivalente matemático]:
  nota_efectiva_n = RPn            ← si RPn existe (suma complementaria)
  nota_efectiva_n = Pn             ← si RPn es nulo
```

**Ejemplo práctico:**

| Caso | P1 | RP1 | Nota efectiva P1 |
|---|---|---|---|
| Sin recuperación | 72 | — | 72 |
| Recuperación exitosa | 62 | 74 | 74 |
| Recuperación (mínima requerida si < 70) | 65 | 65 | 65 |
| Sin nota de período | — | — | nulo |

### 4.3 Paso 2 — Calificación Final del área (CF)

```
FUNCIÓN: calcular_calificacion_final(NE1, NE2, NE3, NE4)

  Donde NEn = nota_efectiva del período n

  CASOS:
  ───────────────────────────────────────────────────
  [Todos los períodos con datos]
    CF = REDONDEAR( (NE1 + NE2 + NE3 + NE4) / 4 )

  [Solo 3 períodos con datos — ej. estudiante tardío]
    CF = REDONDEAR( SUMA(notas_disponibles) / períodos_con_datos )

  [Menos de 2 períodos con datos]
    CF = NO CALCULABLE (se muestra como "Incompleto")
  ───────────────────────────────────────────────────

  REDONDEO: Se aplica redondeo estándar al entero más cercano ÚNICAMENTE a las calificaciones finales (CF, CCF, CEXF).
    Ejemplos de CF:
      79.5 → 80
      79.4 → 79
      79.49 → 79
    No se redondean promedios parciales (PC) ni calificaciones de períodos (P1-P4).

  RESULTADO:
    Si CF >= 70 → Estado: APROBADO ✅
    Si CF < 70  → Estado: PENDIENTE (pasa a evaluación de completiva o reprobado)
```

### 4.4 Paso 3 — Determinación de estudiantes en completiva

```
FUNCIÓN: determinar_completiva(lista_cf_por_area)

  Para cada estudiante:
    areas_reprobadas = COUNT de áreas donde CF < 70

    SI areas_reprobadas == 0:
      estado_estudiante = "PROMOVIDO"

    SI areas_reprobadas >= 1 Y areas_reprobadas <= LIMITE_COMPLETIVA:
      estado_estudiante = "EN COMPLETIVA"
      [el estudiante puede intentar la completiva en las áreas reprobadas]

    SI areas_reprobadas > LIMITE_COMPLETIVA:
      estado_estudiante = "REPROBADO"

  ⚠️ PENDIENTE DE VALIDACIÓN:
  El valor exacto de LIMITE_COMPLETIVA debe extraerse del
  articulado específico de la Ordenanza 04-2023 para cada grado.
  Puede variar entre grados y modalidades.
```

### 4.5 Paso 4 — Cálculo de la Calificación Completiva

```
FUNCIÓN: calcular_completiva(CF, COMP)

  Donde:
    CF   = Calificación Final del área (resultado del Paso 2)
    COMP = Nota obtenida en la evaluación completiva

  FÓRMULA:
    CF_COMPLETIVA = REDONDEAR( (CF × 0.50) + (COMP × 0.50) )

  INTERPRETACIÓN:
    El 50% proviene del rendimiento durante el año (CF)
    El 50% proviene de la evaluación completiva (COMP)

  RESULTADO:
    Si CF_COMPLETIVA >= 70 → Estado área: APROBADO ✅
    Si CF_COMPLETIVA < 70  → Estado área: PENDIENTE EXTRAORDINARIA

  ⚠️ PENDIENTE DE VALIDACIÓN:
  Las ponderaciones exactas (50/50) deben confirmarse con la
  Ordenanza 04-2023 vigente. Pueden variar según el nivel o modalidad.
```

### 4.6 Paso 5 — Cálculo de la Calificación Extraordinaria

```
FUNCIÓN: calcular_extraordinaria(CF, COMP_FINAL, EXT)

  Donde:
    CF         = Calificación Final del área
    COMP_FINAL = Resultado de la completiva (si aplica)
    EXT        = Nota obtenida en la evaluación extraordinaria

  FÓRMULA (a confirmar con Ordenanza):
    CF_EXTRAORDINARIA = REDONDEAR(
      (CF × 0.30) + (EXT × 0.70)
    )

  Donde 0.30 y 0.70 son las ponderaciones definidas en la Ordenanza.

  RESULTADO:
    Si CF_EXTRAORDINARIA >= 70 → Estado área: APROBADO ✅
    Si CF_EXTRAORDINARIA < 70  → Estado área: REPROBADO ❌ (definitivo, pasa a evaluación especial o repitencia)

  ⚠️ Las fórmulas exactas de completiva y extraordinaria deben
  revisarse directamente en la Ordenanza 04-2023 antes de
  implementar el motor de cálculo.
```

### 4.7 Paso 6 — Determinación de la situación final del estudiante

```
FUNCIÓN: determinar_situacion_final(areas_del_estudiante)

  Para cada estudiante, después de todos los procesos:

  areas_reprobadas_final = COUNT de áreas con estado REPROBADO

  SI areas_reprobadas_final == 0:
    situacion_final = "PROMOVIDO" ✅

  SI areas_reprobadas_final >= 1 Y areas_reprobadas_final <= 2:
    situacion_final = "EVALUACION_ESPECIAL" ⚠️
    [Pasa a evaluación especial antes del próximo año]

  SI areas_reprobadas_final >= 3:
    situacion_final = "REPROBADO" ❌
    [Debe repetir el grado]
```

### 4.8 Tabla de escalas y niveles de desempeño

```
FUNCIÓN: determinar_nivel_desempeno(calificacion)

  SI calificacion >= 89:  RETORNAR "Destacado"      (rango: 89-100)
  SI calificacion >= 77:  RETORNAR "Logrado"        (rango: 77-88)
  SI calificacion >= 70:  RETORNAR "En proceso"     (rango: 70-76)
  SI calificacion < 70:   RETORNAR "Insuficiente"   (rango: < 70)
  SI calificacion es nulo: RETORNAR "Sin evaluar"
```

### 4.9 Resumen visual del motor de cálculo

```
┌─────────────────────────────────────────────────────────────────┐
│                   MOTOR DE CÁLCULO SIGERA                      │
│                                                                 │
│  ENTRADA               PROCESO              SALIDA             │
│  ─────────             ────────             ──────             │
│                                                                 │
│  P1, RP1  ──► RP1 (Suma) = NE1 ──┐                           │
│  P2, RP2  ──► RP2 (Suma) = NE2 ──┤                           │
│  P3, RP3  ──► RP3 (Suma) = NE3 ──┤──► CF = ∑NE/4 ──┐        │
│  P4, RP4  ──► RP4 (Suma) = NE4 ──┘                   │        │
│                                                         │        │
│  ┌─────────────────────────────────────────────────────┤        │
│  │                                                     │        │
│  │  CF >= 70 ────────────────────────► APROBADO ✅    │        │
│  │                                                     │        │
│  │  CF < 70  ──► COMPLETIVA (CF×0.5 + COMP×0.5)       │        │
│  │                    │                                │        │
│  │               >= 70 ──────────────► APROBADO ✅    │        │
│  │               < 70  ──► EXTRAORDINARIA              │        │
│  │                             │                       │        │
│  │                        >= 70 ────► APROBADO ✅     │        │
│  │                        < 70  ────► EVAL_ESPECIAL / REPROBADO ❌ │        │
│  │                                                     │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Diseño de Pantallas

### 5.1 Principios de diseño de la interfaz

| Principio | Aplicación en SIGERA |
|---|---|
| **Familiaridad** | La vista de calificaciones replica visualmente el registro de papel que el docente ya conoce |
| **Inmediatez** | Los cálculos se muestran en tiempo real mientras el docente escribe |
| **Claridad de errores** | Los campos inválidos se marcan en rojo con mensaje específico |
| **Feedback visual** | Indicadores de color para niveles de desempeño (verde/amarillo/rojo) |
| **Eficiencia** | Navegación por teclado (Tab) entre celdas, igual que una hoja de cálculo |
| **Responsive** | Funciona en computadora de escritorio, laptop y tablet |

---

### Pantalla 1 — Login

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                     ░░░ SIGERA ░░░                          ║
║          Sistema Inteligente de Gestión Educativa           ║
║              y Rendimiento Académico                        ║
║                                                              ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │                                                      │   ║
║  │   Usuario (correo electrónico)                       │   ║
║  │   ┌──────────────────────────────────────────────┐   │   ║
║  │   │                                              │   │   ║
║  │   └──────────────────────────────────────────────┘   │   ║
║  │                                                      │   ║
║  │   Contraseña                                         │   ║
║  │   ┌──────────────────────────────────────────────┐   │   ║
║  │   │ ••••••••••••                                 │   │   ║
║  │   └──────────────────────────────────────────────┘   │   ║
║  │                                                      │   ║
║  │   [  ¿Olvidaste tu contraseña?  ]                    │   ║
║  │                                                      │   ║
║  │   ┌──────────────────────────────────────────────┐   │   ║
║  │   │              INICIAR SESIÓN                  │   │   ║
║  │   └──────────────────────────────────────────────┘   │   ║
║  │                                                      │   ║
║  └──────────────────────────────────────────────────────┘   ║
║                                                              ║
║  Centro Educativo: [Nombre del centro configurado]           ║
║  Año escolar: 2025-2026                                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Elementos:**
- Campo de usuario (correo electrónico)
- Campo de contraseña (con toggle mostrar/ocultar)
- Enlace de recuperación de contraseña
- Botón de inicio de sesión
- Nombre del centro e año escolar en pie de página
- Logo SIGERA centrado

---

### Pantalla 2 — Dashboard Principal (según rol)

#### Dashboard del Docente:

```
╔══════════════════════════════════════════════════════════════════╗
║  SIGERA  [≡ Menú]   Año 2025-2026  P2 ACTIVO    Prof. García ▼ ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Buenos días, Prof. García                                       ║
║                                                                  ║
║  ┌────────────────────┐ ┌────────────────────┐                  ║
║  │  Mis asignaturas   │ │  Pendientes hoy    │                  ║
║  │       3            │ │       1            │                  ║
║  │  asignadas         │ │  sección sin notas │                  ║
║  └────────────────────┘ └────────────────────┘                  ║
║                                                                  ║
║  ┌────────────────────┐ ┌────────────────────┐                  ║
║  │  En recuperación   │ │  Promedio general  │                  ║
║  │       8            │ │      76.4          │                  ║
║  │  estudiantes       │ │  mis secciones     │                  ║
║  └────────────────────┘ └────────────────────┘                  ║
║                                                                  ║
║  ┌──────────────────────────────────────────────────────────┐   ║
║  │  Mis Secciones — Período 2                               │   ║
║  ├──────────────┬──────────────────┬──────────┬────────────┤   ║
║  │ Asignatura   │ Grado/Sección    │ Estado   │ Acción     │   ║
║  ├──────────────┼──────────────────┼──────────┼────────────┤   ║
║  │ Matemática   │ 2.º A            │ ✅ 100%  │ [Ver]      │   ║
║  │ Matemática   │ 2.º B            │ ⚠️ 85%   │ [Ingresar] │   ║
║  │ Matemática   │ 3.º A            │ ✅ 100%  │ [Ver]      │   ║
║  └──────────────┴──────────────────┴──────────┴────────────┘   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

#### Dashboard del Director:

```
╔══════════════════════════════════════════════════════════════════╗
║  SIGERA  [≡ Menú]   Año 2025-2026  P2 ACTIVO      Director ▼  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Panel General del Centro — Liceo Nacional XYZ                   ║
║                                                                  ║
║  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            ║
║  │ Estudiantes  │ │  Aprobados   │ │ En riesgo    │            ║
║  │    487       │ │    71.3%     │ │    12.4%     │            ║
║  │  activos     │ │  al momento  │ │  < 70 pts    │            ║
║  └──────────────┘ └──────────────┘ └──────────────┘            ║
║                                                                  ║
║  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            ║
║  │  Docentes    │ │ Promedio Gral│ │ Recuperación │            ║
║  │    24        │ │    74.8      │ │    60        │            ║
║  │  activos     │ │  del centro  │ │  estudiantes │            ║
║  └──────────────┘ └──────────────┘ └──────────────┘            ║
║                                                                  ║
║  RENDIMIENTO POR GRADO (Período 2)                               ║
║  ┌────────┬──────────────────┬────────┬────────┬────────────┐   ║
║  │ Grado  │ █████████░       │ Prom.  │ Aprod. │ En riesgo  │   ║
║  │ 1.º    │ ████████████░░░  │  78.2  │  82%   │  6%        │   ║
║  │ 2.º    │ ███████████░░░░  │  76.4  │  79%   │  8%        │   ║
║  │ 3.º    │ █████████░░░░░░  │  72.1  │  73%   │  14%       │   ║
║  │ 4.º    │ ████████░░░░░░░  │  70.8  │  71%   │  16%       │   ║
║  │ 5.º    │ ████████░░░░░░░  │  70.1  │  69%   │  18%       │   ║
║  │ 6.º    │ ███████░░░░░░░░  │  68.4  │  65%   │  22%       │   ║
║  └────────┴──────────────────┴────────┴────────┴────────────┘   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### Pantalla 3 — Registro de Calificaciones (pantalla principal del docente)

Esta es la pantalla más importante del sistema. Debe ser intuitiva, rápida y visualmente cercana al registro físico.

```
╔══════════════════════════════════════════════════════════════════════╗
║  SIGERA  [← Volver]    Matemática — 2.º A — Período 2              ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  [Guardar borrador]  [Marcar como completado]  [Exportar Excel]     ║
║                                                                      ║
║  Filtro: [Todos ▼]  Búsqueda: [_____________]  [🔍]                 ║
║                                                                      ║
║  COMPETENCIAS ESPECÍFICAS                                            ║
║  PC1: Números y operaciones                                          ║
║  PC2-PC3: Álgebra y funciones                                        ║
║  PC4-PC3: Geometría y medidas                                        ║
║  PC1-PC2: Estadística y probabilidad                                 ║
║                                                                      ║
╠═══╦══════════════════════╦════════╦════════╦════════╦════════╦══════╣
║ N°║ ESTUDIANTE           ║  PC1   ║  PC2   ║  PC3   ║  PC4   ║PROM. ║
╠═══╬══════════════════════╬════════╬════════╬════════╬════════╬══════╣
║ 1 ║ Abad García, Luis    ║  82    ║  78    ║  75    ║  80    ║  79  ║ ← Verde
║   ║ Recuperación P2      ║  ----  ║  ----  ║  ----  ║  ----  ║      ║
╠═══╬══════════════════════╬════════╬════════╬════════╬════════╬══════╣
║ 2 ║ Belén Mora, Ana      ║  62 ⚠️ ║  58 ⚠️ ║  70    ║  66    ║  64  ║ ← Rojo
║   ║ Recuperación P2      ║ [___]  ║ [___]  ║  ----  ║  ----  ║      ║
╠═══╬══════════════════════╬════════╬════════╬════════╬════════╬══════╣
║ 3 ║ Castro Díaz, Pedro   ║  75    ║  77    ║  80    ║  72    ║  76  ║ ← Verde
║   ║ Recuperación P2      ║  ----  ║  ----  ║  ----  ║  ----  ║      ║
╠═══╬══════════════════════╬════════╬════════╬════════╬════════╬══════╣
║ 4 ║ Fernández, José      ║ [___]  ║ [___]  ║ [___]  ║ [___]  ║  --  ║ ← Sin datos
║   ║ Recuperación P2      ║  ----  ║  ----  ║  ----  ║  ----  ║      ║
╠═══╩══════════════════════╩════════╩════════╩════════╩════════╩══════╣
║                                                                      ║
║  RESUMEN DE LA SECCIÓN                                               ║
║  ┌─────────────────┬──────────────────────────────────────────────┐ ║
║  │ Promedio sección│  76.4  ████████████████░░░░                  │ ║
║  │ Aprobados       │  24 (88.9%)                                  │ ║
║  │ En recuperación │   3 (11.1%)  ← Resaltado en naranja         │ ║
║  │ Sin calificar   │   1          ← Resaltado en gris             │ ║
║  └─────────────────┴──────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Comportamiento de los campos:**
- `[___]` = Campo editable (período abierto)
- `82` = Valor guardado (no editable si período cerrado)
- `62 ⚠️` = Valor < 70, marcado en rojo con ícono de alerta
- `----` = Campo deshabilitado (recuperación no aplica porque la nota >= 70)
- `[___]` en recuperación = Campo habilitado porque la nota del período fue < 70

---

### Pantalla 4 — Vista del Registro Completo (por asignatura, año completo)

Esta pantalla muestra todos los períodos a la vez, igual que el registro físico:

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║  SIGERA — Registro Completo: Matemática | 2.º A | 2025-2026                 ║
╠═══╦═══════════════════╦══════════════╦══════════════╦══════════════╦═════════╣
║   ║                   ║   PERÍODO 1  ║   PERÍODO 2  ║   PERÍODO 3  ║  FINAL  ║
║ N°║ ESTUDIANTE        ╠══╦══╦══╦═══╬══╦══╦══╦═══╬══╦══╦══╦═══╬═════╦══════╣
║   ║                   ║C1║C2║C3║P1 ║C1║C2║C3║P2 ║C1║C2║C3║P3 ║  CF ║  Sit ║
╠═══╬═══════════════════╬══╬══╬══╬═══╬══╬══╬══╬═══╬══╬══╬══╬═══╬═════╬══════╣
║ 1 ║ Abad García, Luis ║82║78║75║78 ║82║78║75║79 ║85║80║78║81 ║  79 ║  ✅  ║
║ 2 ║ Belén Mora, Ana   ║62║58║70║63 ║74║72║70║72 ║  ║  ║  ║-- ║  -- ║  --  ║
║   ║ Recuperación      ║74║70║--║74 ║--║--║--║-- ║  ║  ║  ║   ║     ║      ║
╚═══╩═══════════════════╩══╩══╩══╩═══╩══╩══╩══╩═══╩══╩══╩══╩═══╩═════╩══════╝
```

---

### Pantalla 5 — Estudiante: Perfil Completo

```
╔══════════════════════════════════════════════════════════════════════╗
║  SIGERA  [← Volver]    Perfil del Estudiante                        ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ┌─────────────────────────────────────────────────────────────────┐ ║
║  │  👤 Belén Mora, Ana María                                       │ ║
║  │  RNE: 00-1234-5678   N.º Orden: 02   Sección: 2.º A           │ ║
║  │  Condición: Promovida    Estado: Activa                         │ ║
║  └─────────────────────────────────────────────────────────────────┘ ║
║                                                                      ║
║  [Datos Personales] [Calificaciones] [Asistencia] [Historial]        ║
║  ─────────────────────────────────────────────────────────────────── ║
║  CALIFICACIONES — Año 2025-2026                                       ║
║                                                                      ║
║  ┌─────────────────────┬────┬────┬────┬────┬──────┬────────────┐    ║
║  │ Asignatura          │ P1 │ P2 │ P3 │ P4 │  CF  │ Situación  │    ║
║  ├─────────────────────┼────┼────┼────┼────┼──────┼────────────┤    ║
║  │ Lengua Española     │ 80 │ 78 │ 82 │ -- │  --  │ En curso   │    ║
║  │ Matemática          │ 74 │ 72 │ -- │ -- │  --  │ En curso   │    ║
║  │ Ciencias Naturales  │ 85 │ 88 │ -- │ -- │  --  │ En curso   │    ║
║  │ Ciencias Sociales   │ 77 │ 79 │ -- │ -- │  --  │ En curso   │    ║
║  │ Inglés              │ 68 │ 70 │ -- │ -- │  --  │ En curso   │    ║
║  └─────────────────────┴────┴────┴────┴────┴──────┴────────────┘    ║
║                                                                      ║
║  Promedio general actual: 76.2   Nivel: Logrado                     ║
║                                                                      ║
║  [Generar Boletín Actual]  [Ver Historial Completo]                  ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

### Pantalla 6 — Cierre de Período (Coordinador)

```
╔══════════════════════════════════════════════════════════════════════╗
║  SIGERA — Cierre de Período 2                                        ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Estado de completitud — Período 2                                   ║
║                                                                      ║
║  ┌───────────┬──────────────────┬──────────────┬───────────────────┐ ║
║  │ Grado/Sec │ Asignatura       │ Completitud  │ Docente           │ ║
║  ├───────────┼──────────────────┼──────────────┼───────────────────┤ ║
║  │ 1.º A     │ Matemática       │ ✅ 100%      │ Prof. García      │ ║
║  │ 1.º A     │ Lengua Española  │ ✅ 100%      │ Prof. Pérez       │ ║
║  │ 1.º B     │ Matemática       │ ⚠️  85%      │ Prof. García      │ ║
║  │ 2.º A     │ Inglés           │ ❌   0%      │ Prof. Martínez    │ ║
║  │ 2.º B     │ Ciencias Nat.    │ ✅ 100%      │ Prof. Rodríguez   │ ║
║  └───────────┴──────────────────┴──────────────┴───────────────────┘ ║
║                                                                      ║
║  ⚠️  Hay 2 secciones con calificaciones incompletas.                 ║
║  No se puede cerrar el período hasta que estén al 100%.              ║
║                                                                      ║
║  [Notificar a docentes pendientes]  [Ver detalle de faltantes]       ║
║                                                                      ║
║  ─────────────────────────────────────────────────────────────────── ║
║  Cuando todo esté completo:                                           ║
║  ┌──────────────────────────────────────────────────────────────┐    ║
║  │  [  CONFIRMAR CIERRE DEL PERÍODO 2  ]  ← Botón deshabilitado ║    ║
║  └──────────────────────────────────────────────────────────────┘    ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

### Pantalla 7 — Generación de Boletín

```
╔══════════════════════════════════════════════════════════════════════╗
║  SIGERA — Generación de Boletines                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ¿Qué tipo de boletín deseas generar?                                ║
║                                                                      ║
║  ( ) Boletín individual                                              ║
║      Estudiante: [Buscar por nombre o RNE...]                        ║
║                                                                      ║
║  (●) Boletines de una sección                                        ║
║      Grado:   [2.º ▼]   Sección: [A ▼]                              ║
║                                                                      ║
║  ( ) Boletines de un grado completo                                  ║
║      Grado:   [___ ▼]                                                ║
║                                                                      ║
║  Período a incluir:                                                   ║
║  (●) Período 2 (actual)                                              ║
║  ( ) Período 1                                                       ║
║  ( ) Boletín final del año (todos los períodos)                      ║
║                                                                      ║
║  Opciones adicionales:                                               ║
║  [✓] Incluir observaciones del docente                               ║
║  [✓] Incluir espacio para firma                                      ║
║  [ ] Incluir código QR de verificación                               ║
║                                                                      ║
║  ┌──────────────────────────────────────────────────────────────┐    ║
║  │              GENERAR BOLETINES EN PDF                        │    ║
║  └──────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

### Pantalla 8 — Reportes Académicos

```
╔══════════════════════════════════════════════════════════════════════╗
║  SIGERA — Reportes Académicos                                        ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  FILTROS                                                             ║
║  Año escolar: [2025-2026 ▼]  Período: [Todos ▼]                     ║
║  Grado: [Todos ▼]  Sección: [Todas ▼]  Asignatura: [Todas ▼]       ║
║                                                                      ║
║  TIPO DE REPORTE                                                     ║
║  ┌─────────────────────────────────────────────────────────────┐     ║
║  │  [📊 Rendimiento general]  [👥 Por sección]  [📚 Por asig.] │     ║
║  │  [✅ Aprobados]  [⚠️ En recuperación]  [❌ Reprobados]     │     ║
║  │  [🏆 Honor Roll]  [🚨 Riesgo académico]  [👨‍🏫 Por docente] │     ║
║  └─────────────────────────────────────────────────────────────┘     ║
║                                                                      ║
║  RESULTADOS — Estudiantes en Riesgo Académico (P2, Todos los grados)║
║  ┌────┬────────────────────┬───────┬──────────┬───────────────────┐  ║
║  │ N° │ Estudiante         │ Grado │ Promedio │ Áreas críticas    │  ║
║  ├────┼────────────────────┼───────┼──────────┼───────────────────┤  ║
║  │  1 │ Belén Mora, Ana    │ 2.º A │   64.2   │ Mat, Inglés       │  ║
║  │  2 │ Díaz Torres, Juan  │ 3.º B │   62.8   │ Mat, CN, CS       │  ║
║  │  3 │ Herrera, Carmen    │ 4.º A │   63.5   │ Matemática        │  ║
║  └────┴────────────────────┴───────┴──────────┴───────────────────┘  ║
║                                                                      ║
║  [Exportar Excel]  [Exportar PDF]  [Enviar a coordinación]           ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

### Pantalla 9 — Gestión de Estudiantes

```
╔══════════════════════════════════════════════════════════════════════╗
║  SIGERA — Gestión de Estudiantes                                     ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  [+ Nuevo Estudiante]  [📥 Importar Excel]  [📤 Exportar]           ║
║                                                                      ║
║  Buscar: [________________________] [🔍]                             ║
║  Filtrar por: Grado [Todos ▼]  Sección [Todas ▼]  Estado [Activo ▼] ║
║                                                                      ║
║  ┌────┬──────────────────────┬────────┬──────┬────────┬───────────┐  ║
║  │ N° │ Estudiante           │ Grado  │ Secc.│ Estado │ Acciones  │  ║
║  ├────┼──────────────────────┼────────┼──────┼────────┼───────────┤  ║
║  │ 01 │ Abad García, Luis    │ 2.º    │ A    │ Activo │ [✏️][👁️] │  ║
║  │ 02 │ Belén Mora, Ana      │ 2.º    │ A    │ Activo │ [✏️][👁️] │  ║
║  │ 03 │ Castro Díaz, Pedro   │ 2.º    │ B    │ Activo │ [✏️][👁️] │  ║
║  └────┴──────────────────────┴────────┴──────┴────────┴───────────┘  ║
║                                                                      ║
║  Total: 487 estudiantes  |  Pág. 1 de 20  [< Anterior] [Siguiente >]║
╚══════════════════════════════════════════════════════════════════════╝
```

---

### Pantalla 10 — Formulario de Registro de Estudiante

```
╔══════════════════════════════════════════════════════════════════════╗
║  SIGERA — Nuevo Estudiante                                           ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  DATOS PERSONALES                                                    ║
║  ┌──────────────────────────────┬───────────────────────────────┐    ║
║  │ Primer nombre *              │ Segundo nombre                │    ║
║  │ [___________________________]│ [____________________________]│    ║
║  ├──────────────────────────────┼───────────────────────────────┤    ║
║  │ Primer apellido *            │ Segundo apellido              │    ║
║  │ [___________________________]│ [____________________________]│    ║
║  ├──────────────────────────────┼───────────────────────────────┤    ║
║  │ RNE *                        │ Cédula                        │    ║
║  │ [___________________________]│ [____________________________]│    ║
║  ├──────────────────────────────┼───────────────────────────────┤    ║
║  │ Sexo *          │ Fecha de nacimiento *                      │    ║
║  │ (●) M  ( ) F   │ [DD/MM/AAAA]                               │    ║
║  └──────────────────────────────┴───────────────────────────────┘    ║
║                                                                      ║
║  INFORMACIÓN ACADÉMICA                                               ║
║  Grado *: [2.º ▼]   Sección *: [A ▼]                               ║
║  Condición inicial *: [Promovido ▼]                                 ║
║                                                                      ║
║  DATOS FAMILIARES                                                    ║
║  Padre:  [_________________________________]  Tel: [____________]   ║
║  Madre:  [_________________________________]  Tel: [____________]   ║
║  Tutor:  [_________________________________]  Tel: [____________]   ║
║  Correo representante: [________________________________]           ║
║  Condición médica: [________________________________]               ║
║                                                                      ║
║  [Cancelar]                         [Guardar Estudiante]            ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

### Pantalla 11 — Lista de Completiva/Extraordinaria

```
╔══════════════════════════════════════════════════════════════════════╗
║  SIGERA — Lista de Evaluación Completiva — Año 2025-2026            ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Total en completiva: 34 estudiantes                                 ║
║                                                                      ║
║  ┌────┬───────────────────┬───────┬──────────────┬──────┬─────────┐  ║
║  │ N° │ Estudiante        │ Grado │ Área         │  CF  │ Comp.   │  ║
║  ├────┼───────────────────┼───────┼──────────────┼──────┼─────────┤  ║
║  │  1 │ Belén Mora, Ana   │ 2.º A │ Matemática   │  62  │ [___]   │  ║
║  │  1 │ Belén Mora, Ana   │ 2.º A │ Inglés       │  60  │ [___]   │  ║
║  │  2 │ Díaz Torres, Juan │ 3.º B │ Matemática   │  58  │ [___]   │  ║
║  └────┴───────────────────┴───────┴──────────────┴──────┴─────────┘  ║
║                                                                      ║
║  [Guardar notas de completiva]  [Ver resultados automáticos]         ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

### Pantalla 12 — Log de Auditoría

```
╔══════════════════════════════════════════════════════════════════════╗
║  SIGERA — Historial de Cambios (Auditoría)                           ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Filtros: Usuario [Todos ▼]  Período [Todos ▼]  Fecha [____/____]   ║
║                                                                      ║
║  ┌──────────────────┬────────────┬──────────────────┬────┬────┬────┐ ║
║  │ Fecha/Hora       │ Usuario    │ Registro         │ Ant│Nvo │ Just║
║  ├──────────────────┼────────────┼──────────────────┼────┼────┼────┤ ║
║  │ 2026-08-05 14:32 │ Prof.García│ Belén/Mat/P2/PC1 │ 62 │ 68 │ ✏️ │ ║
║  │ 2026-08-04 09:15 │ Admin      │ Díaz/Ing/P1/PC2  │ 70 │ 72 │ ✏️ │ ║
║  └──────────────────┴────────────┴──────────────────┴────┴────┴────┘ ║
║                                                                      ║
║  [Exportar log completo]                                             ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 6. Flujo de Navegación del Sistema

```
LOGIN
  │
  ▼
DASHBOARD (según rol)
  │
  ├── ESTUDIANTES ──────────────────────────────────┐
  │     ├── Lista de estudiantes                    │
  │     ├── Nuevo estudiante / Importar             │
  │     └── Perfil del estudiante                  │
  │           ├── Datos personales                 │
  │           ├── Calificaciones (solo lectura)    │
  │           └── Historial                        │
  │                                                 │
  ├── CALIFICACIONES ───────────────────────────────┤
  │     ├── Selección: Asignatura / Grado / Período │
  │     ├── Registro de calificaciones              │
  │     ├── Registro de recuperación               │
  │     └── Vista completa del año                 │
  │                                                 │
  ├── EVALUACIONES ESPECIALES ──────────────────────┤
  │     ├── Lista de completiva                     │
  │     └── Lista de extraordinaria                │
  │                                                 │
  ├── BOLETINES ────────────────────────────────────┤
  │     ├── Generación individual                  │
  │     ├── Generación por sección                 │
  │     └── Historial de boletines                 │
  │                                                 │
  ├── REPORTES ─────────────────────────────────────┤
  │     ├── Rendimiento general                    │
  │     ├── Por sección / grado / asignatura       │
  │     ├── Aprobados / Reprobados / Recuperación  │
  │     └── Exportar datos                         │
  │                                                 │
  ├── CONFIGURACIÓN (solo Admin) ───────────────────┤
  │     ├── Año escolar                            │
  │     ├── Grados y secciones                    │
  │     ├── Asignaturas y competencias             │
  │     ├── Docentes                               │
  │     └── Usuarios y roles                       │
  │                                                 │
  └── AUDITORÍA (Admin / Coordinador) ─────────────┘
        └── Log de cambios
```

---

## 7. Especificaciones de Componentes Clave

### 7.1 Componente: Tabla de Calificaciones

| Propiedad | Especificación |
|---|---|
| **Navegación** | Tab entre celdas (izquierda a derecha, arriba a abajo) |
| **Autoguardado** | Cada celda se guarda al salir del campo (on blur) |
| **Validación en tiempo real** | Rango 0-100, solo números enteros (mínimo de aprobación: 70) |
| **Cálculo del promedio** | Se actualiza instantáneamente al escribir |
| **Color de filas** | Verde (≥ 77), Amarillo (70-76), Rojo (< 70) |
| **Campo de recuperación** | Solo habilitado si la nota del período < 70 |
| **Indicador de estado** | ✅ Guardado / ⏳ Sin guardar / ⚠️ Error |
| **Barra de progreso** | Muestra % de completitud de la sección |
| **Modo vista** | Alterna entre "edición" y "solo lectura" según el estado del período |

### 7.2 Componente: Boletín PDF

| Propiedad | Especificación |
|---|---|
| **Tamaño del papel** | Carta (8.5" × 11") |
| **Orientación** | Portrait (vertical) |
| **Formato** | Réplica del boletín oficial MINERD |
| **Fuente** | Arial o similar (legible en impresión) |
| **Colores** | Escala de grises (optimizado para impresora básica) |
| **Datos automáticos** | Centro, año escolar, estudiante, calificaciones, promedios |
| **Datos manuales** | Observaciones del docente |
| **Firmas** | Espacio reservado para firma física o firma digital |
| **Idioma** | Español |

### 7.3 Componente: Sistema de Alertas

| Tipo de alerta | Dónde aparece | Cuándo se activa |
|---|---|---|
| Banner rojo en tabla | Celda de calificación | Nota ingresada < 70 |
| Contador en dashboard | Tarjeta "En recuperación" | Al guardar nota < 70 |
| Ícono en lista de secciones | Columna "Estado" | Calificación incompleta al 3 días del cierre |
| Notificación por correo | Correo del coordinador | Sección con 0% de registro |
| Badge en menú | Menú principal | Hay pendientes urgentes |

---

## 8. Requisitos No Funcionales

### 8.1 Rendimiento

| Requisito | Especificación |
|---|---|
| Tiempo de carga del dashboard | < 2 segundos |
| Tiempo de carga de tabla de calificaciones | < 1 segundo |
| Tiempo de generación de boletín individual | < 3 segundos |
| Tiempo de generación de boletines de sección (30 estudiantes) | < 10 segundos |
| Usuarios concurrentes soportados (Etapa 1) | 50 simultáneos |
| Usuarios concurrentes soportados (Etapa 3) | 200 simultáneos |

### 8.2 Disponibilidad

| Requisito | Especificación |
|---|---|
| Disponibilidad del sistema | 99% en días hábiles |
| Ventana de mantenimiento | Domingos, 1:00 AM a 5:00 AM |
| Backups automáticos | Diarios a las 2:00 AM |
| Retención de backups | 30 días |

### 8.3 Seguridad

| Requisito | Especificación |
|---|---|
| Autenticación | Usuario/contraseña con JWT |
| Contraseñas | Mínimo 8 caracteres, bcrypt hash |
| Sesiones | Cierre automático por inactividad (30 minutos) |
| HTTPS | Obligatorio en producción |
| Roles | Sistema RBAC (Role-Based Access Control) |
| Auditoría | Todo cambio en calificaciones queda registrado |

### 8.4 Usabilidad

| Requisito | Especificación |
|---|---|
| Curva de aprendizaje | Un docente debe poder ingresar calificaciones sin capacitación después de 15 minutos de tutorial |
| Compatibilidad de navegadores | Chrome 90+, Firefox 88+, Edge 90+, Safari 14+ |
| Soporte de dispositivos | Desktop, laptop, tablet (mínimo 768px de ancho) |
| Idioma | Español (República Dominicana) |
| Accesibilidad | WCAG 2.1 nivel AA (contraste, texto alternativo) |

### 8.5 Datos y exportación

| Requisito | Especificación |
|---|---|
| Formato de exportación Excel | `.xlsx` compatible con Microsoft Excel 2013+ |
| Formato de boletines | `.pdf` compatible con Adobe Reader y navegadores |
| Exportación para Power BI | `.csv` con estructura definida en el Capítulo 6 |
| Importación de estudiantes | `.xlsx` con plantilla provista por SIGERA |

---

## Resumen del Capítulo 3

| Elemento documentado | Cantidad |
|---|---|
| Casos de uso | 20 |
| Historias de usuario | 26 |
| Pasos del motor de cálculo | 6 |
| Fórmulas matemáticas | 4 |
| Pantallas diseñadas | 12 |
| Componentes especificados | 3 |
| Requisitos no funcionales | 22 |

---

## Historial de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| 1.0 | Agosto 2026 | Equipo SIGERA | Primera versión del Capítulo 3 |

---

*Este documento forma parte del Documento de Arquitectura Funcional (DAF) de SIGERA.*

**Capítulo anterior:** [Capítulo 2 — Arquitectura del Negocio](./SIGERA_DAF_Cap2_Arquitectura_Negocio.md)  
**Siguiente capítulo:** [Capítulo 4 — Arquitectura de Datos](./SIGERA_DAF_Cap4_Arquitectura_Datos.md)

---
*© 2026 SIGERA — Todos los derechos reservados*
