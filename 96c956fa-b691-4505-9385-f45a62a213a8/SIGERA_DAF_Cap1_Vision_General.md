# SIGERA
## Sistema Inteligente de Gestión Educativa y Rendimiento Académico
### Documento de Arquitectura Funcional (DAF)
#### Capítulo 1 — Visión General del Proyecto

---

**Versión:** 1.0  
**Fecha:** Agosto 2026  
**Estado:** Borrador para revisión  
**Clasificación:** Confidencial — Uso interno del proyecto  

---

## Tabla de Contenidos

1. [Presentación del Proyecto](#1-presentación-del-proyecto)
2. [Problemática Identificada](#2-problemática-identificada)
3. [Visión del Sistema](#3-visión-del-sistema)
4. [Objetivos del Proyecto](#4-objetivos-del-proyecto)
5. [Alcance del Sistema](#5-alcance-del-sistema)
6. [Beneficios Esperados](#6-beneficios-esperados)
7. [Marco Normativo](#7-marco-normativo)
8. [Estructura Académica del Sistema Educativo Dominicano](#8-estructura-académica-del-sistema-educativo-dominicano)
9. [Actores del Sistema](#9-actores-del-sistema)
10. [Módulos del Sistema](#10-módulos-del-sistema)
11. [Fases de Desarrollo](#11-fases-de-desarrollo)
12. [Identidad del Producto](#12-identidad-del-producto)
13. [Glosario de Términos](#13-glosario-de-términos)
14. [Referencias Normativas](#14-referencias-normativas)

---

## 1. Presentación del Proyecto

### 1.1 Introducción

El sistema educativo de la República Dominicana gestiona actualmente los registros académicos de millones de estudiantes a través de documentos físicos: registros de grado, boletines de calificaciones y actas de promoción, cuya elaboración recae íntegramente sobre los docentes de forma manual.

Este proceso manual presenta múltiples riesgos: errores de cálculo, pérdida de información, demoras en la generación de reportes institucionales y dificultades para detectar a tiempo a estudiantes en riesgo académico.

**SIGERA** surge como respuesta directa a esta problemática: una plataforma digital diseñada para digitalizar, automatizar y optimizar la gestión académica de los centros educativos del nivel secundario de la República Dominicana, en estricto cumplimiento con las normativas del Ministerio de Educación de la República Dominicana (MINERD).

### 1.2 Nombre del Sistema

| Campo | Valor |
|---|---|
| **Nombre completo** | Sistema Inteligente de Gestión Educativa y Rendimiento Académico |
| **Sigla** | SIGERA |
| **Versión inicial** | 1.0 |
| **Tipo de sistema** | Plataforma web multi-rol |
| **Idioma de interfaz** | Español |
| **País de aplicación** | República Dominicana |
| **Nivel educativo cubierto** | Secundario (1.º a 6.º grado) |

### 1.3 Contexto del proyecto

El MINERD establece mediante ordenanzas y disposiciones reglamentarias los procedimientos que deben seguir los centros educativos para evaluar, registrar y certificar el rendimiento académico de los estudiantes. Estos procedimientos se materializan en documentos oficiales físicos:

- **Registro de Grado:** documento maestro donde el docente registra todos los datos del estudiante, asistencia, calificaciones por período, competencias, recuperación pedagógica, evaluación completiva, extraordinaria y promoción final.
- **Boletín de Calificaciones:** resumen entregado al estudiante y/o su representante legal al finalizar cada período y al cierre del año escolar.
- **Acta de Rendimiento:** documento que certifica los resultados finales del grado.

SIGERA reproducirá digitalmente estos documentos, automatizará los cálculos académicos y generará reportes institucionales para la toma de decisiones pedagógicas y administrativas.

---

## 2. Problemática Identificada

### 2.1 Situación actual

En la mayoría de los centros educativos del nivel secundario de la República Dominicana, el proceso de gestión académica presenta las siguientes características:

| Área | Situación actual | Riesgo asociado |
|---|---|---|
| Registro de calificaciones | Manual (físico o en hojas de cálculo no estandarizadas) | Errores de cálculo, pérdida de datos |
| Generación de boletines | Manual, copiando datos del registro al boletín | Errores de transcripción, retraso en entrega |
| Asistencia | Registro en cuaderno físico | Sin cálculo automático, sin alertas |
| Recuperación pedagógica | Sin seguimiento sistematizado | Estudiantes pasan a recuperación sin registro formal |
| Reportes institucionales | Se elaboran manualmente al final de cada período | Demora, datos inconsistentes |
| Detección de riesgo académico | A criterio del docente, sin sistema de alertas | Estudiantes en riesgo pasan desapercibidos |
| Toma de decisiones de dirección | Basada en reportes manuales tardíos | Sin datos en tiempo real |

### 2.2 Problemas específicos identificados en el Registro de Grado

A partir del análisis del Registro Oficial del MINERD y del archivo de registros en uso, se identificaron los siguientes problemas concretos:

1. **El cálculo del promedio por competencia y calificación final se realiza manualmente**, lo que genera errores frecuentes.
2. **La recuperación pedagógica no se gestiona sistemáticamente**: en muchos casos no queda registrada formalmente o no se aplica la regla correcta para modificar la nota del período.
3. **No existe un sistema de alertas de asistencia**: el cálculo del porcentaje de asistencia se realiza manualmente o no se realiza, impidiendo detectar a tiempo a los estudiantes con riesgo de reprobación por inasistencia.
4. **Los boletines se generan de forma completamente manual**, copiando datos del Registro de Grado, lo que introduce errores y consume horas de trabajo docente.
5. **No existe un repositorio centralizado de datos académicos**, lo que impide generar reportes institucionales precisos, comparar períodos o identificar tendencias.

### 2.3 Oportunidad de mejora

SIGERA tiene la oportunidad de:

- Eliminar el error humano en los cálculos académicos.
- Reducir en más de un 80% el tiempo que el docente dedica a elaborar el boletín y el registro.
- Dar a la dirección del centro acceso a información académica en tiempo real.
- Detectar automáticamente a los estudiantes en riesgo académico o de abandono escolar.
- Generar los documentos oficiales del MINERD directamente desde el sistema, listos para imprimir o entregar digitalmente.

---

## 3. Visión del Sistema

### 3.1 Visión a corto plazo (Etapa 1 — Año 1)

> SIGERA será la herramienta digital que permita a los docentes del nivel secundario registrar las calificaciones de sus estudiantes exactamente como lo hacen hoy en el Registro de Grado, pero con cálculos automáticos, boletines generados en segundos y reportes institucionales disponibles en todo momento.

### 3.2 Visión a mediano plazo (Etapa 2-4 — Años 1-2)

> SIGERA será la plataforma de gestión académica de referencia para los centros educativos secundarios de la República Dominicana, cubriendo el ciclo completo desde la matrícula hasta la certificación, con asistencia, recuperación pedagógica y analítica institucional.

### 3.3 Visión a largo plazo (Etapa 5-6 — Años 2-3)

> SIGERA será un sistema de inteligencia educativa capaz de predecir el riesgo de reprobación y abandono escolar, recomendar estrategias pedagógicas y producir análisis de tendencias históricas para apoyar la toma de decisiones a nivel institucional, distrital y regional.

### 3.4 Declaración de visión

> "Transformar la gestión académica de los centros educativos dominicanos a través de la digitalización inteligente del Registro de Grado, la automatización de los procesos de evaluación y la generación de información estratégica para mejorar el rendimiento estudiantil."

---

## 4. Objetivos del Proyecto

### 4.1 Objetivo general

Desarrollar una plataforma web de gestión académica que digitalice íntegramente el Registro de Grado del MINERD, automatice los cálculos de calificaciones según la Ordenanza 04-2023 y genere automáticamente los boletines de calificaciones y reportes institucionales.

### 4.2 Objetivos específicos

**Etapa 1 — Registro y Calificaciones:**
- OE-01: Digitalizar el Registro de Grado oficial del MINERD para el nivel secundario.
- OE-02: Automatizar el cálculo de calificaciones por competencia, período, calificación final, completiva y extraordinaria.
- OE-03: Generar automáticamente boletines de calificaciones individuales y grupales.
- OE-04: Producir exportaciones de datos limpios para análisis en Power BI.

**Etapa 2 — Asistencia y Permanencia:**
- OE-05: Implementar el módulo de asistencia diaria con conversión automática de tardanzas y alertas de inasistencia.
- OE-06: Calcular automáticamente el porcentaje de asistencia por estudiante y generar alertas cuando esté por debajo del umbral establecido.

**Etapa 3 — Analítica Institucional:**
- OE-07: Implementar dashboards interactivos para la dirección, coordinación y docentes.
- OE-08: Generar reportes automáticos de aprobados, recuperación, reprobados y estadísticas por asignatura, grado y sección.

**Etapa 4 — Recuperación Pedagógica:**
- OE-09: Automatizar el flujo de recuperación pedagógica, completiva y extraordinaria según las reglas de la Ordenanza 04-2023.

**Etapa 5-6 — Inteligencia Artificial:**
- OE-10: Implementar modelos predictivos de riesgo de reprobación y abandono escolar.
- OE-11: Generar recomendaciones pedagógicas basadas en el historial académico del estudiante.

---

## 5. Alcance del Sistema

### 5.1 Lo que SÍ incluye SIGERA (Etapa 1)

| # | Funcionalidad | Descripción |
|---|---|---|
| 1 | Configuración institucional | Centro, regional, distrito, año escolar, tanda, modalidad |
| 2 | Gestión de estudiantes | Registro completo de datos personales, familiares y académicos |
| 3 | Gestión de docentes | Registro, asignación de asignaturas y secciones |
| 4 | Gestión de asignaturas | Configuración de asignaturas y competencias específicas |
| 5 | Registro de calificaciones | Por estudiante, asignatura, competencia y período |
| 6 | Cálculo automático | Promedio de competencias, calificación final, completiva, extraordinaria |
| 7 | Recuperación pedagógica | Registro y cálculo de recuperación por período |
| 8 | Generación de boletines | Individual y grupal, formato MINERD, exportable a PDF |
| 9 | Exportación de datos | Excel y CSV para Power BI |
| 10 | Roles y permisos | Administrador, docente, coordinador, director |
| 11 | Seguridad básica | Autenticación con usuario/contraseña, sesiones seguras |

### 5.2 Lo que NO incluye SIGERA en la Etapa 1

| # | Funcionalidad | Etapa prevista |
|---|---|---|
| 1 | Módulo de asistencia completo | Etapa 2 |
| 2 | Dashboards Power BI embebidos | Etapa 2 |
| 3 | Portal para padres y representantes | Etapa 3 |
| 4 | Aplicación móvil | Etapa 3 |
| 5 | Inteligencia artificial | Etapa 5-6 |
| 6 | Integración con SIGERD (sistema nacional) | A evaluar |
| 7 | Módulo de nómina docente | Fuera del alcance |
| 8 | Gestión financiera del centro | Fuera del alcance |

### 5.3 Nivel educativo cubierto

SIGERA en su Etapa 1 cubre únicamente el **nivel secundario** (1.º a 6.º grado) en la modalidad **Académica regular** (antigua denominación: Ciencias y Humanidades), regulada por la **Ordenanza 04-2023**, con posibilidad de extenderse a otras modalidades en versiones futuras.

---

## 6. Beneficios Esperados

### 6.1 Para el docente

| Beneficio | Impacto estimado |
|---|---|
| Eliminación de cálculos manuales | Reducción del 90% del tiempo de cálculo |
| Generación automática del boletín | De 2-4 horas a menos de 2 minutos por sección |
| Vista digital del Registro de Grado | Misma lógica que conoce, sin aprendizaje adicional |
| Historial de cambios en calificaciones | Trazabilidad completa de cada modificación |
| Alertas de estudiantes en riesgo | Identificación inmediata sin búsqueda manual |

### 6.2 Para la dirección y coordinación

| Beneficio | Impacto estimado |
|---|---|
| Reportes institucionales automáticos | Disponibles en tiempo real, sin esperar cierre |
| Comparación entre períodos | Sin necesidad de consolidar hojas de cálculo |
| Identificación de asignaturas críticas | Visible desde el panel principal |
| Estadísticas por docente y sección | Para evaluación de desempeño pedagógico |

### 6.3 Para el estudiante y sus representantes

| Beneficio | Impacto estimado |
|---|---|
| Boletín disponible más rápido | Sin demoras por elaboración manual |
| Mayor precisión en las calificaciones | Eliminación de errores de cálculo |
| Seguimiento del progreso académico | Historial completo por período |

### 6.4 Para el centro educativo

| Beneficio | Impacto estimado |
|---|---|
| Cumplimiento normativo garantizado | Los cálculos siguen las reglas exactas de la Ordenanza |
| Reducción de papel y costos operativos | Digitalización progresiva del proceso |
| Repositorio histórico de datos | Base de datos académica accesible a futuro |
| Preparación para auditorías del MINERD | Reportes y registros disponibles de forma inmediata |

---

## 7. Marco Normativo

SIGERA se diseña en estricto cumplimiento del siguiente marco legal y normativo:

### 7.1 Leyes nacionales

| Documento | Descripción |
|---|---|
| **Ley 66-97** | Ley General de Educación de la República Dominicana. Establece los principios del sistema educativo nacional, los derechos y deberes de los actores educativos y las bases de la evaluación. |

### 7.2 Ordenanzas del MINERD

| Documento | Descripción |
|---|---|
| **Ordenanza 04-2023** | **Base principal del motor de cálculo de SIGERA.** Sistema de Evaluación de los Aprendizajes para el Nivel Inicial, Primario y Secundario (modalidad académica regular). Define la escala de calificaciones (0–100, mínimo aprobatorio: 70), los cuatro períodos de evaluación, las reglas de recuperación pedagógica, completiva (50% CF + 50% CEC), extraordinaria (30% CF + 70% CEX), evaluación especial, y los criterios exactos de promoción. |
| **Ordenanza 03-2024** | Currículo del Nivel Secundario para Adultos. Se consulta como referencia para la estructura de asignaturas y competencias, pero **no es la base normativa del sistema** (que aplica a la modalidad regular). |
| **Ordenanza 04-2024** | Sistema de Evaluación del Nivel Secundario para Adultos. **Solo de referencia.** Las reglas de evaluación de SIGERA se rigen por la Ordenanza 04-2023. |

### 7.3 Documentos oficiales MINERD

| Documento | Descripción |
|---|---|
| **Registro de Grado (6.º grado)** | Documento maestro oficial. Contiene todos los campos y estructuras que SIGERA debe reproducir digitalmente. |
| **Boletín de Calificaciones (1.º y 6.º grado)** | Documento de reporte al estudiante. SIGERA lo generará automáticamente desde los datos del Registro. |
| **Calendario Escolar 2025-2026** | Define las fechas de los períodos, vacaciones y actividades del año escolar. |

### 7.4 Implicaciones normativas para el diseño del sistema

| Regla normativa | Implicación en SIGERA |
|---|---|
| La calificación mínima aprobatoria es **70 puntos** (Art. 47 y 50) | El motor de cálculo marca como no aprobado cualquier resultado inferior a 70 |
| La escala va de **0 a 100** | Se registran valores entre 0 y 100; el umbral operativo de aprobación es 70 |
| La completiva pondera **50% CF + 50% CEC** (Art. 51) | Fórmula exacta implementada en el motor de cálculo |
| La extraordinaria pondera **30% CF + 70% CEX** (Art. 52) | Fórmula exacta implementada en el motor de cálculo |
| **1 ó 2 asignaturas aplazadas** post-extraordinaria habilitan Evaluación Especial (Art. 53) | SIGERA gestiona este cuarto estado antes del nuevo año |
| **3 o más asignaturas** reprobadas post-extraordinaria = **Repite el grado** (Art. 52) | El sistema calcula y registra automáticamente la situación final |
| **Mínimo 70% de asistencia** requerido para la promoción (Art. 14, Párrafo VI) | El módulo de asistencia genera alertas al equipo multidisciplinario si baja del 70% |
| La recuperación pedagógica **no borra la nota original** | El sistema conserva ambas: nota del período y nota de recuperación |

---

## 8. Estructura Académica del Sistema Educativo Dominicano

### 8.1 Estructura de niveles y grados

```
Sistema Educativo Dominicano
│
├── Nivel Inicial
│   └── Pre-Primario
│
├── Nivel Primario
│   ├── 1.º a 4.º grado (Primer Ciclo)
│   └── 5.º a 8.º grado (Segundo Ciclo)
│
└── Nivel Secundario ← ALCANCE DE SIGERA (Etapa 1)
    ├── 1.º a 3.º grado (Primer Ciclo)
    └── 4.º a 6.º grado (Segundo Ciclo)
```

### 8.2 Modalidades del nivel secundario cubiertas

| Modalidad | Incluida en Etapa 1 | Observaciones |
|---|---|---|
| **Académica (regular)** | ✅ Sí | **Modalidad principal. Base normativa: Ordenanza 04-2023** |
| Académica (adultos) | ❌ No (referencia) | Las Ordenanzas 03-2024 y 04-2024 aplican solo a adultos |
| Técnico-Profesional | ⏳ Futuras etapas | Requiere configuración adicional |
| Arte | ⏳ Futuras etapas | Requiere configuración adicional |

### 8.3 Estructura de períodos

El año escolar se organiza en **cuatro períodos académicos**:

| Período | Código | Descripción |
|---|---|---|
| Primer Período | P1 | Comprende los meses iniciales del año escolar |
| Segundo Período | P2 | Segundo bloque académico |
| Tercer Período | P3 | Tercer bloque académico |
| Cuarto Período | P4 | Bloque final del año |

Cada período produce:
- Calificaciones de competencias específicas
- Calificación del período
- Recuperación pedagógica (si aplica)

Al finalizar el año se producen:
- Promedio de competencias (PC1, PC2, PC3, PC4)
- Calificación final (CF)
- Completiva (si CF < 70 en alguna asignatura)
- Extraordinaria (si no aprueba la completiva)
- Evaluación Especial (si quedan 1 ó 2 asignaturas aplazadas post-extraordinaria)
- Situación final: **Aprobado / En completiva / En extraordinaria / Evaluación Especial / Reprobado**

### 8.4 Escala de calificaciones (Ordenanza 04-2023, Art. 47)

| Rango | Nivel de desempeño | Descripción |
|---|---|---|
| 89 – 100 | **Destacado** | El estudiante ha alcanzado un desempeño destacado con relación a los aspectos evaluados |
| 77 – 88 | **Logrado** | El estudiante ha logrado, en general, los aprendizajes esperados |
| 65 – 76 | **En proceso** | El estudiante aún se encuentra en proceso, mostrando un logro muy básico |
| 0 – 64 | **Insuficiente** | El estudiante ha alcanzado un desempeño insuficiente |

> **Nota importante:** La calificación mínima para aprobar un área es **70 puntos** (Art. 50). Los estudiantes que no alcancen esta calificación deben acceder al proceso de recuperación pedagógica, completiva, extraordinaria o evaluación especial según corresponda. El nivel “En proceso” (65–76) **no garantiza la aprobación** del área.

### 8.5 Asignaturas del nivel secundario

Las asignaturas que SIGERA debe gestionar en la Etapa 1 son:

**Primer Ciclo (1.º, 2.º, 3.º grado) — 9 asignaturas:**

| # | Asignatura | Código |
|---|---|---|
| 1 | Lengua Española | LES |
| 2 | Lengua Extranjera: Inglés | ING |
| 3 | Lengua Extranjera: Francés | FRA |
| 4 | Matemática | MAT |
| 5 | Ciencias Sociales | CSO |
| 6 | Ciencias de la Naturaleza | CNT |
| 7 | Educación Física | EFI |
| 8 | Educación Artística | EAR |
| 9 | Formación Integral Humana y Religiosa | FIHR |

**Segundo Ciclo (4.º, 5.º, 6.º grado) — 10 asignaturas:**

Las mismas 9 del Primer Ciclo más:

| # | Asignatura | Código | Nota |
|---|---|---|---|
| 10 | Salida Optativa | OPT | Varía por centro: Humanidades y Lenguas Modernas, Matemática y Tecnología, Ciencias y Tecnología, o Humanidades y Ciencias Sociales |

> **Importante:** La Salida Optativa **solo aplica al Segundo Ciclo** (4.º, 5.º y 6.º grado). No existe en el Primer Ciclo (1.º, 2.º y 3.º grado).

---

## 9. Actores del Sistema

SIGERA define cuatro roles principales con acceso diferenciado al sistema:

### 9.1 Administrador del sistema

**Perfil:** Personal técnico o administrativo designado por el centro educativo.

**Responsabilidades:**
- Configurar el año escolar, grados, secciones y tanda.
- Registrar y gestionar los datos de docentes y estudiantes.
- Asignar docentes a grados, secciones y asignaturas.
- Gestionar usuarios y permisos del sistema.
- Realizar exportaciones y copias de seguridad.

**Acceso:** Total a todos los módulos y funciones del sistema.

### 9.2 Docente

**Perfil:** Profesional educativo asignado a una o más asignaturas y secciones.

**Responsabilidades:**
- Registrar las calificaciones de sus estudiantes por período y competencia.
- Registrar la recuperación pedagógica cuando corresponda.
- Consultar el avance académico de sus estudiantes.
- Generar boletines de su sección.

**Acceso:** Limitado a sus grados, secciones y asignaturas asignadas.

### 9.3 Coordinador académico

**Perfil:** Personal de supervisión pedagógica del centro educativo.

**Responsabilidades:**
- Revisar y validar los registros de calificaciones.
- Monitorear el rendimiento por grado, sección y asignatura.
- Identificar estudiantes en riesgo académico.
- Generar reportes de rendimiento institucional.

**Acceso:** Lectura total, con capacidad de validación. No puede editar calificaciones directamente.

### 9.4 Director

**Perfil:** Máxima autoridad académica y administrativa del centro educativo.

**Responsabilidades:**
- Consultar estadísticas generales del centro.
- Analizar tendencias de rendimiento.
- Tomar decisiones basadas en los reportes del sistema.
- Firmar digitalmente los documentos oficiales (boletines, actas).

**Acceso:** Solo lectura sobre todos los módulos. Acceso completo a reportes y estadísticas.

### 9.5 Matriz de acceso por rol

| Módulo | Administrador | Docente | Coordinador | Director |
|---|---|---|---|---|
| Configuración institucional | ✅ Total | ❌ | 👁️ Solo lectura | 👁️ Solo lectura |
| Gestión de estudiantes | ✅ Total | 👁️ Sus secciones | ✅ Total | 👁️ Solo lectura |
| Gestión de docentes | ✅ Total | 👁️ Su perfil | 👁️ Solo lectura | 👁️ Solo lectura |
| Registro de calificaciones | ✅ Total | ✅ Sus asignaturas | ✅ Validación | 👁️ Solo lectura |
| Boletines | ✅ Total | ✅ Sus secciones | ✅ Total | ✅ Total |
| Reportes | ✅ Total | ✅ Sus secciones | ✅ Total | ✅ Total |
| Gestión de usuarios | ✅ Total | ❌ | ❌ | ❌ |
| Exportación de datos | ✅ Total | ⚠️ Limitado | ✅ Total | ✅ Total |

---

## 10. Módulos del Sistema

SIGERA se organiza en módulos funcionales, desarrollados en etapas según la prioridad del proyecto:

### Etapa 1 — Núcleo del sistema (Alta prioridad)

| Módulo | Nombre | Descripción breve |
|---|---|---|
| M01 | Configuración Institucional | Datos del centro, año escolar, grados y secciones |
| M02 | Gestión de Estudiantes | Registro completo de datos personales y académicos |
| M03 | Gestión de Docentes | Registro y asignación de docentes |
| M04 | Gestión de Asignaturas | Asignaturas y competencias específicas |
| M05 | Registro de Calificaciones | Ingreso de calificaciones por período y competencia |
| M06 | Motor de Cálculo Académico | Automatización de todos los cálculos de la Ordenanza |
| M07 | Recuperación Pedagógica | Registro y cálculo de notas de recuperación |
| M08 | Generación de Boletines | Boletines PDF idénticos al formato MINERD |
| M09 | Exportación de Datos | Excel, CSV y datasets para Power BI |
| M10 | Gestión de Usuarios y Roles | Autenticación, roles y permisos |

### Etapa 2 — Asistencia y analítica

| Módulo | Nombre | Descripción breve |
|---|---|---|
| M11 | Asistencia Diaria | Registro P/A/T/E/R con conversión automática |
| M12 | Dashboards Institucionales | Power BI embebido o integrado |
| M13 | Alertas Académicas | Notificaciones automáticas de riesgo |

### Etapa 3 — Experiencia extendida

| Módulo | Nombre | Descripción breve |
|---|---|---|
| M14 | Portal para Representantes | Consulta de calificaciones y boletines |
| M15 | Aplicación Móvil | Versión móvil para docentes |

### Etapas 4-6 — Inteligencia y predicción

| Módulo | Nombre | Descripción breve |
|---|---|---|
| M16 | Motor de IA — Riesgo Académico | Predicción de reprobación y abandono |
| M17 | Recomendaciones Pedagógicas | Sugerencias basadas en historial |
| M18 | Análisis de Tendencias | Comparativos históricos multi-período |

---

## 11. Fases de Desarrollo

### Fase 1 — Etapa 1: Registro y Calificaciones (Prioridad máxima)

**Objetivo:** Digitalizar el Registro de Grado y automatizar los cálculos de calificaciones.

**Entregables:**
- Base de datos inicial (PostgreSQL).
- Backend REST API (FastAPI / Python).
- Frontend web (React).
- Módulos M01 al M10.
- Registro de grado digital imprimible.
- Boletines automáticos en PDF.
- Exportación de datos para Power BI.

**Duración estimada:** 3-4 meses

---

### Fase 2 — Etapa 2: Asistencia y Analítica

**Objetivo:** Incorporar asistencia, dashboards y alertas.

**Entregables:**
- Módulo de asistencia diaria (M11).
- Dashboards institucionales (M12).
- Sistema de alertas automáticas (M13).

**Duración estimada:** 2 meses

---

### Fase 3 — Etapa 3: Experiencia extendida

**Objetivo:** Portal para representantes y app móvil.

**Entregables:**
- Portal de representantes (M14).
- Aplicación móvil para docentes (M15).

**Duración estimada:** 2-3 meses

---

### Fase 4 — Etapas 5-6: Inteligencia Artificial

**Objetivo:** Predicción de riesgo y recomendaciones pedagógicas.

**Requisito previo:** Mínimo 1 año de datos históricos en el sistema.

**Entregables:**
- Motor de IA (M16, M17, M18).

**Duración estimada:** 3-4 meses

---

## 12. Identidad del Producto

### 12.1 Nombre

**SIGERA** — Sistema Inteligente de Gestión Educativa y Rendimiento Académico.

### 12.2 Propuesta de valores del producto

| Valor | Descripción |
|---|---|
| **Fidelidad normativa** | Cada cálculo, cada campo y cada documento sigue exactamente las reglas del MINERD |
| **Simplicidad para el docente** | La interfaz reproduce el flujo que el docente ya conoce del registro físico |
| **Precisión absoluta** | Cero errores de cálculo gracias al motor automático |
| **Velocidad** | Lo que hoy toma horas se hace en segundos |
| **Escalabilidad** | Diseñado para crecer desde un centro hasta una red de centros educativos |

### 12.3 Slogan propuesto

> *"El registro que ya conoces, en la herramienta que necesitas."*

### 12.4 Stack tecnológico recomendado

Basado en los requisitos del sistema, las competencias típicas del equipo de desarrollo en República Dominicana y la necesidad de escalabilidad futura:

| Capa | Tecnología | Justificación |
|---|---|---|
| **Base de datos** | PostgreSQL | Robusta, gratuita, soporte completo a integridad relacional, ideal para cálculos complejos |
| **Backend** | Python + FastAPI | Alto rendimiento, código limpio, ideal para APIs REST y futuro módulo de IA |
| **Frontend** | React + TypeScript | Amplia comunidad, componentes reutilizables, rendimiento UI óptimo |
| **Generación PDF** | WeasyPrint / ReportLab | Generación de documentos PDF de alta fidelidad desde Python |
| **Exportación Excel** | OpenPyXL / Pandas | Exportación limpia de datos para Power BI |
| **Analítica** | Power BI (integración) | Herramienta accesible para directores sin necesidad de conocimientos técnicos |
| **IA (futuro)** | Python + Scikit-Learn + Pandas | Modelos de predicción de riesgo académico |
| **Autenticación** | JWT + bcrypt | Estándar seguro para autenticación web |
| **Infraestructura** | Docker + servidor VPS o nube | Portabilidad y escalabilidad sencilla |

#### ¿Por qué este stack y no otros?

**¿Por qué no Django en lugar de FastAPI?**
FastAPI es más moderno, más rápido y produce APIs RESTful más limpias. Además, cuando se implemente el módulo de IA, el mismo ecosistema de Python facilitará la integración. Django es una buena opción, pero su ORM y su estructura MVC agregan complejidad innecesaria para este tipo de API.

**¿Por qué PostgreSQL y no MySQL?**
PostgreSQL tiene soporte nativo para tipos de datos complejos, mejor manejo de integridad referencial y mejor rendimiento en consultas analíticas, lo cual es crítico para los reportes académicos y la futura capa de IA.

**¿Por qué React y no Vue.js o Angular?**
React tiene mayor ecosistema de componentes para tablas de datos (ag-Grid, React Table), que son la interfaz principal de SIGERA. También tiene mayor comunidad de desarrolladores en la región para facilitar el mantenimiento futuro.

---

## 13. Glosario de Términos

| Término | Definición |
|---|---|
| **SIGERA** | Sistema Inteligente de Gestión Educativa y Rendimiento Académico |
| **MINERD** | Ministerio de Educación de la República Dominicana |
| **Registro de Grado** | Documento oficial donde el docente registra todos los datos académicos del estudiante durante el año escolar |
| **Boletín de Calificaciones** | Documento entregado al estudiante con el resumen de sus calificaciones por período |
| **Competencia específica** | Habilidad o capacidad particular que el estudiante debe desarrollar en una asignatura |
| **Competencia fundamental** | Capacidad transversal que atraviesa todas las asignaturas del currículo (hay 7, agrupadas en 4 promedios) |
| **Período** | Unidad temporal de evaluación del año escolar (P1, P2, P3, P4) |
| **Recuperación pedagógica (RP)** | Proceso de refuerzo y nueva evaluación para estudiantes que no alcanzaron 70 puntos en un período |
| **Completiva** | Evaluación que aplica cuando CF < 70. Fórmula: **50% CF + 50% CEC** |
| **Extraordinaria** | Evaluación que aplica si no aprueba la Completiva. Fórmula: **30% CF + 70% CEX** |
| **Evaluación Especial** | Oportunidad adicional para estudiantes con **1 ó 2 asignaturas** aplazadas post-extraordinaria, antes del inicio del próximo año escolar |
| **CF** | Calificación Final del área: promedio de los 4 períodos `(P1+P2+P3+P4)/4` |
| **CEC** | Calificación de la Evaluación Completiva |
| **CCF** | Calificación Completiva Final: resultado del proceso completivo |
| **CEX** | Calificación de la Evaluación Extraordinaria |
| **CEXF** | Calificación Extraordinaria Final: resultado del proceso extraordinario |
| **PC1** | Promedio de Competencia 1: Competencia Comunicativa |
| **PC2** | Promedio de Competencia 2: Pensamiento Lógico, Creativo y Crítico + Resolución de Problemas |
| **PC3** | Promedio de Competencia 3: Científica y Tecnológica + Ambiental y de la Salud |
| **PC4** | Promedio de Competencia 4: Ética y Ciudadana + Desarrollo Personal y Espiritual |
| **Logrado** | Nivel de desempeño 77–88 (segundo nivel más alto, según Ordenanza 04-2023) |
| **RNE** | Registro Nacional del Estudiante — identificador único oficial |
| **SIGERD** | Sistema de Información para la Gestión Educativa de la República Dominicana (sistema nacional del MINERD) |
| **Tanda** | Turno escolar (matutino, vespertino, nocturno) |
| **Sección** | División de un grado con un grupo específico de estudiantes |
| **Salida Optativa** | Décima asignatura del Segundo Ciclo (4.º–6.º grado). Varía según el centro educativo |
| **DAF** | Documento de Arquitectura Funcional |
| **API REST** | Interfaz de programación de aplicaciones de estilo arquitectónico REST |
| **JWT** | JSON Web Token — estándar de autenticación |
| **PDF** | Portable Document Format — formato de documento electrónico |

---

## 14. Referencias Normativas

| Documento | Tipo | Aplicabilidad |
|---|---|---|
| Ley 66-97 | Ley nacional | Marco legal general |
| **Ordenanza 04-2023** | Ordenanza MINERD | **Base principal.** Motor de cálculo académico completo (modalidad académica regular) |
| Ordenanza 03-2024 | Ordenanza MINERD | Solo referencia: currículo modalidad adultos |
| Ordenanza 04-2024 | Ordenanza MINERD | Solo referencia: evaluación modalidad adultos |
| Registro de Grado — 6.º grado (Sec. Académica) | Documento oficial MINERD | Modelo de datos y estructura principal |
| Boletín de Calificaciones — 1.º y 6.º grado | Documento oficial MINERD | Modelo de reporte al estudiante |
| Calendario Escolar 2025-2026 | Calendario MINERD | Estructura temporal del año escolar |
| Registro-2DO B.xlsx | Registro en uso real | Validación del flujo real del docente |

---

## Historial de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| 1.0 | Agosto 2026 | Equipo SIGERA | Primera versión del Capítulo 1 |
| 1.1 | Agosto 2026 | Equipo SIGERA | Correcciones legales: nota mínima 70, nivel ‘Logrado’, modalidad académica regular, Evaluación Especial, Salida Optativa solo 4to–6to, PC1–PC4, glosario ampliado |

---

*Este documento forma parte del Documento de Arquitectura Funcional (DAF) de SIGERA y debe leerse en conjunto con los demás capítulos del DAF.*

**Siguiente capítulo:** [Capítulo 2 — Arquitectura del Negocio](./SIGERA_DAF_Cap2_Arquitectura_Negocio.md)

---
*© 2026 SIGERA — Todos los derechos reservados*
