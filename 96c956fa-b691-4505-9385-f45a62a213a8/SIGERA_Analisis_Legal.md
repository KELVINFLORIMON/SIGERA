# Informe Técnico Legal — SIGERA
## Análisis de la Base Legal del Sistema Educativo Dominicano
### Modalidad Académica — Nivel Secundario

**Fuente:** Ordenanza 04-2023, Registro de Grado 6to Año (Sec. Académica), Boletines oficiales, Calendario 2025-2026  
**Fecha de análisis:** Agosto 2026  
**Propósito:** Ajustar los 8 capítulos del DAF de SIGERA con los datos legales exactos

---

## SECCIÓN A: ESCALA DE CALIFICACIONES

- **Rango numérico:** 0 a 100 puntos (Ordenanza 04-2023, Art. 47)
- **Nota mínima de aprobación:** **70 puntos** ← (CORRECCIÓN: el DAF usaba 65)
- **Formato:** Se utilizan exclusivamente valores numéricos (sin letras)
- **Niveles de desempeño con rangos EXACTOS** (Art. 47, Pág. 20):

| Nivel | Rango | Descripción |
|---|---|---|
| **Desempeño Destacado** | 89 – 100 | El estudiante ha alcanzado un desempeño destacado con relación a los aspectos evaluados |
| **Logrado** | 77 – 88 | El estudiante ha logrado, en general, los aprendizajes esperados |
| **En Proceso** | 65 – 76 | El estudiante aún se encuentra en proceso, mostrando un logro muy básico |
| **Insuficiente** | 0 – 64 | El estudiante ha alcanzado un desempeño insuficiente |

> ⚠️ **CORRECCIÓN AL DAF:** El nivel "Satisfactorio" no existe en la Ordenanza. El nombre correcto es **"Logrado"** (77-88). Además, el rango de "Insuficiente" va hasta 64 (no hasta 64), ya que la nota mínima de aprobación es 70, no 65.

---

## SECCIÓN B: ESTRUCTURA DE PERÍODOS EVALUATIVOS

- **Número de períodos:** 4 (cuatro) — Art. 12
- **Denominación:** Primer reporte (P1), Segundo reporte (P2), Tercer reporte (P3), Cuarto reporte (P4)
- **Peso de cada período:** Todos los períodos tienen **el mismo peso** (25% cada uno)
- **Fórmula de la Calificación Final:**

```
CF = (P1 + P2 + P3 + P4) / 4
```

> Si algún período tiene nota de recuperación (RP), se usa RP en lugar de P para ese período:
```
CF = (RP1 + P2 + P3 + P4) / 4   ← ejemplo si hubo RP en P1
```

---

## SECCIÓN C: RECUPERACIÓN PEDAGÓGICA — REGLAS EXACTAS

- **¿Cuándo aplica?** Cuando el estudiante obtiene calificaciones **por debajo de 70 puntos** al final de un período (Art. 48)
- **¿Cuándo se realiza?** En el tiempo establecido **entre cada período**. La recuperación del 4to período se realiza **antes de las evaluaciones completivas** (Art. 48, Párrafo I y II)
- **¿Cómo funciona?** La nota de recuperación (RP) tiene valor complementario. La casilla RP en el registro contiene la **sumatoria del período más lo obtenido en el proceso de recuperación** — esta suma es la calificación final del período

```
Nota efectiva del período = RP (si RP > P, se usa RP; de lo contrario, se mantiene P)
```

- **¿Puede bajar la nota original?** No. El valor es complementario; nunca puede disminuir la nota del período
- **En el registro de grado:** Aparece como sub-columna (RP) paralela a cada período (P)

> ⚠️ **CORRECCIÓN AL DAF:** La fórmula original en el DAF decía `MAX(P, RP)` lo cual es funcionalmente correcto. Sin embargo, la Ordenanza describe la RP como "sumatoria complementaria" — en la práctica, si hay RP, siempre reemplaza al P para el cálculo, siendo siempre >= P. El comportamiento `MAX(P, RP)` es válido.

---

## SECCIÓN D: EVALUACIÓN COMPLETIVA — REGLAS EXACTAS

- **¿Cuándo aplica?** Cuando la Calificación Final (CF) de **una o más asignaturas** sea inferior a **70 puntos** luego de los procesos de recuperación (Art. 51)
- **Base:** Se toma la **Calificación Final (CF) del año** como base (no la del último período)
- **Fórmula exacta** (Art. 51, Párrafo I):

```
C.C.F = (CF × 0.50) + (CEC × 0.50)
```

Donde:
- `CF` = Calificación Final del año (promedio de los 4 períodos)
- `CEC` = Calificación de la Evaluación Completiva (nota obtenida en la prueba)
- `C.C.F` = Calificación Completiva Final

- **Resultado:** Si `C.C.F ≥ 70` → Asignatura **Aprobada**. Si `C.C.F < 70` → Pasa a Extraordinaria

> ⚠️ **CORRECCIÓN AL DAF:** El DAF usaba la ponderación **60% CF + 40% Completiva**. La Ordenanza 04-2023 establece **50% CF + 50% CEC**.

---

## SECCIÓN E: EVALUACIÓN EXTRAORDINARIA — REGLAS EXACTAS

- **¿Cuándo aplica?** Cuando el estudiante no aprueba la asignatura en la evaluación completiva (Art. 52)
- **Fórmula exacta:**

```
C.EX.F = (CF × 0.30) + (CEX × 0.70)
```

Donde:
- `CF` = Calificación Final del año
- `CEX` = Calificación de la Evaluación Extraordinaria
- `C.EX.F` = Calificación Extraordinaria Final

- **Resultado:** Si `C.EX.F ≥ 70` → Asignatura **Aprobada**. Si `C.EX.F < 70` → Asignatura **Aplazada**

> ⚠️ **CORRECCIÓN AL DAF:** El DAF tenía las ponderaciones como indefinidas ("P1, P2, P3 a confirmar"). Ahora están confirmadas: **30% CF + 70% CEX**.

---

## SECCIÓN F: CRITERIOS DE PROMOCIÓN

| Situación | Regla | Base legal |
|---|---|---|
| **Promovido** | Aprueba TODAS las asignaturas (CF, Completiva o Extraordinaria ≥ 70) | Art. 54 |
| **Evaluación Especial** | Queda con 1 ó 2 asignaturas aplazadas post-extraordinaria → tiene derecho a Evaluación Especial antes o en los primeros 15 días del siguiente año escolar | Art. 53 |
| **Reprobado** | Reprueba **3 o más** asignaturas luego de las evaluaciones extraordinarias → Repite el grado | Art. 52 |

- **Asistencia:** Se requiere mínimo **70% de asistencia**. Si el estudiante no ha alcanzado un mínimo de 70% de asistencia y excusas a clases justificadas, su condición se evalúa con un equipo multidisciplinar (equipo de gestión, docente encargada y docentes de áreas) para establecer acciones de mejora o definir su permanencia.
- **Evaluación Especial:** (Art. 13 Párrafo III)
> ⚠️ **CORRECCION AL DAF:** Faltaba el estado **"EVALUACION_ESPECIAL"** en los ENUMs de `situacion_final`. También faltaba la regla del 70% de asistencia mínima con el equipo multidisciplinar.

---

## SECCIÓN G: ASIGNATURAS POR GRADO — MODALIDAD ACADÉMICA

### Primer Ciclo (1ro, 2do, 3er grado)

| N° | Asignatura | Código |
|---|---|---|
| 1 | Lengua Española | LES |
| 2 | Lengua Extranjera: Inglés | ING |
| 3 | Lengua Extranjera: Francés | FRA |
| 4 | Matemática | MAT |
| 5 | Ciencias Sociales | CSO |
| 6 | Ciencias de la Naturaleza | CNT |
| 7 | Educación Artística | EAR |
| 8 | Educación Física | EFI |
| 9 | Formación Integral Humana y Religiosa | FIHR |

### Segundo Ciclo (4to, 5to, 6to grado)

Las mismas 9 asignaturas del Primer Ciclo, más:

| N° | Asignatura | Código | Nota |
|---|---|---|---|
| 10 | **Salida Optativa** | OPT | Varía según el centro: Humanidades y Lenguas Modernas, Matemática y Tecnología, Ciencias y Tecnología, o Humanidades y Ciencias Sociales |

> En 6to grado, Ciencias de la Naturaleza puede subdividirse (ej. Física como componente específico).

---

## SECCIÓN H: COMPETENCIAS ESPECÍFICAS POR ASIGNATURA

Las competencias se organizan en **7 Competencias Fundamentales** que se evalúan en **4 Promedios de Competencias** (PC):

| Código | Promedio de Competencia | Competencias Fundamentales que agrupa |
|---|---|---|
| PC1 | Comunicativa | Competencia Comunicativa |
| PC2 | Pensamiento y Resolución | Pensamiento Lógico, Creativo y Crítico + Resolución de Problemas |
| PC3 | Científica y Ambiental | Científica y Tecnológica + Ambiental y de la Salud |
| PC4 | Ética y Personal | Ética y Ciudadana + Desarrollo Personal y Espiritual |

**Estructura de columnas en el registro de grado:**
```
Para cada asignatura:
P1 | RP1 | P2 | RP2 | P3 | RP3 | P4 | RP4 | PC1 | PC2 | PC3 | PC4 | CF | CEC | CCF | CEX | CEXF | CE | A/R
```

> **Nota importante:** Los descriptores e indicadores de logro de cada PC varían por grado y por asignatura, aunque las 4 agrupaciones macro son las mismas para todas.

---

## SECCIÓN I: ESTRUCTURA DEL REGISTRO DE GRADO OFICIAL

El Registro de Grado de la Sección Académica tiene las siguientes secciones:

1. **Datos del Centro Educativo**
2. **Nómina de Estudiantes** — con campos:
   - Número de orden
   - Nombres y apellidos
   - Sexo
   - Fecha de nacimiento (con Libro, Folio y Año del acta)
   - Cédula
   - RNE (Registro Nacional del Estudiante)
   - Edad
   - Localidad
3. **Datos de Contacto y Emergencia** (padre, madre, tutor con teléfonos)
4. **Registro de Asistencia** (por mes)
5. **Especificaciones Curriculares** — Calificaciones por asignatura con todas las columnas (P1, RP1, P2, RP2... CF, CEC, CCF, CEX, CEXF, CE, A/R)
6. **Promedios de Competencias** (PC1, PC2, PC3, PC4)
7. **Acta de Rendimiento** — Resumen oficial con totales
8. **Estadísticas Finales** — Cuadro con:
   - Aprobados (por sexo y edad: Precocidad, Edad teórica, Rezago)
   - Repitentes
   - En Abandono/Retiro

---

## SECCIÓN J: ESTRUCTURA DEL BOLETÍN OFICIAL

### Encabezado:
- Año escolar, Sección, Número de orden
- Nombres, Apellidos
- ID del estudiante (SIGERD)
- Docente, Centro Educativo, Código MINERD
- Tanda, Teléfono del centro
- Distrito, Regional, Provincia, Municipio

### Cuerpo — Notas mostradas por asignatura:

| Asignatura | P1 | P2 | P3 | P4 | CF | Comp. | Extra. | Especial | Situación |
|---|---|---|---|---|---|---|---|---|---|
| Lengua Española | | | | | | | | | A/R |
| Inglés | | | | | | | | | A/R |
| Francés | | | | | | | | | A/R |
| Matemática | | | | | | | | | A/R |
| CC. Sociales | | | | | | | | | A/R |
| CC. Naturaleza | | | | | | | | | A/R |
| Ed. Artística | | | | | | | | | A/R |
| Ed. Física | | | | | | | | | A/R |
| FIHR | | | | | | | | | A/R |
| Salida Optativa* | | | | | | | | | A/R |

*Solo en 4to, 5to y 6to grado

### Lo que NO muestra el boletín:
- ❌ Notas de recuperación (RP) — solo aparece en el Registro de Grado
- ❌ Niveles de desempeño cualitativos — solo muestra valores numéricos
- ❌ Promedios de Competencias (PC1-PC4)

---

## SECCIÓN K: CALENDARIO ESCOLAR 2025-2026

| Hito | Fecha |
|---|---|
| Inicio docentes | 4 de agosto de 2025 |
| Inicio estudiantes | 25 de agosto de 2025 |
| **Entrega P1** | 30 de octubre de 2025 |
| **Entrega P2** | 30 de enero de 2026 |
| **Entrega P3** | 24 de marzo de 2026 |
| **Entrega P4** | 12 de junio de 2026 |
| Fin año escolar (estudiantes) | 19 de junio de 2026 |
| Fin año escolar (docentes) | 26 de junio de 2026 |
| Evaluaciones Completivas | Inmediatamente después del cierre P4 (junio) |
| Evaluaciones Extraordinarias | Después de las completivas (julio) |
| Evaluación Especial | Antes del inicio o primeros 15 días del año 2026-2027 |

### Días de asueto relevantes:
- Navidad: 19 dic 2025 al 6 ene 2026
- Semana Santa: 30 mar al 5 abr 2026
- 24 sep (Merced), 6 nov (Constitución), 26 ene (Duarte), 27 feb (Independencia), 1 may (Trabajo)

---

## SECCIÓN L: DISCREPANCIAS CON EL DAF DE SIGERA

| # | Elemento | DAF Original | Corrección (Ordenanza 04-2023) | Capítulos afectados |
|---|---|---|---|---|
| 1 | **Nota mínima de aprobación** | 65 puntos | **70 puntos** | Cap 2, 3, 4, 5 |
| 2 | **Nivel "Satisfactorio"** | Rango 77-88 | **"Logrado"** (rango 77-88) | Cap 3, 4, 5, 6 |
| 3 | **Fórmula Completiva** | 60% CF + 40% CEC | **50% CF + 50% CEC** | Cap 3, 5 |
| 4 | **Fórmula Extraordinaria** | Ponderaciones indefinidas | **30% CF + 70% CEX** | Cap 3, 5 |
| 5 | **Estado "Evaluación Especial"** | No existía | **EVALUACION_ESPECIAL** (1-2 asignaturas aplazadas post-extra) | Cap 2, 4 |
| 6 | **Regla de Reprobación** | Indefinida | **3 o más asignaturas** = repite grado | Cap 2, 3 |
| 7 | **Asistencia mínima** | No documentada | **70% mínimo** - genera evaluación multidisciplinar | Cap 2, 3, 4 |
| 8 | **Salida Optativa** | Para todos los grados | **Solo 4to, 5to y 6to** | Cap 4 |
| 9 | **Promedios de Competencias** | CE1-CE7 individuales | **4 grupos PC1-PC4** (7 competencias agrupadas) | Cap 3, 4 |
| 10 | **Datos del estudiante** | Faltaban Libro/Folio/Año del acta | Campos requeridos en el Registro | Cap 4 |
| 11 | **Boletín muestra RP** | No especificado | El boletín NO muestra RP — solo el Registro | Cap 3, 6 |
| 12 | **Situacion_final ENUM** | Faltaba EVALUACION_ESPECIAL | Agregar estado | Cap 4 |

---

## SECCIÓN M: RECOMENDACIONES DE AJUSTE POR CAPÍTULO

### Capítulo 2 — Arquitectura del Negocio
- Corregir todas las referencias a "nota mínima 65" → **70**
- Agregar la **Evaluación Especial** como proceso entre extraordinaria y nuevo año
- Agregar regla: **3 o más asignaturas reprobadas post-extraordinaria = repite grado**
- Agregar proceso: **control de asistencia** (alerta al 15%, bloqueo al 20%)
- Corregir regla de negocio sobre el número de asignaturas para completiva

### Capítulo 3 — Arquitectura Funcional
- Motor de cálculo: cambiar umbral de 65 a **70** en todas las funciones
- Corregir `calificacion_completiva`: **50% CF + 50% CEC** (no 60/40)
- Definir fórmula extraordinaria: **30% CF + 70% CEX**
- Agregar nivel **"Logrado"** (eliminar "Satisfactorio")
- Agregar pantalla de **Evaluación Especial**
- Ajustar tabla de calificaciones para mostrar **PC1-PC4** en lugar de CE1-CE7

### Capítulo 4 — Arquitectura de Datos
- ENUM `situacion_final`: añadir **EVALUACION_ESPECIAL**
- ENUM `nivel_desempeno`: cambiar SATISFACTORIO → **LOGRADO**
- Tabla `estudiante`: añadir campos `libro_acta`, `folio_acta`, `anio_acta`
- Tabla `calificacion_periodo`: añadir columnas `nota_especial`, `calificacion_especial`
- Tabla `asignatura` + `grado_asignatura`: Salida Optativa solo en grados 4, 5 y 6
- Fórmulas GENERATED: ajustar umbral de 65 → **70**
- Agregar tabla o campo para `porcentaje_asistencia`
- Catálogo de competencias: usar estructura **PC1-PC4** (no CE1-CE7)

### Capítulo 5 — Arquitectura de Software
- `MotorCalculo.NOTA_MINIMA`: cambiar de 65 → **70**
- `calificacion_completiva()`: usar `(CF * 0.50) + (CEC * 0.50)`
- `calificacion_extraordinaria()`: usar `(CF * 0.30) + (CEX * 0.70)`
- Agregar método `calificacion_especial()`
- Agregar endpoint: `PATCH /calificaciones/{id}/especial`
- Agregar lógica de validación de asistencia en la promoción

### Capítulo 6 — Reportes y Power BI
- Renombrar nivel "Satisfactorio" → **"Logrado"** en todos los reportes y DAX
- Ajustar KPI de riesgo académico: estudiantes con promedio < **70** (no < 65)
- Agregar reporte **R-13b: Evaluaciones Especiales** (lista de estudiantes con 1-2 materias aplazadas)
- Dataset Power BI: actualizar campo `nivel_desempeno` con valor "LOGRADO"

### Capítulos 7 y 8
- Cap 7 (IA): Ajustar el umbral del modelo predictivo de riesgo a **70** como nota de corte
- Cap 8 (Plan): Agregar en el roadmap la configuración de las **Evaluaciones Especiales** como proceso adicional en la Etapa 1

---

*Informe generado en base al análisis de la Ordenanza 04-2023 (Arts. 12, 14, 47, 48, 49, 50, 51, 52, 53, 54), el Registro de Grado oficial de Secundaria Académica y el Calendario Escolar 2025-2026 del MINERD.*
