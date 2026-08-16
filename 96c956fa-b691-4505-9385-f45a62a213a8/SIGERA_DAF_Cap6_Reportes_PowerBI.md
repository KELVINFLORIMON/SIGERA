# SIGERA
## Sistema Inteligente de Gestión Educativa y Rendimiento Académico
### Documento de Arquitectura Funcional (DAF)
#### Capítulo 6 — Reportes y Power BI

---

**Versión:** 1.0  
**Fecha:** Agosto 2026  
**Estado:** Borrador para revisión  
**Referencia anterior:** [Capítulo 5 — Arquitectura de Software](./SIGERA_DAF_Cap5_Arquitectura_Software.md)

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Catálogo de Reportes del Sistema](#2-catálogo-de-reportes-del-sistema)
3. [Reportes Integrados en SIGERA (PDF y Excel)](#3-reportes-integrados-en-sigera-pdf-y-excel)
4. [Dataset de Exportación para Power BI](#4-dataset-de-exportación-para-power-bi)
5. [Modelo de Datos Estrella para Power BI](#5-modelo-de-datos-estrella-para-power-bi)
6. [KPIs Académicos y Fórmulas DAX](#6-kpis-académicos-y-fórmulas-dax)
7. [Diseño de Dashboards por Rol](#7-diseño-de-dashboards-por-rol)
8. [Estrategia de Conexión Power BI ↔ SIGERA](#8-estrategia-de-conexión-power-bi--sigera)
9. [Especificaciones Técnicas de los Reportes](#9-especificaciones-técnicas-de-los-reportes)

---

## 1. Introducción

El módulo de reportes de SIGERA tiene dos niveles:

**Nivel 1 — Reportes integrados en la aplicación:**
Generados directamente desde la interfaz web. Son reportes operativos inmediatos que el docente, coordinador y director necesitan en el día a día: listas de aprobados, estudiantes en riesgo, boletines, actas.

**Nivel 2 — Analítica estratégica en Power BI:**
SIGERA exporta un dataset limpio y estructurado que se conecta a Power BI para producir dashboards interactivos de análisis institucional, comparativos entre períodos, tendencias y KPIs ejecutivos para la dirección y la coordinación.

### 1.1 Principio de diseño de reportes

> *"Un reporte que tarda más de 3 segundos en cargar nunca se usa."*

Todos los reportes de SIGERA se diseñan con rendimiento como prioridad:
- Las vistas materializadas en PostgreSQL pre-calculan los agregados más usados.
- Los endpoints de reportes usan paginación y filtros obligatorios.
- El dataset de Power BI se exporta en batch (no en tiempo real) para evitar carga en producción.

---

## 2. Catálogo de Reportes del Sistema

SIGERA genera **20 reportes** organizados en cuatro categorías:

### 2.1 Reportes Académicos Operativos

| ID | Nombre del Reporte | Descripción | Formato | Rol mínimo |
|---|---|---|---|---|
| R-01 | Calificaciones por sección | Todas las notas de una sección en una asignatura | Pantalla + Excel | Docente |
| R-02 | Registro de grado completo | Vista anual completa de una sección (todos los períodos) | Pantalla + PDF | Docente |
| R-03 | Estudiantes en recuperación | Lista con asignatura y competencia específica | Pantalla + Excel | Docente |
| R-04 | Lista de completiva | Estudiantes con CF < 70 al cierre del año | Pantalla + PDF | Coordinador |
| R-05 | Lista de extraordinaria | Estudiantes que no aprobaron la completiva | Pantalla + PDF | Coordinador |
| R-06 | Acta de rendimiento | Resumen oficial de resultados del grado | PDF imprimible | Coordinador |

### 2.2 Reportes de Rendimiento Institucional

| ID | Nombre del Reporte | Descripción | Formato | Rol mínimo |
|---|---|---|---|---|
| R-07 | Rendimiento general | Promedio, aprobados, reprobados por grado/sección | Pantalla + Excel | Coordinador |
| R-08 | Comparativo entre períodos | Evolución del promedio P1→P2→P3→P4 | Gráfica + Excel | Coordinador |
| R-09 | Rendimiento por asignatura | Promedio de cada asignatura en el centro | Pantalla + Excel | Coordinador |
| R-10 | Rendimiento por docente | Promedio de las secciones de cada docente | Pantalla + Excel | Director |
| R-11 | Honor Roll | Estudiantes con promedio ≥ 89 (Destacados) | Pantalla + PDF | Coordinador |
| R-12 | Riesgo académico | Estudiantes con promedio < 70 o en recuperación | Pantalla + Excel | Coordinador |

### 2.3 Reportes Estadísticos

| ID | Nombre del Reporte | Descripción | Formato | Rol mínimo |
|---|---|---|---|---|
| R-13 | Estadísticas finales del año | Totales de aprobados, reprobados, retirados | PDF | Director |
| R-13b| Evaluaciones Especiales | 1-2 materias aplazadas post-extraordinaria | Pantalla + PDF | Coordinador |
| R-14 | Distribución por nivel de desempeño | Cuántos estudiantes en cada nivel (D/L/EP/I) | Gráfica + Excel | Coordinador |
| R-15 | Competencias críticas | Competencias con menor promedio en el centro | Pantalla + Excel | Coordinador |
| R-16 | Asistencia general *(Etapa 2)* | Porcentaje de asistencia por sección | Pantalla + Excel | Coordinador |

### 2.4 Reportes para Power BI

| ID | Nombre del Reporte | Descripción | Formato |
|---|---|---|---|
| R-17 | Dataset académico completo | Todas las calificaciones del año en formato plano | CSV / JSON |
| R-18 | Dataset de estudiantes | Datos demográficos y situación final | CSV |
| R-19 | Dataset de docentes | Carga académica y rendimiento promedio | CSV |
| R-20 | Dataset histórico multi-año | Datos de años anteriores para tendencias | CSV |

---

## 3. Reportes Integrados en SIGERA (PDF y Excel)

### 3.1 R-02 — Registro de Grado Completo (PDF oficial)

Este es el reporte más importante del sistema. Reproduce exactamente el Registro de Grado oficial del MINERD para impresión.

**Estructura del documento:**

```
╔══════════════════════════════════════════════════════════════════╗
║           REGISTRO DE GRADO — MINERD                           ║
║           [Nombre del Centro] — [Código MINERD]                ║
╠══════════════════════════════════════════════════════════════════╣
║  SECCIÓN 1: DATOS DEL CENTRO                                    ║
║  Regional: ___  Distrito: ___  Año: ___  Tanda: ___            ║
║  Grado: ___  Sección: ___  Docente: ___                        ║
╠══════════════════════════════════════════════════════════════════╣
║  SECCIÓN 2: NÓMINA DE ESTUDIANTES Y CALIFICACIONES             ║
║  ┌──┬──────────────┬───┬──────────────────────────┬──────────┐ ║
║  │N°│ Estudiante   │ RNE│ P1  RP1  P2  RP2  P3  RP3  P4  RP4 │CF│Sit║
║  └──┴──────────────┴───┴──────────────────────────┴──────────┘ ║
╠══════════════════════════════════════════════════════════════════╣
║  SECCIÓN 3: ESTADÍSTICAS FINALES                                ║
║  Promovidos: ___  Reprobados: ___  Retirados: ___  Total: ___  ║
╠══════════════════════════════════════════════════════════════════╣
║  SECCIÓN 4: FIRMAS                                              ║
║  Docente: ____________  Director: ____________  Fecha: _______ ║
╚══════════════════════════════════════════════════════════════════╝
```

**Generación:**
- Disponible al cierre de cada período (parcial) y al cierre del año (final).
- Formato: PDF A4 / Carta, orientación landscape.
- Una página por asignatura o una vista consolidada según el formato MINERD.

---

### 3.2 R-06 — Acta de Rendimiento

```
╔══════════════════════════════════════════════════════════════════╗
║                    ACTA DE RENDIMIENTO                         ║
║              Año Escolar 2025-2026 — [Centro]                  ║
╠══════════════════════════════════════════════════════════════════╣
║  Grado: 2.º   Sección: A   Tanda: Matutina                    ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  RESUMEN DE RESULTADOS FINALES                                   ║
║                                                                  ║
║  Total de estudiantes matriculados: 30                          ║
║  Estudiantes activos al cierre:     28                          ║
║  Retirados durante el año:           2                          ║
║                                                                  ║
║  ┌──────────────────────────────────────────────────────────┐   ║
║  │ Promovidos:              22  (78.6%)                     │   ║
║  │ Promovidos con condición:  2  ( 7.1%)                    │   ║
║  │ Reprobados:               4  (14.3%)                     │   ║
║  └──────────────────────────────────────────────────────────┘   ║
║                                                                  ║
║  PROMEDIO GENERAL DEL GRADO: 76.4                               ║
║                                                                  ║
║  DISTRIBUCIÓN POR NIVEL DE DESEMPEÑO:                           ║
║  Destacado (89-100):    4 estudiantes (14.3%)                   ║
║  Logrado (77-88):       12 estudiantes (42.9%)                  ║
║  En proceso (70-76):    6 estudiantes (21.4%)                   ║
║  Insuficiente (< 70):   6 estudiantes (21.4%)                   ║
║                                                                  ║
║  ASIGNATURA CON MAYOR RENDIMIENTO: Lengua Española (80.2)       ║
║  ASIGNATURA CON MENOR RENDIMIENTO: Matemática (68.4)            ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  Firma del Coordinador: ____________  Fecha: __________________ ║
║  Firma del Director:    ____________  Sello: __________________ ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 3.3 R-12 — Reporte de Riesgo Académico (Excel)

Este reporte es crítico para la intervención temprana del coordinador.

**Estructura del Excel:**

| Hoja | Contenido |
|---|---|
| **Resumen** | Totales por grado y sección |
| **Detalle** | Un estudiante por fila con todas sus calificaciones |
| **Por asignatura** | Qué asignaturas concentran más riesgo |
| **Por docente** | Qué docentes tienen más estudiantes en riesgo |

**Columnas del detalle:**

```
A: Número de orden
B: Nombre completo del estudiante
C: RNE
D: Grado
E: Sección
F: Asignatura
G: P1 (nota efectiva)
H: P2 (nota efectiva)
I: P3 (nota efectiva)
J: P4 (nota efectiva)
K: Calificación Final
L: Situación (En recuperación / En completiva / Reprobado)
M: Docente responsable
N: Teléfono del representante
```

---

### 3.4 R-13b — Reporte de Evaluaciones Especiales

Este reporte identifica a los estudiantes que aplicarán a Evaluaciones Especiales (aquellos que reprobaron 1 o 2 asignaturas después de ir a pruebas extraordinarias). Permite al Coordinador gestionar el calendario y los jurados para estas pruebas. Se exporta en PDF y lista a los estudiantes con las asignaturas pendientes y las calificaciones previas.

---

## 4. Dataset de Exportación para Power BI

El endpoint `GET /reportes/exportar/power-bi` genera un paquete ZIP con **7 archivos CSV** que forman el modelo de datos para Power BI.

### 4.1 Archivo 1: `dim_estudiantes.csv`

Tabla de dimensión con los datos de los estudiantes.

```csv
estudiante_id, rne, nombre_completo, primer_nombre, primer_apellido,
sexo, fecha_nacimiento, edad,
grado_nombre, grado_numero, seccion, numero_orden,
condicion_inicial, estado, anio_escolar,
centro_nombre, regional, distrito
```

**Ejemplo de fila:**
```csv
42, "00-1234-5678", "Belén Mora, Ana María", "Ana María", "Belén Mora",
"F", "2010-03-15", 16,
"Segundo Grado", 2, "A", 2,
"PROMOVIDO", "ACTIVO", "2025-2026",
"Liceo Nacional XYZ", "Regional 10", "Distrito 10-04"
```

---

### 4.2 Archivo 2: `fact_calificaciones.csv`

Tabla de hechos central. Una fila por estudiante × asignatura.

```csv
calificacion_id, estudiante_id, asignatura_codigo, asignatura_nombre,
anio_escolar,
nota_p1, nota_rp1, nota_efectiva_p1,
nota_p2, nota_rp2, nota_efectiva_p2,
nota_p3, nota_rp3, nota_efectiva_p3,
nota_p4, nota_rp4, nota_efectiva_p4,
calificacion_final,
nota_completiva, calificacion_completiva,
nota_extraordinaria, calificacion_extraordinaria,
situacion_final, nivel_desempeno,
docente_id, seccion_id
```

*(Nota: El campo `nivel_desempeno` puede contener los valores: 'DESTACADO', 'LOGRADO', 'EN_PROCESO', 'INSUFICIENTE')*

**Ejemplo de fila:**
```csv
1088, 42, "MAT", "Matemática",
"2025-2026",
74, 80, 80,
72, null, 72,
null, null, null,
null, null, null,
null,
null, null,
null, null,
"EN_COMPLETIVA", "INSUFICIENTE",
15, 7
```

---

### 4.3 Archivo 3: `fact_calificaciones_por_periodo.csv`

Tabla de hechos secundaria para análisis por período. Una fila por estudiante × asignatura × período.

```csv
estudiante_id, asignatura_codigo, anio_escolar, periodo_numero, periodo_nombre,
nota_periodo, nota_recuperacion, nota_efectiva,
nivel_desempeno, requiere_recuperacion,
docente_id, seccion_id, grado_numero
```

**Uso:** Permite analizar la evolución del rendimiento período a período en Power BI.

---

### 4.4 Archivo 4: `dim_asignaturas.csv`

```csv
asignatura_id, codigo, nombre, abreviatura, orden_boletin
```

```csv
4, "MAT", "Matemática", "Mat.", 4
1, "LES", "Lengua Española", "Español", 1
2, "ING", "Inglés", "Inglés", 2
```

---

### 4.5 Archivo 5: `dim_docentes.csv`

```csv
docente_id, nombre_completo, titulo, especialidad,
asignaturas_asignadas, secciones_asignadas,
total_estudiantes_a_cargo
```

---

### 4.6 Archivo 6: `dim_secciones.csv`

```csv
seccion_id, grado_numero, grado_nombre, seccion_nombre,
tanda, total_estudiantes_activos, total_retirados,
anio_escolar
```

---

### 4.7 Archivo 7: `resumen_anual.csv`

Una fila por grado × sección × asignatura. Contiene los agregados ya calculados para facilitar el análisis en Power BI sin necesidad de calcular en DAX.

```csv
anio_escolar, grado_numero, grado_nombre, seccion_nombre, asignatura_codigo,
docente_id, total_estudiantes,
promedio_p1, promedio_p2, promedio_p3, promedio_p4,
promedio_final,
total_aprobados, pct_aprobados,
total_reprobados, pct_reprobados,
total_en_completiva, total_en_extraordinaria,
total_destacados, total_logrados,
total_en_proceso, total_insuficientes
```

---

## 5. Modelo de Datos Estrella para Power BI

Power BI usa un modelo de datos estrella donde las tablas de hechos se conectan a las tablas de dimensión.

```
                    ┌──────────────────┐
                    │  dim_anio_escolar │
                    │  (calendario)     │
                    │  anio_escolar PK  │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌────────────────────┐    ┌──────────────┐
│dim_estudiantes│    │  fact_calificaciones│    │dim_asignaturas│
│               │    │  (tabla central)    │    │              │
│ estudiante_id ├───►│  estudiante_id  FK  │◄───┤asignatura_id │
│ nombre        │    │  asignatura_codigo  │    │ nombre       │
│ sexo          │    │  anio_escolar       │    │ codigo       │
│ grado         │    │  nota_p1..p4        │    └──────────────┘
│ seccion       │    │  calificacion_final │
│ condicion     │    │  situacion_final    │◄───┐
└──────────────┘    │  docente_id         │    │
                    │  seccion_id         │    │
                    └─────────┬───────────┘    │
                              │                 │
              ┌───────────────┴──────────┐      │
              ▼                          ▼      │
    ┌──────────────────┐      ┌──────────────────┐
    │   dim_docentes   │      │  dim_secciones   │
    │                  │      │                  │
    │  docente_id   PK │      │  seccion_id   PK │
    │  nombre          │      │  grado_numero    │
    │  especialidad    │      │  seccion_nombre  │
    └──────────────────┘      └──────────────────┘


SEGUNDA TABLA DE HECHOS (para análisis por período):

┌──────────────────────────────────────────┐
│  fact_calificaciones_por_periodo         │
│                                          │
│  estudiante_id    FK → dim_estudiantes   │
│  asignatura_codigo FK → dim_asignaturas  │
│  anio_escolar     FK → dim_anio_escolar  │
│  periodo_numero   FK → dim_periodos      │
│  nota_efectiva                           │
│  nivel_desempeno                         │
└──────────────────────────────────────────┘

┌──────────────────┐
│  dim_periodos    │
│  periodo_numero  │
│  periodo_nombre  │ ← "Primer Período", "Segundo Período", etc.
│  orden           │
└──────────────────┘
```

### 5.1 Relaciones del modelo

| Tabla de hechos | Campo | → | Dimensión | Campo |
|---|---|---|---|---|
| `fact_calificaciones` | `estudiante_id` | → | `dim_estudiantes` | `estudiante_id` |
| `fact_calificaciones` | `asignatura_codigo` | → | `dim_asignaturas` | `codigo` |
| `fact_calificaciones` | `docente_id` | → | `dim_docentes` | `docente_id` |
| `fact_calificaciones` | `seccion_id` | → | `dim_secciones` | `seccion_id` |
| `fact_calificaciones` | `anio_escolar` | → | `dim_anio_escolar` | `anio_escolar` |
| `fact_calificaciones_por_periodo` | `periodo_numero` | → | `dim_periodos` | `periodo_numero` |

---

## 6. KPIs Académicos y Fórmulas DAX

Los siguientes KPIs se implementan en Power BI usando fórmulas DAX.

### 6.1 KPIs de rendimiento

```dax
-- ════════════════════════════════════
-- KPI-01: Promedio General del Centro
-- ════════════════════════════════════
Promedio General =
AVERAGEX(
    fact_calificaciones,
    fact_calificaciones[calificacion_final]
)

-- ════════════════════════════════════
-- KPI-02: Porcentaje de Aprobados
-- ════════════════════════════════════
% Aprobados =
DIVIDE(
    COUNTROWS(
        FILTER(
            fact_calificaciones,
            fact_calificaciones[situacion_final] = "APROBADO"
        )
    ),
    COUNTROWS(fact_calificaciones),
    0
) * 100

-- ════════════════════════════════════
-- KPI-03: Porcentaje de Reprobados
-- ════════════════════════════════════
% Reprobados =
DIVIDE(
    COUNTROWS(
        FILTER(
            fact_calificaciones,
            fact_calificaciones[situacion_final] = "REPROBADO"
        )
    ),
    COUNTROWS(fact_calificaciones),
    0
) * 100

-- ════════════════════════════════════
-- KPI-04: Estudiantes en Riesgo
-- (calificación final < 70)
-- ════════════════════════════════════
Estudiantes en Riesgo =
COUNTROWS(
    FILTER(
        fact_calificaciones,
        fact_calificaciones[calificacion_final] < 70
    )
)

-- ════════════════════════════════════
-- KPI-05: Promedio por Período
-- ════════════════════════════════════
Promedio P1 =
AVERAGE(fact_calificaciones_por_periodo[nota_efectiva])
-- (Filtrado por periodo_numero = 1 en el visual)

-- ════════════════════════════════════
-- KPI-06: Asignatura con menor rendimiento
-- ════════════════════════════════════
Asignatura Crítica =
CALCULATE(
    FIRSTNONBLANK(dim_asignaturas[nombre], 1),
    TOPN(
        1,
        SUMMARIZE(
            fact_calificaciones,
            dim_asignaturas[nombre],
            "Prom", AVERAGE(fact_calificaciones[calificacion_final])
        ),
        [Prom], ASC
    )
)

-- ════════════════════════════════════
-- KPI-07: Total Honor Roll
-- (promedio general >= 89 = Destacado)
-- ════════════════════════════════════
Honor Roll =
COUNTROWS(
    FILTER(
        SUMMARIZE(
            fact_calificaciones,
            dim_estudiantes[estudiante_id],
            "PromedioEst",
            AVERAGE(fact_calificaciones[calificacion_final])
        ),
        [PromedioEst] >= 89
    )
)

-- ════════════════════════════════════
-- KPI-08: Variación entre períodos
-- ════════════════════════════════════
Variación P1 a P2 =
VAR PromP1 =
    CALCULATE(
        AVERAGE(fact_calificaciones_por_periodo[nota_efectiva]),
        dim_periodos[periodo_numero] = 1
    )
VAR PromP2 =
    CALCULATE(
        AVERAGE(fact_calificaciones_por_periodo[nota_efectiva]),
        dim_periodos[periodo_numero] = 2
    )
RETURN PromP2 - PromP1

-- ════════════════════════════════════
-- KPI-09: Rendimiento por docente
-- ════════════════════════════════════
Promedio por Docente =
AVERAGEX(
    RELATEDTABLE(fact_calificaciones),
    fact_calificaciones[calificacion_final]
)

-- ════════════════════════════════════
-- KPI-10: Tasa de completiva
-- ════════════════════════════════════
% En Completiva =
DIVIDE(
    COUNTROWS(
        FILTER(fact_calificaciones,
            fact_calificaciones[situacion_final] = "EN_COMPLETIVA")
    ),
    COUNTROWS(fact_calificaciones),
    0
) * 100
```

### 6.2 Medidas de distribución por nivel de desempeño y pruebas

```dax
-- ════════════════════════════════════
-- KPI-11: Calificación Completiva (50% CF + 50% CEC)
-- ════════════════════════════════════
Calculo Completiva = 
(0.50 * AVERAGE(fact_calificaciones[calificacion_final])) + (0.50 * AVERAGE(fact_calificaciones[nota_completiva]))

-- ════════════════════════════════════
-- KPI-12: Calificación Extraordinaria (30% CF + 70% CEX)
-- ════════════════════════════════════
Calculo Extraordinaria = 
(0.30 * AVERAGE(fact_calificaciones[calificacion_final])) + (0.70 * AVERAGE(fact_calificaciones[nota_extraordinaria]))

-- Total Destacados
Total Destacados =
COUNTROWS(
    FILTER(fact_calificaciones,
        fact_calificaciones[nivel_desempeno] = "DESTACADO")
)

-- Total Logrados
Total Logrados =
COUNTROWS(
    FILTER(fact_calificaciones,
        fact_calificaciones[nivel_desempeno] = "LOGRADO")
)

-- Total En Proceso
Total En Proceso =
COUNTROWS(
    FILTER(fact_calificaciones,
        fact_calificaciones[nivel_desempeno] = "EN_PROCESO")
)

-- Total Insuficientes
Total Insuficientes =
COUNTROWS(
    FILTER(fact_calificaciones,
        fact_calificaciones[nivel_desempeno] = "INSUFICIENTE")
)
```

---

## 7. Diseño de Dashboards por Rol

### 7.1 Dashboard del Director — Vista Ejecutiva

```
╔══════════════════════════════════════════════════════════════════════╗
║  SIGERA — Dashboard Ejecutivo   [Año 2025-2026]   [Período ▼]      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  INDICADORES CLAVE DEL CENTRO                                        ║
║  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐           ║
║  │  487           │ │   76.8         │ │   74.3%        │           ║
║  │  Estudiantes   │ │  Promedio      │ │  Aprobados     │           ║
║  │  activos       │ │  general       │ │  al momento    │           ║
║  └────────────────┘ └────────────────┘ └────────────────┘           ║
║                                                                      ║
║  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐           ║
║  │   12.8%        │ │   8.2%         │ │   18           ║           ║
║  │  En riesgo     │ │  En completiva │ │  Honor Roll    │           ║
║  │  (< 70 ptos)   │ │  al cierre año │ │  estudiantes   │           ║
║  └────────────────┘ └────────────────┘ └────────────────┘           ║
║                                                                      ║
║  ─────────────────────────────────────────────────────────────────  ║
║                                                                      ║
║  RENDIMIENTO POR GRADO           EVOLUCIÓN POR PERÍODO              ║
║  ┌─────────────────────────┐     ┌──────────────────────────────┐   ║
║  │ 1.º ████████████░░  78  │     │                              │   ║
║  │ 2.º ███████████░░░  76  │     │  80 ┤  ●───────●             │   ║
║  │ 3.º ██████████░░░░  74  │     │  75 ┤         ●───●          │   ║
║  │ 4.º █████████░░░░░  72  │     │  70 ┤●                       │   ║
║  │ 5.º ████████░░░░░░  70  │     │  65 ┤                        │   ║
║  │ 6.º ███████░░░░░░░  68  │     │     └──P1──P2──P3──P4──      │   ║
║  └─────────────────────────┘     └──────────────────────────────┘   ║
║                                                                      ║
║  DISTRIBUCIÓN DE DESEMPEÑO       ASIGNATURAS CRÍTICAS               ║
║  ┌─────────────────────────┐     ┌──────────────────────────────┐   ║
║  │ ████ Destacado   14.3%  │     │ 1. Matemática          68.4  │   ║
║  │ ████ Logrado     42.9%  │     │ 2. Inglés              70.1  │   ║
║  │ ████ En proceso  21.4%  │     │ 3. Francés             71.3  │   ║
║  │ ████ Insuficiente21.4%  │     │ (promedios más bajos)        │   ║
║  └─────────────────────────┘     └──────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Visuales incluidos:**
1. 6 tarjetas KPI en la parte superior
2. Gráfico de barras horizontales: rendimiento por grado
3. Gráfico de líneas: evolución del promedio por período
4. Gráfico de anillo: distribución por nivel de desempeño
5. Tabla clasificada: asignaturas con menor rendimiento
6. Filtros: Año escolar, Período, Grado, Sección

---

### 7.2 Dashboard del Coordinador — Vista Operativa

```
╔══════════════════════════════════════════════════════════════════════╗
║  SIGERA — Panel de Coordinación   [Período 2 ▼]  [Grado: Todos ▼]  ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ESTADO DE CALIFICACIONES        ESTUDIANTES EN RIESGO              ║
║  ┌──────────────────────────┐    ┌─────────────────────────────┐    ║
║  │ Secciones completas   8  │    │ Total en riesgo:    48       │    ║
║  │ Secciones incompletas 2  │    │ Con nota < 70:      32       │    ║
║  │ Sin calificaciones    0  │    │ En recuperación:    16       │    ║
║  │                          │    │                              │    ║
║  │ [Ver secciones pend.] →  │    │ [Ver lista completa] →       │    ║
║  └──────────────────────────┘    └─────────────────────────────┘    ║
║                                                                      ║
║  RENDIMIENTO POR SECCIÓN                                             ║
║  ┌────────────────────────────────────────────────────────────────┐  ║
║  │ Grado/Sec │  Prom  │ Aprobados │ En recup │ Docentes al día   │  ║
║  │ 1.º A     │  78.4  │   88%     │   12%    │ ✅ 8/8 completos  │  ║
║  │ 1.º B     │  76.1  │   84%     │   16%    │ ⚠️ 6/8 completos  │  ║
║  │ 2.º A     │  74.8  │   79%     │   21%    │ ✅ 8/8 completos  │  ║
║  │ 2.º B     │  73.2  │   76%     │   24%    │ ⚠️ 5/8 completos  │  ║
║  └────────────────────────────────────────────────────────────────┘  ║
║                                                                      ║
║  RENDIMIENTO POR ASIGNATURA (Período 2)                              ║
║  ┌────────────────────────────────────────────────────────────────┐  ║
║  │ Lengua Española  ████████████████░░   80.2  ↑+2.1 vs P1       │  ║
║  │ Ciencias Nat.    ███████████████░░░   78.4  ↑+1.8 vs P1       │  ║
║  │ Inglés           ████████████░░░░░░   73.1  →+0.2 vs P1       │  ║
║  │ Matemática       ██████████░░░░░░░░   68.4  ↓-1.6 vs P1       │  ║
║  └────────────────────────────────────────────────────────────────┘  ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Visuales incluidos:**
1. Tarjetas de estado de completitud de calificaciones
2. Tarjetas de estudiantes en riesgo con drill-down
3. Tabla de rendimiento por sección con indicadores de color
4. Gráfico de barras con comparativo vs. período anterior
5. Lista de secciones con docentes pendientes
6. Filtros: Período, Grado, Sección, Asignatura, Docente

---

### 7.3 Dashboard del Docente — Vista Personal

```
╔══════════════════════════════════════════════════════════════════════╗
║  SIGERA — Mi Panel   Prof. García   [Matemática — 2.º A ▼]         ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐             ║
║  │ Promedio      │ │ Aprobados     │ │ En recuperac. │             ║
║  │ mi sección    │ │               │ │               │             ║
║  │    74.8       │ │   79%  (22)   │ │   21%  (6)    │             ║
║  └───────────────┘ └───────────────┘ └───────────────┘             ║
║                                                                      ║
║  MIS ESTUDIANTES EN RIESGO (nota < 70)                               ║
║  ┌────────────────────────────────────────────────────────────────┐  ║
║  │  N° │ Estudiante          │  P1  │  P2  │ Prom. │ Acción      │  ║
║  │   2 │ Belén Mora, Ana     │  74  │  65  │  69.5 │ ⚠️ Atención │  ║
║  │   7 │ Díaz Torres, Juan   │  60  │  74  │  67.0 │ ⚠️ Atención │  ║
║  │  15 │ Méndez, Carlos      │  68  │  63  │  65.5 │ 🔴 Urgente  │  ║
║  └────────────────────────────────────────────────────────────────┘  ║
║                                                                      ║
║  EVOLUCIÓN DE MI SECCIÓN POR PERÍODO                                 ║
║  P1: 72.4  ──●                                                       ║
║  P2: 74.8  ────────●                                                 ║
║  P3: ----  (en curso)                                                ║
║                                                                      ║
║  DISTRIBUCIÓN DE MIS ESTUDIANTES                                     ║
║  Destacado  ██░░░░░░  14%  (4 est.)                                  ║
║  Logrado    ████████  42%  (12 est.)                                 ║
║  En proceso █████░░░  29%  (8 est.)                                  ║
║  Insuficien ████░░░░  14%  (4 est.)                                  ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

### 7.4 Vista de Competencias Críticas

Esta vista es exclusiva para el Coordinador y el Director en Power BI. Muestra qué competencias específicas concentran el mayor número de estudiantes con notas insuficientes.

```
╔══════════════════════════════════════════════════════════════════════╗
║  SIGERA — Análisis de Competencias   [Asignatura: Matemática ▼]    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  RENDIMIENTO POR COMPETENCIA ESPECÍFICA                              ║
║                                                                      ║
║  PC1: Números y operaciones     ████████████████░░░░  79.2          ║
║  PC2: Álgebra                   ████████████░░░░░░░░  72.1          ║
║  PC3: Funciones                 ████████████░░░░░░░░  71.8  ←Atención
║  PC4: Geometría                 ██████████░░░░░░░░░░  68.4  ←Crítico
║  PC1: Estadística               ████████████████░░░░  78.1          ║
║  PC2: Probabilidad              ██████████████░░░░░░  75.3          ║
║  PC3: Medidas                   ██████████░░░░░░░░░░  67.9  ←Crítico
║                                                                      ║
║  CONCLUSIÓN AUTOMÁTICA:                                              ║
║  Las competencias PC4 (Geometría) y PC3 (Medidas) tienen el         ║
║  promedio más bajo del año. Se recomienda refuerzo pedagógico        ║
║  en estas competencias para el Período 3.                            ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 8. Estrategia de Conexión Power BI ↔ SIGERA

### 8.1 Opciones de conexión

SIGERA ofrece **tres formas** de conectar Power BI a los datos:

| Opción | Descripción | Ventajas | Desventajas |
|---|---|---|---|
| **A. Exportación CSV manual** | El admin descarga los CSVs y los sube a Power BI | Simple, sin configuración | Manual, no actualiza automáticamente |
| **B. Exportación programada** | Un script descarga los CSVs automáticamente cada noche | Automático, sin acceso directo a la BD | Datos con hasta 24h de retraso |
| **C. Conexión directa al API REST** | Power BI conecta al endpoint `/reportes/exportar/power-bi` | Datos frescos bajo demanda | Requiere configuración de Power BI Gateway |

**Recomendación para Etapa 1:** Opción A o B. La Opción C se implementa en la Etapa 3 cuando el centro tenga más usuarios simultáneos.

---

### 8.2 Opción B — Script de exportación programada

```python
# scripts/exportar_power_bi.py
# Se ejecuta diariamente a las 2:00 AM (via cron job o Windows Task Scheduler)

import requests
import os
import zipfile
from datetime import datetime

API_URL = os.getenv("SIGERA_API_URL")
API_TOKEN = os.getenv("SIGERA_EXPORT_TOKEN")
POWER_BI_DIR = os.getenv("POWER_BI_DATA_DIR", "/data/power-bi")

def exportar_dataset():
    print(f"[{datetime.now()}] Iniciando exportación para Power BI...")

    headers = {"Authorization": f"Bearer {API_TOKEN}"}
    response = requests.get(
        f"{API_URL}/api/v1/reportes/exportar/power-bi",
        headers=headers,
        stream=True
    )

    if response.status_code == 200:
        zip_path = f"{POWER_BI_DIR}/sigera_dataset_{datetime.now().strftime('%Y%m%d')}.zip"

        with open(zip_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        # Extraer los CSVs
        with zipfile.ZipFile(zip_path, 'r') as z:
            z.extractall(POWER_BI_DIR)

        print(f"[{datetime.now()}] ✅ Dataset exportado exitosamente.")
    else:
        print(f"[{datetime.now()}] ❌ Error en exportación: {response.status_code}")

if __name__ == "__main__":
    exportar_dataset()
```

---

### 8.3 Configuración de Power BI Desktop

**Pasos para conectar Power BI a los CSVs de SIGERA:**

```
Paso 1: Abrir Power BI Desktop

Paso 2: Inicio → Obtener datos → Carpeta
  → Seleccionar la carpeta donde se guardan los CSVs de SIGERA
  → Power BI detecta automáticamente todos los archivos CSV

Paso 3: Transformar datos (Power Query)
  Para cada archivo:
  • dim_estudiantes.csv   → Cargar como "DimEstudiantes"
  • fact_calificaciones.csv → Cargar como "FactCalificaciones"
  • fact_calificaciones_por_periodo.csv → "FactCalificacionesPeriodo"
  • dim_asignaturas.csv   → "DimAsignaturas"
  • dim_docentes.csv      → "DimDocentes"
  • dim_secciones.csv     → "DimSecciones"
  • resumen_anual.csv     → "ResumenAnual"

Paso 4: Modelado → Crear relaciones
  • FactCalificaciones[estudiante_id] → DimEstudiantes[estudiante_id]
  • FactCalificaciones[asignatura_codigo] → DimAsignaturas[codigo]
  • [continuar con todas las relaciones del modelo estrella]

Paso 5: Crear medidas DAX
  → Agregar las fórmulas DAX del Capítulo 6, Sección 6

Paso 6: Crear visualizaciones
  → Construir los dashboards según el diseño de la Sección 7

Paso 7: Publicar
  → Publicar en Power BI Service (si se tiene licencia)
  → O compartir el archivo .pbix con el director
```

---

### 8.4 Endpoint de exportación en el backend

```python
# app/routers/reportes.py

@router.get("/exportar/power-bi")
async def exportar_power_bi(
    anio_escolar_id: int,
    db: AsyncSession = Depends(get_db),
    _: Usuario = require_roles("ADMINISTRADOR", "DIRECTOR")
):
    """
    Genera un archivo ZIP con los 7 CSVs del dataset de Power BI.
    """
    import io
    import zipfile
    from fastapi.responses import StreamingResponse

    # Obtener todos los datos del año escolar
    datos = await ReporteService.generar_dataset_power_bi(
        db=db,
        anio_escolar_id=anio_escolar_id
    )

    # Crear el ZIP en memoria
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for nombre_archivo, contenido_csv in datos.items():
            zf.writestr(f"{nombre_archivo}.csv", contenido_csv)

    buffer.seek(0)

    fecha = datetime.now().strftime("%Y%m%d")
    filename = f"sigera_dataset_{fecha}.zip"

    return StreamingResponse(
        buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
```

---

## 9. Especificaciones Técnicas de los Reportes

### 9.1 Vistas materializadas en PostgreSQL

Para optimizar los reportes más consultados, SIGERA crea vistas materializadas que se actualizan al cerrar cada período:

```sql
-- Vista materializada: rendimiento por sección y asignatura
CREATE MATERIALIZED VIEW mv_rendimiento_seccion AS
SELECT
  ae.descripcion           AS anio_escolar,
  g.numero                 AS grado_numero,
  g.nombre                 AS grado_nombre,
  s.nombre                 AS seccion_nombre,
  s.tanda,
  a.codigo                 AS asignatura_codigo,
  a.nombre                 AS asignatura_nombre,
  d.primer_nombre || ' ' || d.primer_apellido AS docente,
  COUNT(cp.id)             AS total_estudiantes,
  ROUND(AVG(cp.nota_efectiva_p1), 1) AS prom_p1,
  ROUND(AVG(cp.nota_efectiva_p2), 1) AS prom_p2,
  ROUND(AVG(cp.nota_efectiva_p3), 1) AS prom_p3,
  ROUND(AVG(cp.nota_efectiva_p4), 1) AS prom_p4,
  ROUND(AVG(cp.calificacion_final), 1) AS prom_final,
  COUNT(*) FILTER (WHERE cp.situacion_final = 'APROBADO') AS aprobados,
  COUNT(*) FILTER (WHERE cp.situacion_final = 'REPROBADO') AS reprobados,
  COUNT(*) FILTER (WHERE cp.situacion_final = 'EN_COMPLETIVA') AS en_completiva,
  COUNT(*) FILTER (WHERE cp.nivel_desempeno = 'DESTACADO') AS destacados,
  COUNT(*) FILTER (WHERE cp.nivel_desempeno = 'LOGRADO') AS logrados,
  COUNT(*) FILTER (WHERE cp.nivel_desempeno = 'EN_PROCESO') AS en_proceso,
  COUNT(*) FILTER (WHERE cp.nivel_desempeno = 'INSUFICIENTE') AS insuficientes
FROM calificacion_periodo cp
JOIN estudiante_seccion es ON cp.estudiante_seccion_id = es.id
JOIN seccion s ON es.seccion_id = s.id
JOIN grado g ON s.grado_id = g.id
JOIN anio_escolar ae ON g.anio_escolar_id = ae.id
JOIN asignatura a ON cp.asignatura_id = a.id
LEFT JOIN asignacion_docente ad ON cp.asignacion_docente_id = ad.id
LEFT JOIN docente d ON ad.docente_id = d.id
WHERE es.estado = 'ACTIVO'
GROUP BY
  ae.descripcion, g.numero, g.nombre,
  s.nombre, s.tanda,
  a.codigo, a.nombre, docente
ORDER BY g.numero, s.nombre, a.orden;

-- Índice sobre la vista materializada
CREATE UNIQUE INDEX ON mv_rendimiento_seccion
  (anio_escolar, grado_numero, seccion_nombre, asignatura_codigo);

-- Función para refrescar la vista al cerrar un período
CREATE OR REPLACE FUNCTION fn_refrescar_reportes()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_rendimiento_seccion;
END;
$$ LANGUAGE plpgsql;
```

### 9.2 Tiempos de respuesta esperados por reporte

| Reporte | Registros típicos | Tiempo esperado | Fuente |
|---|---|---|---|
| Dashboard del docente | 1 sección (~30 est.) | < 0.5 seg | Tabla en vivo |
| Dashboard del coordinador | Todo el centro | < 1 seg | Vista materializada |
| Dashboard del director | Todo el centro | < 1 seg | Vista materializada |
| R-07 Rendimiento general | Todo el centro | < 1.5 seg | Vista materializada |
| R-12 Riesgo académico | 50-100 estudiantes | < 1 seg | Tabla en vivo con índice |
| R-02 Registro de grado (PDF) | 1 sección | < 3 seg | Tabla en vivo + WeasyPrint |
| Exportación Power BI (ZIP) | Todo el centro | < 15 seg | Query batch |

### 9.3 Permisos de acceso a reportes

| Reporte | Docente | Coordinador | Director | Admin |
|---|---|---|---|---|
| R-01 a R-03 (operativos propios) | ✅ Sus secc. | ✅ Todo | ✅ Todo | ✅ Todo |
| R-04 a R-06 (completiva, actas) | ❌ | ✅ | ✅ | ✅ |
| R-07 a R-12 (rendimiento) | ✅ Sus secc. | ✅ Todo | ✅ Todo | ✅ Todo |
| R-10 Por docente | ❌ | ✅ | ✅ | ✅ |
| R-13 Estadísticas finales | ❌ | ✅ | ✅ | ✅ |
| R-17 a R-20 Power BI dataset | ❌ | ❌ | ✅ | ✅ |

---

## Resumen del Capítulo 6

| Elemento | Detalle |
|---|---|
| Reportes integrados | 20 reportes en 4 categorías |
| Formatos de salida | Pantalla, PDF, Excel, CSV/ZIP |
| Archivos del dataset Power BI | 7 CSVs con modelo estrella |
| Tablas de hechos | 2: calificaciones anuales + por período |
| Tablas de dimensión | 5: estudiantes, asignaturas, docentes, secciones, períodos |
| Fórmulas DAX | 10 KPIs con código completo |
| Dashboards diseñados | 3 + 1 vista especial (Director, Coordinador, Docente, Competencias) |
| Opciones de conexión Power BI | 3 (manual, programada, API directa) |
| Vistas materializadas | 1 (mv_rendimiento_seccion) |

---

## Historial de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| 1.0 | Agosto 2026 | Equipo SIGERA | Primera versión del Capítulo 6 |

---

*Este documento forma parte del Documento de Arquitectura Funcional (DAF) de SIGERA.*

**Capítulo anterior:** [Capítulo 5 — Arquitectura de Software](./SIGERA_DAF_Cap5_Arquitectura_Software.md)  
**Siguiente capítulo:** [Capítulo 7 — Inteligencia Artificial](./SIGERA_DAF_Cap7_Inteligencia_Artificial.md)

---
*© 2026 SIGERA — Todos los derechos reservados*
